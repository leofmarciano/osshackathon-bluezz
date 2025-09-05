import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Bucket } from "encore.dev/storage/objects";
import log from "encore.dev/log";

// Initialize database
const db = new SQLDatabase("companies", {
  migrations: "./migrations",
});

// Create bucket for company documents
export const companyDocuments = new Bucket("company-documents", {
  versioned: false,
  public: false // Documents should be private, accessed via signed URLs
});

// Types
interface CompanyDocument {
  id: number;
  company_id: number;
  document_type: "legal" | "financial" | "reports" | "certificates" | "other";
  file_name: string;
  file_key: string; // Key in the bucket (unique identifier)
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: Date;
  is_public: boolean;
}

interface UploadDocumentRequest {
  company_id: number;
  document_type: "legal" | "financial" | "reports" | "certificates" | "other";
  file_name: string;
  data: string; // base64 encoded
  mime_type: string;
}

interface UploadDocumentResponse {
  document: CompanyDocument;
  message: string;
}

interface GetDocumentsRequest {
  company_id: number;
  document_type?: string;
}

interface GetDocumentsResponse {
  documents: CompanyDocument[];
}

interface GetDocumentUrlResponse {
  url: string;
  expires_in: number;
}

interface DeleteDocumentResponse {
  success: boolean;
  message: string;
}

// Helper function to check if user is company owner
async function isCompanyOwner(companyId: number, userId: string): Promise<boolean> {
  const company = await db.queryRow<{ owner_id: string }>`
    SELECT owner_id FROM companies WHERE id = ${companyId}
  `;
  return company?.owner_id === userId;
}

// Helper function to generate unique file key
function generateFileKey(companyId: number, fileName: string): string {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `company-${companyId}/${timestamp}-${safeName}`;
}

// API: Upload a document (only company owner)
export const uploadDocument = api(
  { expose: true, auth: true, method: "POST", path: "/companies/:company_id/documents" },
  async (req: UploadDocumentRequest): Promise<UploadDocumentResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Check if user is the company owner
      const isOwner = await isCompanyOwner(req.company_id, authData.userID);
      if (!isOwner) {
        throw APIError.permissionDenied("Only company owners can upload documents");
      }

      // Validate file size (max 10MB)
      const fileBuffer = Buffer.from(req.data, 'base64');
      const fileSize = fileBuffer.length;
      
      if (fileSize > 10 * 1024 * 1024) {
        throw APIError.invalidArgument("File size must be less than 10MB");
      }

      // Validate mime type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];

      if (!allowedTypes.includes(req.mime_type)) {
        throw APIError.invalidArgument("File type not allowed");
      }

      // Generate unique file key
      const fileKey = generateFileKey(req.company_id, req.file_name);

      // Upload to bucket
      await companyDocuments.upload(fileKey, fileBuffer, {
        contentType: req.mime_type,
      });

      // Save document metadata to database
      const document = await db.queryRow<CompanyDocument>`
        INSERT INTO company_documents (
          company_id, document_type, file_name, file_key, 
          file_size, mime_type, uploaded_by, is_public
        ) VALUES (
          ${req.company_id}, ${req.document_type}, ${req.file_name}, ${fileKey},
          ${fileSize}, ${req.mime_type}, ${authData.userID}, false
        )
        RETURNING *
      `;

      if (!document) {
        // Rollback: delete from bucket
        await companyDocuments.remove(fileKey);
        throw APIError.internal("Failed to save document metadata");
      }

      return {
        document,
        message: "Document uploaded successfully"
      };
    } catch (error) {
      log.error("Failed to upload document", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to upload document");
    }
  }
);

// API: Get documents for a company (authenticated users only)
export const getDocuments = api(
  { expose: true, auth: true, method: "GET", path: "/companies/:company_id/documents" },
  async (req: GetDocumentsRequest): Promise<GetDocumentsResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Check if company exists
      const company = await db.queryRow<{ id: number }>`
        SELECT id FROM companies WHERE id = ${req.company_id}
      `;

      if (!company) {
        throw APIError.notFound("Company not found");
      }

      // Get documents with optional filter
      let query;
      if (req.document_type) {
        query = db.query<CompanyDocument>`
          SELECT * FROM company_documents 
          WHERE company_id = ${req.company_id} AND document_type = ${req.document_type}
          ORDER BY uploaded_at DESC
        `;
      } else {
        query = db.query<CompanyDocument>`
          SELECT * FROM company_documents 
          WHERE company_id = ${req.company_id}
          ORDER BY uploaded_at DESC
        `;
      }

      const documents: CompanyDocument[] = [];
      for await (const doc of query) {
        documents.push(doc);
      }

      return { documents };
    } catch (error) {
      log.error("Failed to get documents", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to get documents");
    }
  }
);

// API: Get signed URL for document download (authenticated users only)
export const getDocumentUrl = api(
  { expose: true, auth: true, method: "GET", path: "/documents/:document_id/url" },
  async ({ document_id }: { document_id: number }): Promise<GetDocumentUrlResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Get document metadata
      const document = await db.queryRow<CompanyDocument>`
        SELECT * FROM company_documents WHERE id = ${document_id}
      `;

      if (!document) {
        throw APIError.notFound("Document not found");
      }

      // Generate signed URL with 1 hour expiration
      const ttl = 3600; // 1 hour in seconds
      const signedUrl = await companyDocuments.signedDownloadUrl(document.file_key, { ttl });

      return {
        url: signedUrl.url,
        expires_in: ttl
      };
    } catch (error) {
      log.error("Failed to get document URL", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to get document URL");
    }
  }
);

// API: Delete a document (only company owner)
export const deleteDocument = api(
  { expose: true, auth: true, method: "DELETE", path: "/documents/:document_id" },
  async ({ document_id }: { document_id: number }): Promise<DeleteDocumentResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Get document and check ownership
      const document = await db.queryRow<{ id: number; company_id: number; file_key: string }>`
        SELECT id, company_id, file_key FROM company_documents WHERE id = ${document_id}
      `;

      if (!document) {
        throw APIError.notFound("Document not found");
      }

      // Check if user is the company owner
      const isOwner = await isCompanyOwner(document.company_id, authData.userID);
      if (!isOwner) {
        throw APIError.permissionDenied("Only company owners can delete documents");
      }

      // Delete from bucket
      try {
        await companyDocuments.remove(document.file_key);
      } catch (error) {
        log.warn("Failed to delete file from bucket", error as Error);
        // Continue even if bucket deletion fails
      }

      // Delete from database
      await db.exec`
        DELETE FROM company_documents WHERE id = ${document_id}
      `;

      return {
        success: true,
        message: "Document deleted successfully"
      };
    } catch (error) {
      log.error("Failed to delete document", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to delete document");
    }
  }
);

// API: Get signed URL for direct upload (only company owner)
export const getUploadUrl = api(
  { expose: true, auth: true, method: "POST", path: "/companies/:company_id/documents/upload-url" },
  async (req: { company_id: number; file_name: string; mime_type: string }): Promise<{ url: string; file_key: string; expires_in: number }> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Check if user is the company owner
      const isOwner = await isCompanyOwner(req.company_id, authData.userID);
      if (!isOwner) {
        throw APIError.permissionDenied("Only company owners can upload documents");
      }

      // Generate unique file key
      const fileKey = generateFileKey(req.company_id, req.file_name);

      // Generate signed upload URL with 30 minutes expiration
      const ttl = 1800; // 30 minutes in seconds
      const url = await companyDocuments.signedUploadUrl(fileKey, { ttl });

      return {
        url,
        file_key: fileKey,
        expires_in: ttl
      };
    } catch (error) {
      log.error("Failed to get upload URL", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to get upload URL");
    }
  }
);