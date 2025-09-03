import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X, FileText, GitBranch } from "lucide-react";
import backend from "~backend/client";
import { useToast } from "@/components/ui/use-toast";

interface ManifestoEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ManifestoEditor({ onClose, onSuccess }: ManifestoEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"edit" | "review">("edit");

  useEffect(() => {
    loadCurrentManifesto();
  }, []);

  const loadCurrentManifesto = async () => {
    try {
      setLoading(true);
      const { manifesto } = await backend.manifesto.getCurrent();
      setCurrentContent(manifesto.content);
      setEditedContent(manifesto.content);
    } catch (error) {
      console.error("Failed to load manifesto:", error);
      toast({
        title: t("manifesto.editor.loadError"),
        description: t("manifesto.editor.loadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: t("manifesto.editor.titleRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: t("manifesto.editor.descriptionRequired"),
        variant: "destructive",
      });
      return;
    }

    if (editedContent === currentContent) {
      toast({
        title: t("manifesto.editor.noChanges"),
        variant: "destructive",
      });
      return;
    }

    setStep("review");
  };

  const handleSubmitProposal = async () => {
    try {
      setSaving(true);
      
      // Get user info from localStorage or auth context
      const userId = localStorage.getItem("userId") || "anonymous";
      const userName = localStorage.getItem("userName") || "Anonymous User";

      await backend.manifesto.createProposal({
        title,
        description,
        new_content: editedContent,
        author_id: userId,
        author_name: userName,
      });

      toast({
        title: t("manifesto.editor.proposalCreated"),
        description: t("manifesto.editor.proposalCreatedDesc"),
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to create proposal:", error);
      toast({
        title: t("manifesto.editor.submitError"),
        description: t("manifesto.editor.submitErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === "edit" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("manifesto.editor.title")}
              </CardTitle>
              <CardDescription>
                {t("manifesto.editor.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("manifesto.editor.proposalTitle")}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("manifesto.editor.proposalTitlePlaceholder")}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("manifesto.editor.proposalDescription")}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("manifesto.editor.proposalDescriptionPlaceholder")}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("manifesto.editor.content")}
                </label>
                <div data-color-mode="light">
                  <MDEditor
                    value={editedContent}
                    onChange={(val) => setEditedContent(val || "")}
                    height={500}
                    preview="live"
                  />
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  {t("manifesto.editor.votingInfo")}
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {t("manifesto.editor.reviewChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {t("manifesto.editor.reviewTitle")}
              </CardTitle>
              <CardDescription>
                {t("manifesto.editor.reviewDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("manifesto.editor.changesPreview")}
                </label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                  <DiffViewer 
                    oldContent={currentContent} 
                    newContent={editedContent} 
                  />
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  {t("manifesto.editor.submitInfo")}
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("edit")}
                  disabled={saving}
                >
                  {t("common.back")}
                </Button>
                <Button 
                  onClick={handleSubmitProposal}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t("manifesto.editor.submitProposal")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Simple diff viewer component
function DiffViewer({ oldContent, newContent }: { oldContent: string; newContent: string }) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  // Simple diff - just show changed lines
  const maxLines = Math.max(oldLines.length, newLines.length);
  const changes = [];
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';
    
    if (oldLine !== newLine) {
      if (oldLine && !newLine) {
        changes.push({ type: 'removed', content: oldLine, lineNumber: i + 1 });
      } else if (!oldLine && newLine) {
        changes.push({ type: 'added', content: newLine, lineNumber: i + 1 });
      } else {
        changes.push({ type: 'removed', content: oldLine, lineNumber: i + 1 });
        changes.push({ type: 'added', content: newLine, lineNumber: i + 1 });
      }
    }
  }
  
  if (changes.length === 0) {
    return <p className="text-gray-500">No changes detected</p>;
  }
  
  return (
    <div className="space-y-1 font-mono text-sm">
      {changes.map((change, index) => (
        <div 
          key={index}
          className={`px-2 py-1 ${
            change.type === 'added' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span className="mr-2">
            {change.type === 'added' ? '+' : '-'} Line {change.lineNumber}:
          </span>
          {change.content}
        </div>
      ))}
    </div>
  );
}