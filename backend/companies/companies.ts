import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import log from "encore.dev/log";
import { clerkClient } from "../auth/auth";

// Initialize database
const db = new SQLDatabase("companies", {
  migrations: "./migrations",
});

// Types
interface Company {
  id: number;
  name: string;
  type: "ngo" | "company";
  registration_number: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  description: string;
  mission: string;
  impact: string;
  target_audience?: string;
  owner_id: string;
  status: "pending" | "approved" | "rejected";
  is_non_profit: boolean;
  voting_start_date?: Date;
  voting_end_date?: Date;
  voting_ends_at?: string;
  votes_yes: number;
  votes_no: number;
  votes_abstain: number;
  created_at: Date;
  updated_at: Date;
  approved_at?: Date;
}

interface CompanyDocument {
  id: number;
  company_id: number;
  document_type: "legal" | "financial" | "reports" | "certificates" | "other";
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type?: string;
  uploaded_at: Date;
}

interface CompanyImage {
  id: number;
  company_id: number;
  image_url: string;
  image_type?: string;
  is_primary: boolean;
  uploaded_at: Date;
}

interface CompanyProfile {
  id: number;
  company_id: number;
  presentation?: string;
  logo_url?: string;
  cover_image_url?: string;
  social_media?: Record<string, string>;
  team_members?: any[];
  statistics?: Record<string, any>;
  updated_at: Date;
}

// API Request/Response types
interface RegisterCompanyRequest {
  name: string;
  type: "ngo" | "company";
  registration_number: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  description: string;
  mission: string;
  impact: string;
  target_audience?: string;
  is_non_profit: boolean;
  documents?: {
    filename: string;
    data: string; // base64 encoded
    document_type: string;
  }[];
  images?: {
    filename: string;
    data: string; // base64 encoded
  }[];
}

interface RegisterCompanyResponse {
  company: Company;
  message: string;
}

interface GetCompaniesRequest {
  status?: "pending" | "approved" | "rejected";
  type?: "ngo" | "company";
  category?: string;
  owner_id?: string;
  limit?: number;
  offset?: number;
}

interface GetCompaniesResponse {
  companies: (Company & {
    documents?: CompanyDocument[];
    images?: CompanyImage[];
    profile?: CompanyProfile;
  })[];
  total: number;
}

interface GetCompanyRequest {
  id: number;
}

interface GetCompanyResponse {
  company: Company;
  documents: CompanyDocument[];
  images: CompanyImage[];
  profile?: CompanyProfile;
  can_edit: boolean;
}

interface UpdateCompanyRequest {
  id: number;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  description?: string;
  mission?: string;
  impact?: string;
  target_audience?: string;
}

interface UpdateCompanyResponse {
  company: Company;
  message: string;
}

interface UpdateCompanyProfileRequest {
  company_id: number;
  user_id: string;
  presentation?: string;
  logo_url?: string;
  cover_image_url?: string;
  social_media?: Record<string, string>;
  team_members?: any[];
  statistics?: Record<string, any>;
}

interface UpdateCompanyProfileResponse {
  profile: CompanyProfile;
  message: string;
}

interface VoteOnCompanyRequest {
  company_id: number;
  vote_type: "yes" | "no" | "abstain";
}

interface VoteOnCompanyResponse {
  message: string;
  votes: {
    yes: number;
    no: number;
    abstain: number;
  };
}

// API: Register a new company
export const registerCompany = api(
  { expose: true, auth: true, method: "POST", path: "/companies/register" },
  async (req: RegisterCompanyRequest): Promise<RegisterCompanyResponse> => {
    try {
      // Get authenticated user data
      const authData = getAuthData();
      
      if (!authData) {
        throw APIError.unauthenticated("Authentication required to register a company");
      }

      // Get user details from Clerk
      const user = await clerkClient.users.getUser(authData.userID);
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username || user.emailAddresses?.[0]?.emailAddress || "Unknown User";

      log.info("Registering company", { 
        user_id: authData.userID,
        company_name: req.name 
      });
      // Check if registration number already exists
      const existing = await db.queryRow<{ id: number }>`
        SELECT id FROM companies WHERE registration_number = ${req.registration_number}
      `;
      
      if (existing) {
        throw APIError.alreadyExists("Company with this registration number already exists");
      }

      // Start transaction
      await db.exec`BEGIN`;

      try {
        // Insert company with auth user as owner
        const companyResult = await db.queryRow<Company>`
          INSERT INTO companies (
            name, type, registration_number, category,
            email, phone, website,
            address, city, state, zip_code, country,
            description, mission, impact, target_audience,
            owner_id, is_non_profit,
            voting_end_date
          ) VALUES (
            ${req.name}, ${req.type}, ${req.registration_number}, ${req.category},
            ${req.email}, ${req.phone}, ${req.website || null},
            ${req.address}, ${req.city}, ${req.state || null}, ${req.zip_code || null}, ${req.country},
            ${req.description}, ${req.mission}, ${req.impact}, ${req.target_audience || null},
            ${authData.userID}, ${req.is_non_profit},
            NOW() + INTERVAL '7 days'
          )
          RETURNING *
        `;

        if (!companyResult) {
          throw APIError.internal("Failed to create company");
        }

        // Insert documents if provided
        if (req.documents && req.documents.length > 0) {
          for (const doc of req.documents) {
            // For now, store base64 in file_url field
            // In production, you'd upload to S3/storage and store the URL
            const fileSize = Math.ceil((doc.data.length * 3) / 4); // Approximate size from base64
            await db.exec`
              INSERT INTO company_documents (
                company_id, document_type, file_name, file_url, file_size, mime_type
              ) VALUES (
                ${companyResult.id}, ${doc.document_type}, ${doc.filename}, 
                ${`data:application/pdf;base64,${doc.data}`}, ${fileSize}, ${'application/pdf'}
              )
            `;
          }
        }

        // Insert images if provided (store base64 data)
        if (req.images && req.images.length > 0) {
          for (let i = 0; i < req.images.length; i++) {
            const img = req.images[i];
            // For now, store base64 in image_url field
            // In production, you'd upload to S3/storage and store the URL
            await db.exec`
              INSERT INTO company_images (
                company_id, image_url, image_type, is_primary
              ) VALUES (
                ${companyResult.id}, 
                ${`data:image/jpeg;base64,${img.data}`}, 
                ${'general'}, 
                ${i === 0}
              )
            `;
          }
        }

        // Create initial profile
        await db.exec`
          INSERT INTO company_profiles (company_id) 
          VALUES (${companyResult.id})
        `;

        // Commit transaction
        await db.exec`COMMIT`;

        log.info("Company registered successfully", { 
          company_id: companyResult.id, 
          name: req.name 
        });

        return {
          company: companyResult,
          message: "Company registered successfully and submitted for voting"
        };
      } catch (error) {
        // Rollback on error
        await db.exec`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      log.error("Failed to register company", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to register company");
    }
  }
);

// API: Get companies list
export const getCompanies = api(
  { expose: true, method: "GET", path: "/companies" },
  async (req: GetCompaniesRequest): Promise<GetCompaniesResponse> => {
    try {
      log.info("Getting companies", { request: req });
      
      const limit = req.limit || 20;
      const offset = req.offset || 0;
      
      let whereConditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (req.status) {
        whereConditions.push(`status = $${paramIndex++}`);
        params.push(req.status);
      }
      if (req.type) {
        whereConditions.push(`type = $${paramIndex++}`);
        params.push(req.type);
      }
      if (req.category) {
        whereConditions.push(`category = $${paramIndex++}`);
        params.push(req.category);
      }
      if (req.owner_id) {
        whereConditions.push(`owner_id = $${paramIndex++}`);
        params.push(req.owner_id);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Get companies with voting_end_date as voting_ends_at
      let companiesQuery;
      if (whereConditions.length > 0) {
        companiesQuery = db.query<Company>`
          SELECT *, voting_end_date::text as voting_ends_at FROM companies 
          WHERE ${whereConditions.join(' AND ')}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        companiesQuery = db.query<Company>`
          SELECT *, voting_end_date::text as voting_ends_at FROM companies 
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      const companiesArray: Company[] = [];
      for await (const company of companiesQuery) {
        companiesArray.push(company);
      }

      // Get total count
      let countResult;
      if (whereConditions.length > 0) {
        countResult = await db.queryRow<{ count: number }>`
          SELECT COUNT(*) as count FROM companies WHERE ${whereConditions.join(' AND ')}
        `;
      } else {
        countResult = await db.queryRow<{ count: number }>`
          SELECT COUNT(*) as count FROM companies
        `;
      }

      // Get additional data for each company
      const companiesWithDetails = await Promise.all(
        companiesArray.map(async (company) => {
          // Get documents
          const documents = await db.query<CompanyDocument>`
            SELECT * FROM company_documents WHERE company_id = ${company.id}
          `;
          const docsArray: CompanyDocument[] = [];
          for await (const doc of documents) {
            docsArray.push(doc);
          }

          // Get images
          const images = await db.query<CompanyImage>`
            SELECT * FROM company_images WHERE company_id = ${company.id}
          `;
          const imagesArray: CompanyImage[] = [];
          for await (const img of images) {
            imagesArray.push(img);
          }

          // Get profile
          const profile = await db.queryRow<CompanyProfile>`
            SELECT * FROM company_profiles WHERE company_id = ${company.id}
          `;

          return {
            ...company,
            documents: docsArray,
            images: imagesArray,
            profile: profile || undefined
          };
        })
      );

      return {
        companies: companiesWithDetails,
        total: countResult?.count || 0
      };
    } catch (error) {
      log.error("Failed to get companies - detailed error", { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw APIError.internal("Failed to get companies");
    }
  }
);

// API: Get single company details
export const getCompany = api(
  { expose: true, method: "GET", path: "/companies/:id" },
  async (req: GetCompanyRequest): Promise<GetCompanyResponse> => {
    try {
      const company = await db.queryRow<Company>`
        SELECT * FROM companies WHERE id = ${req.id}
      `;

      if (!company) {
        throw APIError.notFound("Company not found");
      }

      // Get documents
      const documents = await db.query<CompanyDocument>`
        SELECT * FROM company_documents WHERE company_id = ${req.id}
      `;
      const docsArray: CompanyDocument[] = [];
      for await (const doc of documents) {
        docsArray.push(doc);
      }

      // Get images
      const images = await db.query<CompanyImage>`
        SELECT * FROM company_images WHERE company_id = ${req.id}
      `;
      const imagesArray: CompanyImage[] = [];
      for await (const img of images) {
        imagesArray.push(img);
      }

      // Get profile
      const profile = await db.queryRow<CompanyProfile>`
        SELECT * FROM company_profiles WHERE company_id = ${req.id}
      `;

      // For now, we'll determine can_edit based on the request
      // In production, you'd get the current user from authentication
      const can_edit = false; // This should check if current user is the owner

      return {
        company,
        documents: docsArray,
        images: imagesArray,
        profile: profile || undefined,
        can_edit
      };
    } catch (error) {
      log.error("Failed to get company", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to get company");
    }
  }
);

// API: Update company (only owner can update)
export const updateCompany = api(
  { expose: true, method: "PUT", path: "/companies/:id" },
  async (req: UpdateCompanyRequest): Promise<UpdateCompanyResponse> => {
    try {
      // Check if company exists and user is the owner
      const company = await db.queryRow<Company>`
        SELECT * FROM companies WHERE id = ${req.id}
      `;

      if (!company) {
        throw APIError.notFound("Company not found");
      }

      if (company.owner_id !== req.user_id) {
        throw APIError.permissionDenied("Only the owner can edit this company");
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (req.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(req.name);
      }
      if (req.email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(req.email);
      }
      if (req.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(req.phone);
      }
      if (req.website !== undefined) {
        updates.push(`website = $${paramIndex++}`);
        values.push(req.website);
      }
      if (req.address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(req.address);
      }
      if (req.city !== undefined) {
        updates.push(`city = $${paramIndex++}`);
        values.push(req.city);
      }
      if (req.state !== undefined) {
        updates.push(`state = $${paramIndex++}`);
        values.push(req.state);
      }
      if (req.zip_code !== undefined) {
        updates.push(`zip_code = $${paramIndex++}`);
        values.push(req.zip_code);
      }
      if (req.country !== undefined) {
        updates.push(`country = $${paramIndex++}`);
        values.push(req.country);
      }
      if (req.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(req.description);
      }
      if (req.mission !== undefined) {
        updates.push(`mission = $${paramIndex++}`);
        values.push(req.mission);
      }
      if (req.impact !== undefined) {
        updates.push(`impact = $${paramIndex++}`);
        values.push(req.impact);
      }
      if (req.target_audience !== undefined) {
        updates.push(`target_audience = $${paramIndex++}`);
        values.push(req.target_audience);
      }

      if (updates.length === 0) {
        return {
          company,
          message: "No updates provided"
        };
      }

      // Add id to values
      values.push(req.id);

      const updateQuery = `
        UPDATE companies 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const updatedCompany = await db.queryRow<Company>(updateQuery, ...values);

      if (!updatedCompany) {
        throw APIError.internal("Failed to update company");
      }

      log.info("Company updated", { company_id: req.id });

      return {
        company: updatedCompany,
        message: "Company updated successfully"
      };
    } catch (error) {
      log.error("Failed to update company", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to update company");
    }
  }
);

// API: Update company profile (only owner can update)
export const updateCompanyProfile = api(
  { expose: true, method: "PUT", path: "/companies/:company_id/profile" },
  async (req: UpdateCompanyProfileRequest): Promise<UpdateCompanyProfileResponse> => {
    try {
      // Check if company exists and user is the owner
      const company = await db.queryRow<Company>`
        SELECT * FROM companies WHERE id = ${req.company_id}
      `;

      if (!company) {
        throw APIError.notFound("Company not found");
      }

      if (company.owner_id !== req.user_id) {
        throw APIError.permissionDenied("Only the owner can edit this company profile");
      }

      // Check if profile exists
      const existingProfile = await db.queryRow<CompanyProfile>`
        SELECT * FROM company_profiles WHERE company_id = ${req.company_id}
      `;

      let profile: CompanyProfile | null;

      if (existingProfile) {
        // Update existing profile
        profile = await db.queryRow<CompanyProfile>`
          UPDATE company_profiles
          SET 
            presentation = COALESCE(${req.presentation}, presentation),
            logo_url = COALESCE(${req.logo_url}, logo_url),
            cover_image_url = COALESCE(${req.cover_image_url}, cover_image_url),
            social_media = COALESCE(${JSON.stringify(req.social_media)}, social_media),
            team_members = COALESCE(${JSON.stringify(req.team_members)}, team_members),
            statistics = COALESCE(${JSON.stringify(req.statistics)}, statistics)
          WHERE company_id = ${req.company_id}
          RETURNING *
        `;
      } else {
        // Create new profile
        profile = await db.queryRow<CompanyProfile>`
          INSERT INTO company_profiles (
            company_id, presentation, logo_url, cover_image_url, 
            social_media, team_members, statistics
          ) VALUES (
            ${req.company_id}, 
            ${req.presentation || null},
            ${req.logo_url || null},
            ${req.cover_image_url || null},
            ${JSON.stringify(req.social_media) || '{}'},
            ${JSON.stringify(req.team_members) || '[]'},
            ${JSON.stringify(req.statistics) || '{}'}
          )
          RETURNING *
        `;
      }

      if (!profile) {
        throw APIError.internal("Failed to update company profile");
      }

      log.info("Company profile updated", { company_id: req.company_id });

      return {
        profile,
        message: "Company profile updated successfully"
      };
    } catch (error) {
      log.error("Failed to update company profile", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to update company profile");
    }
  }
);

// API: Vote on a company
export const voteOnCompany = api(
  { expose: true, auth: true, method: "POST", path: "/companies/:company_id/vote" },
  async (req: VoteOnCompanyRequest): Promise<VoteOnCompanyResponse> => {
    // Get authenticated user ID from auth
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required to vote");
    }
    const userId = authData.userID;
    try {
      // Check if company exists and is in voting period
      const company = await db.queryRow<Company>`
        SELECT * FROM companies WHERE id = ${req.company_id}
      `;

      if (!company) {
        throw APIError.notFound("Company not found");
      }

      if (company.status !== 'pending') {
        throw APIError.failedPrecondition("Company is not open for voting");
      }

      const now = new Date();
      if (now > new Date(company.voting_end_date)) {
        throw APIError.failedPrecondition("Voting period has ended");
      }

      // Start transaction
      await db.exec`BEGIN`;

      try {
        // Check if user has already voted
        const existingVote = await db.queryRow<{ vote_type: string }>`
          SELECT vote_type FROM company_votes 
          WHERE company_id = ${req.company_id} AND user_id = ${userId}
        `;

        if (existingVote) {
          // Update vote
          await db.exec`
            UPDATE company_votes
            SET vote_type = ${req.vote_type}, voted_at = CURRENT_TIMESTAMP
            WHERE company_id = ${req.company_id} AND user_id = ${userId}
          `;

          // Adjust vote counts
          if (existingVote.vote_type === 'yes') {
            await db.exec`UPDATE companies SET votes_yes = votes_yes - 1 WHERE id = ${req.company_id}`;
          } else if (existingVote.vote_type === 'no') {
            await db.exec`UPDATE companies SET votes_no = votes_no - 1 WHERE id = ${req.company_id}`;
          } else if (existingVote.vote_type === 'abstain') {
            await db.exec`UPDATE companies SET votes_abstain = votes_abstain - 1 WHERE id = ${req.company_id}`;
          }
        } else {
          // Insert new vote
          await db.exec`
            INSERT INTO company_votes (company_id, user_id, vote_type)
            VALUES (${req.company_id}, ${userId}, ${req.vote_type})
          `;
        }

        // Update vote count
        if (req.vote_type === 'yes') {
          await db.exec`UPDATE companies SET votes_yes = votes_yes + 1 WHERE id = ${req.company_id}`;
        } else if (req.vote_type === 'no') {
          await db.exec`UPDATE companies SET votes_no = votes_no + 1 WHERE id = ${req.company_id}`;
        } else if (req.vote_type === 'abstain') {
          await db.exec`UPDATE companies SET votes_abstain = votes_abstain + 1 WHERE id = ${req.company_id}`;
        }

        // Get updated vote counts
        const updatedCompany = await db.queryRow<Company>`
          SELECT votes_yes, votes_no, votes_abstain FROM companies WHERE id = ${req.company_id}
        `;

        // Check if voting period has ended or if we have enough votes to decide
        const totalVotes = (updatedCompany?.votes_yes || 0) + 
                          (updatedCompany?.votes_no || 0) + 
                          (updatedCompany?.votes_abstain || 0);
        
        // Auto-approve if more than 50% yes votes and at least 10 votes
        if (totalVotes >= 10 && updatedCompany) {
          const yesPercentage = (updatedCompany.votes_yes / totalVotes) * 100;
          if (yesPercentage > 50) {
            await db.exec`
              UPDATE companies 
              SET status = 'approved', approved_at = CURRENT_TIMESTAMP
              WHERE id = ${req.company_id}
            `;
            log.info("Company auto-approved", { 
              company_id: req.company_id, 
              yes_percentage: yesPercentage 
            });
          } else if (yesPercentage < 30 && totalVotes >= 20) {
            // Auto-reject if less than 30% approval with significant votes
            await db.exec`
              UPDATE companies 
              SET status = 'rejected'
              WHERE id = ${req.company_id}
            `;
            log.info("Company auto-rejected", { 
              company_id: req.company_id, 
              yes_percentage: yesPercentage 
            });
          }
        }

        // Commit transaction
        await db.exec`COMMIT`;

        log.info("Vote recorded", { 
          company_id: req.company_id, 
          user_id: req.user_id, 
          vote_type: req.vote_type 
        });

        return {
          message: "Vote recorded successfully",
          votes: {
            yes: updatedCompany?.votes_yes || 0,
            no: updatedCompany?.votes_no || 0,
            abstain: updatedCompany?.votes_abstain || 0
          }
        };
      } catch (error) {
        // Rollback on error
        await db.exec`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      log.error("Failed to record vote", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to record vote");
    }
  }
);

// API: Check voting status and finalize if needed
export const checkVotingStatus = api(
  { expose: false, method: "POST", path: "/companies/check-voting" },
  async (): Promise<{ message: string; processed: number }> => {
    try {
      // Get all companies where voting period has ended
      const companies = await db.query<Company>`
        SELECT * FROM companies 
        WHERE status = 'pending' 
        AND voting_end_date < CURRENT_TIMESTAMP
      `;

      let processed = 0;
      for await (const company of companies) {
        const totalVotes = company.votes_yes + company.votes_no + company.votes_abstain;
        
        if (totalVotes > 0) {
          const yesPercentage = (company.votes_yes / totalVotes) * 100;
          
          if (yesPercentage > 50) {
            // Approve
            await db.exec`
              UPDATE companies 
              SET status = 'approved', approved_at = CURRENT_TIMESTAMP
              WHERE id = ${company.id}
            `;
            log.info("Company approved after voting period", { 
              company_id: company.id, 
              yes_percentage: yesPercentage 
            });
          } else {
            // Reject
            await db.exec`
              UPDATE companies 
              SET status = 'rejected'
              WHERE id = ${company.id}
            `;
            log.info("Company rejected after voting period", { 
              company_id: company.id, 
              yes_percentage: yesPercentage 
            });
          }
        } else {
          // No votes - reject by default
          await db.exec`
            UPDATE companies 
            SET status = 'rejected'
            WHERE id = ${company.id}
          `;
          log.info("Company rejected due to no votes", { company_id: company.id });
        }
        
        processed++;
      }

      return {
        message: `Processed ${processed} companies`,
        processed
      };
    } catch (error) {
      log.error("Failed to check voting status", error as Error);
      throw APIError.internal("Failed to check voting status");
    }
  }
);