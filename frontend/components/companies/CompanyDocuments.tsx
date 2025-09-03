import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Download, Eye, Upload, Trash2, Search,
  FileSpreadsheet, FileImage, File, Calendar, Shield
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

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: string;
  uploadedAt: Date;
  category?: string;
  isPublic?: boolean;
}

export default function CompanyDocuments({
  documents,
  isOwner
}: {
  documents: Document[];
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const categories = [
    { value: "all", label: t("documents.categories.all"), count: documents.length },
    { value: "legal", label: t("documents.categories.legal"), count: 3 },
    { value: "financial", label: t("documents.categories.financial"), count: 2 },
    { value: "reports", label: t("documents.categories.reports"), count: 4 },
    { value: "certificates", label: t("documents.categories.certificates"), count: 1 },
    { value: "other", label: t("documents.categories.other"), count: 2 }
  ];

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (type.includes("sheet") || type.includes("excel")) return <FileSpreadsheet className="h-5 w-5" />;
    if (type.includes("image")) return <FileImage className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileTypeColor = (type: string) => {
    if (type.includes("pdf")) return "bg-red-100 text-red-700";
    if (type.includes("sheet") || type.includes("excel")) return "bg-green-100 text-green-700";
    if (type.includes("image")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(Array.from(files));
  };

  const handleUploadSubmit = () => {
    // Handle upload logic here
    console.log("Uploading files:", selectedFiles);
    setIsUploadOpen(false);
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("documents.title")}</CardTitle>
            {isOwner && (
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("documents.upload")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("documents.uploadModal.title")}</DialogTitle>
                    <DialogDescription>
                      {t("documents.uploadModal.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">{t("documents.uploadModal.select")}</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{t("documents.uploadModal.selected")}:</p>
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
                      disabled={selectedFiles.length === 0}
                      className="w-full"
                    >
                      {t("documents.uploadModal.submit")}
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
              placeholder={t("documents.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("documents.filter")}</CardTitle>
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
          {filteredDocuments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`rounded-lg p-2 ${getFileTypeColor(doc.type)}`}>
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-1">{doc.name}</h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Intl.DateTimeFormat("pt-BR").format(new Date(doc.uploadedAt))}
                            </span>
                            {doc.size && (
                              <>
                                <span>•</span>
                                <span>{doc.size}</span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {doc.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="mr-1 h-3 w-3" />
                                {t("documents.public")}
                              </Badge>
                            )}
                            {doc.category && (
                              <Badge variant="secondary" className="text-xs">
                                {t(`documents.categories.${doc.category}`)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <Eye className="mr-2 h-3 w-3" />
                          {t("documents.view")}
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a href={doc.url} download>
                          <Download className="mr-2 h-3 w-3" />
                          {t("documents.download")}
                        </a>
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
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
                    ? t("documents.empty.search")
                    : t("documents.empty.default")
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