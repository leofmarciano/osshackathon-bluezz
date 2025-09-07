import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Download, Eye, Upload, Trash2, Search,
  FileSpreadsheet, FileImage, File, Calendar, Shield, Loader2, AlertTriangle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useBackend } from "../../lib/useBackend";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Document {
  id: number;
  company_id: number;
  document_type: "legal" | "financial" | "reports" | "certificates" | "other";
  file_name: string;
  file_key: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  is_public: boolean;
}

export default function CompanyDocuments({
  companyId,
  isOwner
}: {
  companyId: string;
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const backend = useBackend();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<"legal" | "financial" | "reports" | "certificates" | "other">("other");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, [companyId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await backend.companies.getDocuments(parseInt(companyId), {});
      setDocuments(response.documents);
    } catch (error) {
      console.error("Error loading documents:", error);
      setError(t("documents.error.loading", "Failed to load documents"));
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: t("documents.categories.all"), count: documents.length },
    { value: "legal", label: t("documents.categories.legal"), count: documents.filter(d => d.document_type === "legal").length },
    { value: "financial", label: t("documents.categories.financial"), count: documents.filter(d => d.document_type === "financial").length },
    { value: "reports", label: t("documents.categories.reports"), count: documents.filter(d => d.document_type === "reports").length },
    { value: "certificates", label: t("documents.categories.certificates"), count: documents.filter(d => d.document_type === "certificates").length },
    { value: "other", label: t("documents.categories.other"), count: documents.filter(d => d.document_type === "other").length }
  ];

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return <FileSpreadsheet className="h-5 w-5" />;
    if (type.includes("image")) return <FileImage className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileTypeColor = (type: string) => {
    if (type.includes("pdf")) return "bg-red-100 text-red-700";
    if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return "bg-green-100 text-green-700";
    if (type.includes("image")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.document_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // Filter to allowed file types
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

    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(t("documents.error.invalidType", `File type ${file.type} is not allowed`));
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(t("documents.error.tooLarge", "File must be less than 10MB"));
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setError("");

    try {
      for (const file of selectedFiles) {
        // Convert file to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:type;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload document
        await backend.companies.uploadDocument(parseInt(companyId), {
          document_type: uploadCategory,
          file_name: file.name,
          data: base64,
          mime_type: file.type
        });
      }

      // Reset and reload
      setIsUploadOpen(false);
      setSelectedFiles([]);
      loadDocuments();
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      setError(error?.message || t("documents.error.upload", "Failed to upload documents"));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      setDownloadingId(documentId);
      
      // Get signed URL for download - pass document_id directly
      const response = await backend.companies.getDocumentUrl(documentId);
      
      // Open URL in new tab for download
      const link = document.createElement('a');
      link.href = response.url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      setError(t("documents.error.download", "Failed to download document"));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = async (documentId: number) => {
    try {
      setDownloadingId(documentId);
      
      // Get signed URL for viewing - pass document_id directly
      const response = await backend.companies.getDocumentUrl(documentId);
      
      // Open URL in new tab
      window.open(response.url, '_blank');
    } catch (error) {
      console.error("Error viewing document:", error);
      setError(t("documents.error.view", "Failed to view document"));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm(t("documents.confirmDelete", "Are you sure you want to delete this document?"))) {
      return;
    }

    try {
      setDeletingId(documentId);
      await backend.companies.deleteDocument(documentId);
      
      // Remove from local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
      setError(t("documents.error.delete", "Failed to delete document"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("documents.title", "Documents")}</CardTitle>
            {isOwner && (
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("documents.upload", "Upload Document")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("documents.uploadModal.title", "Upload Documents")}</DialogTitle>
                    <DialogDescription>
                      {t("documents.uploadModal.description", "Add new documents to the organization profile")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div>
                      <Label htmlFor="category">{t("documents.uploadModal.category", "Category")}</Label>
                      <Select value={uploadCategory} onValueChange={(value: any) => setUploadCategory(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="legal">{t("documents.categories.legal", "Legal")}</SelectItem>
                          <SelectItem value="financial">{t("documents.categories.financial", "Financial")}</SelectItem>
                          <SelectItem value="reports">{t("documents.categories.reports", "Reports")}</SelectItem>
                          <SelectItem value="certificates">{t("documents.categories.certificates", "Certificates")}</SelectItem>
                          <SelectItem value="other">{t("documents.categories.other", "Other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="file-upload">{t("documents.uploadModal.select", "Select Files")}</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.csv"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t("documents.uploadModal.hint", "PDF, Images, Word, Excel, CSV (max 10MB)")}
                      </p>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{t("documents.uploadModal.selected", "Selected files")}:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleUploadSubmit} 
                      disabled={selectedFiles.length === 0 || uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("documents.uploadModal.uploading", "Uploading...")}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {t("documents.uploadModal.submit", "Upload Documents")}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={t("documents.search", "Search documents...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {error && !isUploadOpen && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("documents.filter", "Filter by Category")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "secondary" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <span>{category.label}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                <p className="mt-4 text-gray-500">{t("documents.loading", "Loading documents...")}</p>
              </CardContent>
            </Card>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`rounded-lg p-2 ${getFileTypeColor(doc.mime_type)}`}>
                          {getFileIcon(doc.mime_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-1">{doc.file_name}</h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Intl.DateTimeFormat("pt-BR").format(new Date(doc.uploaded_at))}
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {doc.is_public && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="mr-1 h-3 w-3" />
                                {t("documents.public", "Public")}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {t(`documents.categories.${doc.document_type}`, doc.document_type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleView(doc.id)}
                        disabled={downloadingId === doc.id}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="mr-2 h-3 w-3" />
                        )}
                        {t("documents.view", "View")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                        disabled={downloadingId === doc.id}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-3 w-3" />
                        )}
                        {t("documents.download", "Download")}
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">
                  {searchTerm
                    ? t("documents.empty.search", "No documents found matching your search")
                    : t("documents.empty.default", "No documents uploaded yet")
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}