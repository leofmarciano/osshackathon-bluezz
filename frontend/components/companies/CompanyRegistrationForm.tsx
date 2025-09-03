import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Image, AlertCircle, Check, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompanyFormData {
  name: string;
  type: "ngo" | "company";
  cnpj: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string;
  mission: string;
  impact: string;
  category: string;
  documents: File[];
  images: File[];
}

export default function CompanyRegistrationForm({ onSubmit, onCancel }: {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    type: "ngo",
    cnpj: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    description: "",
    mission: "",
    impact: "",
    category: "",
    documents: [],
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.name) newErrors.name = t("companies.register.errors.required");
      if (!formData.cnpj) newErrors.cnpj = t("companies.register.errors.required");
      if (!formData.email) newErrors.email = t("companies.register.errors.required");
      if (!formData.phone) newErrors.phone = t("companies.register.errors.required");
      if (!formData.category) newErrors.category = t("companies.register.errors.required");
    } else if (stepNumber === 2) {
      if (!formData.address) newErrors.address = t("companies.register.errors.required");
      if (!formData.city) newErrors.city = t("companies.register.errors.required");
      if (!formData.state) newErrors.state = t("companies.register.errors.required");
      if (!formData.country) newErrors.country = t("companies.register.errors.required");
    } else if (stepNumber === 3) {
      if (!formData.description) newErrors.description = t("companies.register.errors.required");
      if (!formData.mission) newErrors.mission = t("companies.register.errors.required");
      if (!formData.impact) newErrors.impact = t("companies.register.errors.required");
    } else if (stepNumber === 4) {
      if (formData.documents.length === 0) newErrors.documents = t("companies.register.errors.documents");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFileUpload = (files: FileList | null, type: "documents" | "images") => {
    if (!files) return;
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...fileArray]
    }));
  };

  const removeFile = (index: number, type: "documents" | "images") => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "ocean_cleanup",
    "marine_conservation",
    "pollution_prevention",
    "research",
    "education",
    "technology",
    "recycling",
    "other"
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex flex-1 items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step >= num
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step > num ? <Check className="h-5 w-5" /> : num}
              </div>
              {num < 4 && (
                <div
                  className={`h-1 flex-1 ${
                    step > num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>{t("companies.register.steps.basic")}</span>
          <span>{t("companies.register.steps.location")}</span>
          <span>{t("companies.register.steps.mission")}</span>
          <span>{t("companies.register.steps.documents")}</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("companies.register.basic.title")}</CardTitle>
            <CardDescription>{t("companies.register.basic.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t("companies.register.fields.type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "ngo" | "company") => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngo">{t("companies.types.ngo")}</SelectItem>
                  <SelectItem value="company">{t("companies.types.company")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t("companies.register.fields.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnpj">{t("companies.register.fields.cnpj")} *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                  className={errors.cnpj ? "border-red-500" : ""}
                />
                {errors.cnpj && (
                  <p className="text-sm text-red-500">{errors.cnpj}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t("companies.register.fields.category")} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("companies.register.placeholders.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {t(`companies.categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">{t("companies.register.fields.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("companies.register.fields.phone")} *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t("companies.register.fields.website")}</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("companies.register.location.title")}</CardTitle>
            <CardDescription>{t("companies.register.location.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">{t("companies.register.fields.address")} *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">{t("companies.register.fields.city")} *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t("companies.register.fields.state")} *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t("companies.register.fields.country")} *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Mission & Impact */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("companies.register.mission.title")}</CardTitle>
            <CardDescription>{t("companies.register.mission.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">{t("companies.register.fields.description")} *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? "border-red-500" : ""}
                placeholder={t("companies.register.placeholders.description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">{t("companies.register.fields.mission")} *</Label>
              <Textarea
                id="mission"
                rows={4}
                value={formData.mission}
                onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                className={errors.mission ? "border-red-500" : ""}
                placeholder={t("companies.register.placeholders.mission")}
              />
              {errors.mission && (
                <p className="text-sm text-red-500">{errors.mission}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">{t("companies.register.fields.impact")} *</Label>
              <Textarea
                id="impact"
                rows={4}
                value={formData.impact}
                onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                className={errors.impact ? "border-red-500" : ""}
                placeholder={t("companies.register.placeholders.impact")}
              />
              {errors.impact && (
                <p className="text-sm text-red-500">{errors.impact}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Documents */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("companies.register.documents.title")}</CardTitle>
            <CardDescription>{t("companies.register.documents.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("companies.register.documents.alert")}
              </AlertDescription>
            </Alert>

            {/* Documents Upload */}
            <div className="space-y-4">
              <Label>{t("companies.register.fields.documents")} *</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="documents" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {t("companies.register.upload.documents")}
                      </span>
                      <input
                        id="documents"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e.target.files, "documents")}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PDF, DOC up to 10MB</p>
                </div>
              </div>
              {errors.documents && (
                <p className="text-sm text-red-500">{errors.documents}</p>
              )}

              {/* Documents List */}
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index, "documents")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images Upload */}
            <div className="space-y-4">
              <Label>{t("companies.register.fields.images")}</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {t("companies.register.upload.images")}
                      </span>
                      <input
                        id="images"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files, "images")}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {/* Images Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute right-1 top-1"
                        onClick={() => removeFile(index, "images")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={step === 1 ? onCancel : handleBack}
        >
          {step === 1 ? t("common.cancel") : t("common.back")}
        </Button>
        
        {step < 4 ? (
          <Button onClick={handleNext}>
            {t("common.next")}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.submitting")}
              </>
            ) : (
              t("companies.register.submit")
            )}
          </Button>
        )}
      </div>
    </div>
  );
}