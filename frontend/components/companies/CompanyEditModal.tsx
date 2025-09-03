import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MDEditor from "@uiw/react-md-editor";
import {
  Building2,
  FileText,
  Image,
  Save,
  X,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  onSave: (data: any) => void;
}

type EditSection = "info" | "presentation" | "logo";

export default function CompanyEditModal({
  isOpen,
  onClose,
  company,
  onSave
}: CompanyEditModalProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<EditSection>("info");
  const [formData, setFormData] = useState({
    name: company.name || "",
    description: company.description || "",
    mission: company.mission || "",
    impact: company.impact || "",
    website: company.website || "",
    email: company.email || "",
    phone: company.phone || "",
    address: company.address || "",
    city: company.city || "",
    state: company.state || "",
    country: company.country || "",
    presentation: company.presentation || "",
    logo: company.logo || ""
  });
  const [logoPreview, setLogoPreview] = useState(company.logo);

  // Cleanup on unmount to ensure scroll is restored
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData(prev => ({
          ...prev,
          logo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    // Ensure body overflow is restored
    document.body.style.overflow = 'unset';
    onClose();
  };

  const handleClose = () => {
    // Ensure body overflow is restored
    document.body.style.overflow = 'unset';
    onClose();
  };

  const menuItems = [
    {
      id: "info" as EditSection,
      label: t("companies.edit.sections.info", "Informações Gerais"),
      icon: Building2,
      description: t("companies.edit.sections.infoDesc", "Dados básicos e contato")
    },
    {
      id: "presentation" as EditSection,
      label: t("companies.edit.sections.presentation", "Apresentação"),
      icon: FileText,
      description: t("companies.edit.sections.presentationDesc", "Conteúdo em markdown")
    },
    {
      id: "logo" as EditSection,
      label: t("companies.edit.sections.logo", "Logo e Identidade"),
      icon: Image,
      description: t("companies.edit.sections.logoDesc", "Imagem de perfil")
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="!max-w-none !w-[98vw] !h-[85vh] p-0" 
        style={{ 
          maxWidth: "98vw !important", 
          width: "98vw !important",
          height: "85vh !important",
          left: "50%",
          // please dont put transform: "translateX(-50%)"
        }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4 flex-shrink-0 h-full overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg">{t("companies.edit.title", "Editar Organização")}</DialogTitle>
            </DialogHeader>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeSection === "info" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("companies.edit.info.title", "Informações Gerais")}
                  </h3>
                  
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm">{t("companies.edit.info.name", "Nome")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={t("companies.edit.info.namePlaceholder", "Nome da organização")}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="website" className="text-sm">
                        <Globe className="inline h-3 w-3 mr-1" />
                        {t("companies.edit.info.website", "Website")}
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://exemplo.com.br"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <Label htmlFor="description" className="text-sm">{t("companies.edit.info.description", "Descrição")}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder={t("companies.edit.info.descriptionPlaceholder", "Breve descrição da organização")}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <Label htmlFor="mission" className="text-sm">{t("companies.edit.info.mission", "Missão")}</Label>
                      <Textarea
                        id="mission"
                        value={formData.mission}
                        onChange={(e) => handleInputChange("mission", e.target.value)}
                        placeholder={t("companies.edit.info.missionPlaceholder", "Nossa missão é...")}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <Label htmlFor="impact" className="text-sm">{t("companies.edit.info.impact", "Impacto")}</Label>
                      <Textarea
                        id="impact"
                        value={formData.impact}
                        onChange={(e) => handleInputChange("impact", e.target.value)}
                        placeholder={t("companies.edit.info.impactPlaceholder", "Nosso impacto até hoje...")}
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("companies.edit.contact.title", "Informações de Contato")}
                  </h3>
                  
                  <div className="grid gap-4 grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">
                        <Mail className="inline h-3 w-3 mr-1" />
                        {t("companies.edit.contact.email", "Email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="contato@exemplo.com.br"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm">
                        <Phone className="inline h-3 w-3 mr-1" />
                        {t("companies.edit.contact.phone", "Telefone")}
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+55 11 98765-4321"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="country" className="text-sm">{t("companies.edit.contact.country", "País")}</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1 col-span-3">
                      <Label htmlFor="address" className="text-sm">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {t("companies.edit.contact.address", "Endereço")}
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder={t("companies.edit.contact.addressPlaceholder", "Rua, número")}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-sm">{t("companies.edit.contact.city", "Cidade")}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-sm">{t("companies.edit.contact.state", "Estado")}</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="zipcode" className="text-sm">{t("companies.edit.contact.zipcode", "CEP")}</Label>
                      <Input
                        id="zipcode"
                        value={formData.zipcode || ""}
                        onChange={(e) => handleInputChange("zipcode", e.target.value)}
                        placeholder="00000-000"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "presentation" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("companies.edit.presentation.title", "Apresentação da Organização")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("companies.edit.presentation.description", "Use markdown para formatar sua apresentação. Esta será a página principal da sua organização.")}
                </p>
                
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.presentation}
                    onChange={(val) => handleInputChange("presentation", val || "")}
                    height={400}
                    preview="live"
                  />
                </div>
              </div>
            )}

            {activeSection === "logo" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  {t("companies.edit.logo.title", "Logo da Organização")}
                </h3>
                
                <div className="flex items-center gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={logoPreview} />
                    <AvatarFallback className="text-3xl">
                      {formData.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          <span>{t("companies.edit.logo.upload", "Escolher imagem")}</span>
                        </div>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </Label>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      {t("companies.edit.logo.requirements", "JPG, PNG ou GIF. Tamanho máximo de 2MB. Recomendado: 400x400px")}
                    </p>
                  </div>
                </div>

                {logoPreview && logoPreview !== company.logo && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogoPreview(company.logo);
                        setFormData(prev => ({ ...prev, logo: company.logo }));
                      }}
                    >
                      {t("companies.edit.logo.reset", "Restaurar logo original")}
                    </Button>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Fixed Action Buttons */}
            <div className="flex justify-end gap-3 p-6 border-t bg-white">
              <Button variant="outline" onClick={handleClose}>
                <X className="mr-2 h-4 w-4" />
                {t("common.cancel", "Cancelar")}
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {t("common.save", "Salvar")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}