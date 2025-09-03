import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X, FileText, GitBranch } from "lucide-react";
import { useBackend } from "@/lib/useBackend";
import { useToast } from "@/components/ui/use-toast";

interface ManifestoEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ManifestoEditor({ onClose, onSuccess }: ManifestoEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const backend = useBackend();
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
    console.log("handleSave called");
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Content changed:", editedContent !== currentContent);
    
    if (!title.trim()) {
      toast({
        title: t("manifesto.editor.titleRequired", "Título é obrigatório"),
        description: t("manifesto.editor.titleRequiredDesc", "Por favor, insira um título para sua proposta"),
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: t("manifesto.editor.descriptionRequired", "Descrição é obrigatória"),
        description: t("manifesto.editor.descriptionRequiredDesc", "Por favor, insira uma descrição para sua proposta"),
        variant: "destructive",
      });
      return;
    }

    if (editedContent.trim() === currentContent.trim()) {
      toast({
        title: t("manifesto.editor.noChanges", "Sem alterações"),
        description: t("manifesto.editor.noChangesDesc", "Você precisa fazer alterações no manifesto antes de prosseguir"),
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
                  {t("common.cancel", "Cancelar")}
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  type="button"
                  disabled={!title.trim() || !description.trim() || editedContent.trim() === currentContent.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t("manifesto.editor.reviewChanges", "Revisar Alterações")}
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

// Improved diff viewer component
function DiffViewer({ oldContent, newContent }: { oldContent: string; newContent: string }) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  // Find actual differences
  const changes = [];
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  // Group consecutive changes for better visualization
  let i = 0;
  let j = 0;
  
  while (i < oldLines.length || j < newLines.length) {
    const oldLine = i < oldLines.length ? oldLines[i] : undefined;
    const newLine = j < newLines.length ? newLines[j] : undefined;
    
    if (oldLine === newLine) {
      // Lines are the same, move both pointers
      i++;
      j++;
    } else if (oldLine === undefined) {
      // New line added at the end
      changes.push({ 
        type: 'added', 
        content: newLine || '', 
        lineNumber: j + 1,
        context: j > 0 ? newLines[j - 1] : ''
      });
      j++;
    } else if (newLine === undefined) {
      // Old line removed at the end
      changes.push({ 
        type: 'removed', 
        content: oldLine || '', 
        lineNumber: i + 1,
        context: i > 0 ? oldLines[i - 1] : ''
      });
      i++;
    } else {
      // Lines are different - check if it's a real change or just shifted content
      // Look ahead to see if this line appears later
      let foundInNew = false;
      let foundInOld = false;
      
      // Check if old line exists somewhere ahead in new content
      for (let k = j + 1; k < Math.min(j + 5, newLines.length); k++) {
        if (oldLine === newLines[k]) {
          foundInNew = true;
          break;
        }
      }
      
      // Check if new line exists somewhere ahead in old content
      for (let k = i + 1; k < Math.min(i + 5, oldLines.length); k++) {
        if (newLine === oldLines[k]) {
          foundInOld = true;
          break;
        }
      }
      
      if (foundInNew && !foundInOld) {
        // Line was removed
        changes.push({ 
          type: 'removed', 
          content: oldLine, 
          lineNumber: i + 1,
          context: i > 0 ? oldLines[i - 1] : ''
        });
        i++;
      } else if (!foundInNew && foundInOld) {
        // Line was added
        changes.push({ 
          type: 'added', 
          content: newLine, 
          lineNumber: j + 1,
          context: j > 0 ? newLines[j - 1] : ''
        });
        j++;
      } else {
        // Line was modified
        if (oldLine.trim() !== newLine.trim()) {
          changes.push({ 
            type: 'removed', 
            content: oldLine, 
            lineNumber: i + 1,
            context: ''
          });
          changes.push({ 
            type: 'added', 
            content: newLine, 
            lineNumber: j + 1,
            context: ''
          });
        }
        i++;
        j++;
      }
    }
  }
  
  if (changes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhuma alteração detectada
      </p>
    );
  }
  
  // Group changes by proximity for better readability
  const groupedChanges = [];
  let currentGroup = [];
  let lastLineNumber = -10;
  
  for (const change of changes) {
    if (change.lineNumber - lastLineNumber > 3 && currentGroup.length > 0) {
      groupedChanges.push([...currentGroup]);
      currentGroup = [];
    }
    currentGroup.push(change);
    lastLineNumber = change.lineNumber;
  }
  
  if (currentGroup.length > 0) {
    groupedChanges.push(currentGroup);
  }
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-2">
        {changes.filter(c => c.type === 'added').length} adições, {' '}
        {changes.filter(c => c.type === 'removed').length} remoções
      </div>
      
      {groupedChanges.map((group, groupIndex) => (
        <div key={groupIndex} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-1 text-xs text-gray-600 font-mono">
            Linha {group[0].lineNumber}
          </div>
          <div className="divide-y divide-gray-200">
            {group.map((change, index) => (
              <div 
                key={index}
                className={`px-3 py-2 font-mono text-sm ${
                  change.type === 'added' 
                    ? 'bg-green-50 text-green-900 border-l-4 border-green-500' 
                    : 'bg-red-50 text-red-900 border-l-4 border-red-500'
                }`}
              >
                <span className="select-none mr-2 text-xs opacity-50">
                  {change.type === 'added' ? '+' : '-'}
                </span>
                {change.content || <span className="text-gray-400">(linha vazia)</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}