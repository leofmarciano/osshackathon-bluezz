import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Image, 
  Loader2,
  Building2,
  MapPin,
  Target,
  Paperclip,
  Info,
  Phone,
  Mail,
  Globe,
  Heart,
  Shield,
  Trash2,
  X,
  AlertCircle,
  Users,
  Check
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useBackend } from "@/lib/useBackend";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DocumentWithType {
  file: File;
  type: string;
}

interface CompanyFormData {
  // Basic Info
  name: string;
  type: "ngo" | "company";
  registrationNumber: string;
  category: string;
  
  // Contact
  email: string;
  phone: string;
  website: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Mission & Impact
  description: string;
  mission: string;
  impact: string;
  targetAudience: string;
  
  // Documents
  documents: DocumentWithType[];
  images: File[];
  
  // Legal
  acceptTerms: boolean;
  isNonProfit: boolean;
}

interface CompanyRegistrationFormProps {
  onCancel: () => void;
}

export default function CompanyRegistrationForm({ 
  onCancel
}: CompanyRegistrationFormProps) {
  const { t } = useTranslation();
  const backend = useBackend();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    type: "ngo",
    registrationNumber: "",
    category: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    description: "",
    mission: "",
    impact: "",
    targetAudience: "",
    documents: [],
    images: [],
    acceptTerms: false,
    isNonProfit: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const categories = [
    { value: "ocean_cleanup", label: t("companies.categories.ocean_cleanup", "Ocean Cleanup"), icon: "🌊" },
    { value: "marine_conservation", label: t("companies.categories.marine_conservation", "Marine Conservation"), icon: "🐟" },
    { value: "pollution_prevention", label: t("companies.categories.pollution_prevention", "Pollution Prevention"), icon: "🛡️" },
    { value: "research", label: t("companies.categories.research", "Research"), icon: "🔬" },
    { value: "education", label: t("companies.categories.education", "Education"), icon: "📚" },
    { value: "technology", label: t("companies.categories.technology", "Technology"), icon: "💻" },
    { value: "recycling", label: t("companies.categories.recycling", "Recycling"), icon: "♻️" },
    { value: "other", label: t("companies.categories.other", "Other"), icon: "📌" }
  ];

  const documentTypes = [
    { value: "legal", label: t("companies.register.documentTypes.legal", "Legal"), icon: "⚖️" },
    { value: "financial", label: t("companies.register.documentTypes.financial", "Financial"), icon: "💰" },
    { value: "reports", label: t("companies.register.documentTypes.reports", "Reports"), icon: "📊" },
    { value: "certificates", label: t("companies.register.documentTypes.certificates", "Certificates"), icon: "🏆" },
    { value: "other", label: t("companies.register.documentTypes.other", "Other"), icon: "📄" }
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic Info validation
    if (!formData.name.trim()) {
      newErrors.name = t("companies.register.errors.required", "Required field");
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = t("companies.register.errors.required", "Required field");
    }
    if (!formData.category) {
      newErrors.category = t("companies.register.errors.selectCategory", "Please select a category");
    }

    // Contact validation
    if (!formData.email.trim()) {
      newErrors.email = t("companies.register.errors.required", "Required field");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("companies.register.errors.invalidEmail", "Invalid email");
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("companies.register.errors.required", "Required field");
    }

    // Location validation
    if (!formData.address.trim()) {
      newErrors.address = t("companies.register.errors.required", "Required field");
    }
    if (!formData.city.trim()) {
      newErrors.city = t("companies.register.errors.required", "Required field");
    }
    if (!formData.country.trim()) {
      newErrors.country = t("companies.register.errors.required", "Required field");
    }

    // Mission validation
    if (!formData.description.trim()) {
      newErrors.description = t("companies.register.errors.required", "Required field");
    } else if (formData.description.length < 50) {
      newErrors.description = t("companies.register.errors.minLength", "Minimum 50 characters");
    }
    if (!formData.mission.trim()) {
      newErrors.mission = t("companies.register.errors.required", "Required field");
    }
    if (!formData.impact.trim()) {
      newErrors.impact = t("companies.register.errors.required", "Required field");
    }

    // Documents validation - temporarily disabled
    // if (formData.documents.length === 0) {
    //   newErrors.documents = t("companies.register.errors.documents", "Please upload at least one document");
    // }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.terms = t("companies.register.errors.terms", "You must accept the terms");
    }

    setErrors(newErrors);
    
    // Scroll to first error if any
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (files: FileList | null, type: "documents" | "images") => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        toast.error(t("companies.register.errors.fileSize", `File ${file.name} exceeds 10MB`));
        return false;
      }
      return true;
    });
    
    if (type === "documents") {
      const newDocs = validFiles.map(file => ({
        file,
        type: "other" // Default type
      }));
      updateFormData(type, [...formData.documents, ...newDocs]);
    } else {
      // For images, create preview URLs
      const newImages = [...formData.images, ...validFiles];
      updateFormData(type, newImages);
      
      // Create preview URLs for new images
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number, type: "documents" | "images") => {
    if (type === "documents") {
      const newFiles = formData.documents.filter((_, i) => i !== index);
      updateFormData(type, newFiles);
    } else {
      // Revoke the preview URL before removing
      if (imagePreviewUrls[index]) {
        URL.revokeObjectURL(imagePreviewUrls[index]);
      }
      const newFiles = formData.images.filter((_, i) => i !== index);
      const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
      updateFormData(type, newFiles);
      setImagePreviewUrls(newPreviewUrls);
    }
  };

  const updateDocumentType = (index: number, docType: string) => {
    const newDocs = [...formData.documents];
    newDocs[index].type = docType;
    updateFormData("documents", newDocs);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:*/*;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log('Starting company registration...');
      
      // Prepare the request data WITHOUT documents/images for now
      const requestData = {
        name: formData.name,
        type: formData.type,
        registration_number: formData.registrationNumber,
        category: formData.category,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state || undefined,
        zip_code: formData.zipCode || undefined,
        country: formData.country,
        description: formData.description,
        mission: formData.mission,
        impact: formData.impact,
        target_audience: formData.targetAudience || undefined,
        is_non_profit: formData.isNonProfit
        // Temporarily removed documents and images
      };
      
      console.log('Sending registration request...', requestData);
      console.log('Request data JSON:', JSON.stringify(requestData));
      
      // Call the backend API
      const result = await backend.companies.registerCompany(requestData);
      
      console.log('Registration successful:', result);
      
      // Clean up preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      toast.success(t("companies.register.success", "Company registered successfully! It will now undergo community voting."));
      navigate(`/companies/${result.company.id}`);
    } catch (error: any) {
      console.error("Failed to register company:", error);
      toast.error(
        error.message || 
        t("companies.register.error", "Failed to register company. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t("companies.register.sections.basic", "Basic Information")}
          </CardTitle>
          <CardDescription>
            {t("companies.register.sections.basicDesc", "Essential information about your organization")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Organization Type */}
            <div className="space-y-3">
              <Label>{t("companies.register.fields.type", "Organization Type")} *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: "ngo" | "company") => updateFormData("type", value)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ngo" id="ngo" />
                    <Label htmlFor="ngo" className="cursor-pointer flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      {t("companies.register.types.ngo", "NGO")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="cursor-pointer flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {t("companies.register.types.company", "Company")}
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("companies.register.fields.name", "Organization Name")} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder={t("companies.register.placeholders.name", "e.g., Ocean Cleanup Brasil")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                {t("companies.register.fields.registrationNumber", "Registration Number")} *
              </Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                placeholder={t("companies.register.placeholders.registrationNumber", "CNPJ, EIN, or registration number")}
                className={errors.registrationNumber ? "border-red-500" : ""}
              />
              {errors.registrationNumber && <p className="text-xs text-red-500">{errors.registrationNumber}</p>}
              <p className="text-xs text-muted-foreground">
                {t("companies.register.hints.registrationNumber", "Enter your organization's official registration number")}
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                {t("companies.register.fields.category", "Primary Category")} *
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("companies.register.placeholders.category", "Select a category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
          </div>

          {formData.type === "ngo" && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertTitle>{t("companies.register.alerts.ngo.title", "Non-Profit Organization")}</AlertTitle>
              <AlertDescription>
                {t("companies.register.alerts.ngo.description", "As an NGO, you'll need to provide additional documentation proving your non-profit status.")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            {t("companies.register.sections.contact", "Contact Information")}
          </CardTitle>
          <CardDescription>
            {t("companies.register.sections.contactDesc", "How can people reach your organization")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {t("companies.register.fields.email", "Official Email")} *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder={t("companies.register.placeholders.email", "contact@organization.org")}
                  className={cn("pl-10", errors.email ? "border-red-500" : "")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("companies.register.fields.phone", "Phone")} *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder={t("companies.register.placeholders.phone", "+1 234 567 8900")}
                  className={cn("pl-10", errors.phone ? "border-red-500" : "")}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">
              {t("companies.register.fields.website", "Website")} 
              <span className="text-muted-foreground ml-2">
                ({t("companies.register.optional", "optional")})
              </span>
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                placeholder={t("companies.register.placeholders.website", "https://www.organization.org")}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("companies.register.sections.location", "Location")}
          </CardTitle>
          <CardDescription>
            {t("companies.register.sections.locationDesc", "Where is your organization based")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {t("companies.register.fields.address", "Address")} *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              placeholder={t("companies.register.placeholders.address", "Street, number, complement")}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">
                {t("companies.register.fields.city", "City")} *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                placeholder={t("companies.register.placeholders.city", "São Paulo")}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>

            {/* State/Province */}
            <div className="space-y-2">
              <Label htmlFor="state">
                {t("companies.register.fields.state", "State/Province")}
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
                placeholder={t("companies.register.placeholders.state", "SP")}
              />
            </div>

            {/* ZIP Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">
                {t("companies.register.fields.zipCode", "ZIP/Postal Code")}
              </Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
                placeholder={t("companies.register.placeholders.zipCode", "00000-000")}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">
                {t("companies.register.fields.country", "Country")} *
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
                placeholder={t("companies.register.placeholders.country", "Brazil")}
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t("companies.register.sections.mission", "Mission & Impact")}
          </CardTitle>
          <CardDescription>
            {t("companies.register.sections.missionDesc", "Tell us about your organization's purpose and goals")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("companies.register.fields.description", "Organization Description")} *
              <span className="text-xs text-muted-foreground ml-2">
                ({formData.description.length}/500)
              </span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder={t("companies.register.placeholders.description", "Briefly describe what your organization does...")}
              rows={4}
              maxLength={500}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Label htmlFor="mission">
              {t("companies.register.fields.mission", "Mission")} *
            </Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => updateFormData("mission", e.target.value)}
              placeholder={t("companies.register.placeholders.mission", "What is your organization's mission?")}
              rows={3}
              className={errors.mission ? "border-red-500" : ""}
            />
            {errors.mission && <p className="text-xs text-red-500">{errors.mission}</p>}
          </div>

          {/* Impact */}
          <div className="space-y-2">
            <Label htmlFor="impact">
              {t("companies.register.fields.impact", "Expected Impact")} *
            </Label>
            <Textarea
              id="impact"
              value={formData.impact}
              onChange={(e) => updateFormData("impact", e.target.value)}
              placeholder={t("companies.register.placeholders.impact", "Describe the impact your organization aims to create...")}
              rows={3}
              className={errors.impact ? "border-red-500" : ""}
            />
            {errors.impact && <p className="text-xs text-red-500">{errors.impact}</p>}
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">
              {t("companies.register.fields.targetAudience", "Target Audience")}
              <span className="text-muted-foreground ml-2">
                ({t("companies.register.optional", "optional")})
              </span>
            </Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => updateFormData("targetAudience", e.target.value)}
              placeholder={t("companies.register.placeholders.targetAudience", "e.g., Coastal communities, students, businesses...")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            {t("companies.register.sections.documents", "Documents & Media")}
          </CardTitle>
          <CardDescription>
            {t("companies.register.sections.documentsDesc", "Upload your organization's official documents and images")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Documents Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="documents">
                {t("companies.register.fields.documents", "Required Documents")} *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("companies.register.hints.documents", "Upload registration certificate, articles of association, etc.")}
              </p>
              
              {/* Document Type Indicators */}
              <div className="flex flex-wrap gap-2 mt-3">
                {documentTypes.map(docType => {
                  const hasType = formData.documents.some(doc => doc.type === docType.value);
                  return (
                    <Badge 
                      key={docType.value}
                      variant={hasType ? "default" : "outline"}
                      className={cn(
                        "text-xs",
                        hasType ? "bg-green-100 text-green-800 border-green-200" : ""
                      )}
                    >
                      <span className="mr-1">{docType.icon}</span>
                      {docType.label}
                      {hasType && <Check className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="documents"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files, "documents")}
                className="hidden"
              />
              <label htmlFor="documents" className="cursor-pointer">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {t("companies.register.upload.documents", "Click to upload documents")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t("companies.register.upload.documentsFormats", "PDF, DOC up to 10MB")}
                </p>
              </label>
            </div>
            
            {formData.documents.length > 0 && (
              <div className="space-y-3">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-gray-500 mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{doc.file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(doc.file.size / 1024 / 1024).toFixed(2)}MB
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`doc-type-${index}`} className="text-xs">
                              {t("companies.register.fields.documentType", "Document Type")}:
                            </Label>
                            <Select 
                              value={doc.type} 
                              onValueChange={(value) => updateDocumentType(index, value)}
                            >
                              <SelectTrigger id={`doc-type-${index}`} className="h-8 w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <span className="flex items-center gap-2">
                                      <span>{type.icon}</span>
                                      {type.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index, "documents")}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.documents && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.documents}</AlertDescription>
              </Alert>
            )}
            
            {/* Helpful tip about document types */}
            {formData.documents.length === 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-sm">
                  {t("companies.register.documentTips.title", "Suggested Documents")}
                </AlertTitle>
                <AlertDescription className="text-xs mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>{t("companies.register.documentTypes.legal", "Legal")}:</strong> {" "}
                      {t("companies.register.documentTips.legal", "Registration certificate, articles of association, bylaws")}
                    </li>
                    <li>
                      <strong>{t("companies.register.documentTypes.financial", "Financial")}:</strong> {" "}
                      {t("companies.register.documentTips.financial", "Tax exemption certificate, annual budget")}
                    </li>
                    <li>
                      <strong>{t("companies.register.documentTypes.reports", "Reports")}:</strong> {" "}
                      {t("companies.register.documentTips.reports", "Annual reports, impact assessments")}
                    </li>
                    <li>
                      <strong>{t("companies.register.documentTypes.certificates", "Certificates")}:</strong> {" "}
                      {t("companies.register.documentTips.certificates", "Environmental certifications, quality standards")}
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Images Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="images">
                {t("companies.register.fields.images", "Organization Images")}
                <span className="text-muted-foreground ml-2">
                  ({t("companies.register.optional", "optional")})
                </span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("companies.register.hints.images", "Logo, activity photos, team pictures, etc.")}
              </p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files, "images")}
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {t("companies.register.upload.images", "Click to upload images")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t("companies.register.upload.imagesFormats", "PNG, JPG up to 10MB")}
                </p>
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imagePreviewUrls[index]}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("companies.register.sections.terms", "Terms and Conditions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Users className="h-4 w-4" />
            <AlertTitle>
              {t("companies.register.voting.title", "Community Voting Process")}
            </AlertTitle>
            <AlertDescription>
              {t("companies.register.voting.description", "Your organization will undergo a 7-day community voting period. Approval requires a simple majority (>50% positive votes).")}
            </AlertDescription>
          </Alert>

          {formData.type === "ngo" && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="nonprofit"
                checked={formData.isNonProfit}
                onCheckedChange={(checked) => updateFormData("isNonProfit", checked === true)}
              />
              <Label htmlFor="nonprofit" className="text-sm cursor-pointer">
                {t("companies.register.terms.nonprofit", "I declare that this is a non-profit organization")}
              </Label>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => updateFormData("acceptTerms", checked === true)}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              {t("companies.register.terms.accept", "I accept the terms of use and privacy policy. I understand that my organization will go through a 7-day voting period and that I will be responsible for managing the organization's profile.")}
            </Label>
          </div>
          {errors.terms && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.terms}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-between items-center sticky bottom-0 bg-white/95 backdrop-blur p-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("companies.register.actions.cancel", "Cancel")}
        </Button>

        <Button 
          type="submit"
          disabled={isSubmitting || !formData.acceptTerms}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("companies.register.actions.submitting", "Submitting...")}
            </>
          ) : (
            <>
              {t("companies.register.actions.submit", "Submit for Voting")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}