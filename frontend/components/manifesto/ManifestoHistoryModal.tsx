import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Loader2, Calendar, User, GitBranch, Eye } from "lucide-react";
import backend from "~backend/client";
import { useToast } from "@/components/ui/use-toast";
import { Streamdown } from "streamdown";

interface ManifestoVersion {
  id: number;
  version_number: number;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  is_current: boolean;
  proposal_id?: number;
}

interface ManifestoHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManifestoHistoryModal({ isOpen, onClose }: ManifestoHistoryModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<ManifestoVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ManifestoVersion | null>(null);
  const [viewingVersion, setViewingVersion] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await backend.manifesto.getHistory();
      setVersions(response.versions);
    } catch (error) {
      console.error("Failed to load manifesto history:", error);
      toast({
        title: t("manifesto.history.loadError"),
        description: t("manifesto.history.loadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = (version: ManifestoVersion) => {
    setSelectedVersion(version);
    setViewingVersion(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen && !viewingVersion} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              {t("manifesto.history.title")}
            </DialogTitle>
            <DialogDescription>
              {t("manifesto.history.description")}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              {versions.map((version) => (
                <Card key={version.id} className={version.is_current ? "border-blue-500 bg-blue-50/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {t("manifesto.history.version")} {version.version_number}
                          </span>
                          {version.is_current && (
                            <Badge variant="default" className="bg-blue-500">
                              {t("manifesto.history.current")}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(version.created_at)}
                          </span>
                        </div>

                        {version.proposal_id && (
                          <p className="text-sm text-gray-500 mt-2">
                            {t("manifesto.history.fromProposal")} #{version.proposal_id}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVersion(version)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("manifesto.history.view")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Version viewer dialog */}
      <Dialog open={viewingVersion} onOpenChange={(open) => !open && setViewingVersion(false)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {t("manifesto.history.version")} {selectedVersion?.version_number}
              </span>
              <Badge variant={selectedVersion?.is_current ? "default" : "outline"}>
                {selectedVersion?.is_current ? t("manifesto.history.current") : t("manifesto.history.archived")}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedVersion?.author_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedVersion && formatDate(selectedVersion.created_at)}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
            <div className="prose prose-sm max-w-none">
              <Streamdown content={selectedVersion?.content || ""} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setViewingVersion(false)}>
              {t("common.back")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}