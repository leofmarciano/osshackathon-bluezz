import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, Mail, Phone, MapPin, Calendar, Users, Target, 
  FileText, Edit, Save, X, Eye, Code, ThumbsUp, ThumbsDown,
  Clock, CheckCircle, AlertCircle, Share2, Heart
} from "lucide-react";
import CompanyTimeline from "./CompanyTimeline";
import CompanyDocuments from "./CompanyDocuments";

interface CompanyData {
  id: string;
  name: string;
  type: "ngo" | "company";
  logo?: string;
  coverImage?: string;
  status: "pending" | "active" | "rejected";
  category: string;
  description: string;
  mission: string;
  impact: string;
  presentation: string; // Markdown content
  website?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  createdAt: Date;
  approvedAt?: Date;
  votingEndsAt?: Date;
  votes: {
    yes: number;
    no: number;
    total: number;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  stats: {
    followers: number;
    posts: number;
    donations: number;
  };
  isOwner: boolean;
  isFollowing: boolean;
  hasVoted?: boolean;
  userVote?: "yes" | "no";
}

export default function CompanyProfile({ 
  company, 
  onUpdate,
  onVote,
  onFollow 
}: {
  company: CompanyData;
  onUpdate: (presentation: string) => void;
  onVote: (vote: "yes" | "no") => void;
  onFollow: () => void;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [presentation, setPresentation] = useState(company.presentation);
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview");

  const handleSave = () => {
    onUpdate(presentation);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPresentation(company.presentation);
    setIsEditing(false);
  };

  const getStatusColor = () => {
    switch (company.status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTimeLeft = () => {
    if (!company.votingEndsAt) return null;
    const now = new Date();
    const end = new Date(company.votingEndsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return t("companies.profile.voting.ended");
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return t("companies.profile.voting.timeLeft", { days, hours });
  };

  const votePercentage = company.votes.total > 0 
    ? Math.round((company.votes.yes / company.votes.total) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header with Cover Image */}
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600">
          {company.coverImage && (
            <img
              src={company.coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        
        {/* Company Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={company.logo} />
              <AvatarFallback className="bg-white text-2xl font-bold text-gray-900">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <Badge className={getStatusColor()}>
                  {t(`companies.status.${company.status}`)}
                </Badge>
                <Badge variant="secondary">
                  {t(`companies.categories.${company.category}`)}
                </Badge>
              </div>
              <p className="mt-2 text-white/90">{company.description}</p>
            </div>

            <div className="flex gap-2">
              {company.isOwner && company.status === "active" && (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>
              )}
              {!company.isOwner && (
                <Button
                  variant={company.isFollowing ? "outline" : "default"}
                  onClick={onFollow}
                >
                  <Heart className={`mr-2 h-4 w-4 ${company.isFollowing ? "fill-current" : ""}`} />
                  {company.isFollowing ? t("companies.profile.unfollow") : t("companies.profile.follow")}
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Section for Pending Companies */}
      {company.status === "pending" && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              {t("companies.profile.voting.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{calculateTimeLeft()}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {votePercentage}% {t("companies.profile.voting.approval")}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{company.votes.yes}</p>
                    <p className="text-sm text-gray-600">{t("companies.profile.voting.yes")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{company.votes.no}</p>
                    <p className="text-sm text-gray-600">{t("companies.profile.voting.no")}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${votePercentage}%` }}
                />
              </div>

              {/* Voting Buttons */}
              {!company.hasVoted && (
                <div className="flex gap-4">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => onVote("yes")}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    {t("companies.profile.voting.approve")}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => onVote("no")}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    {t("companies.profile.voting.reject")}
                  </Button>
                </div>
              )}

              {company.hasVoted && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("companies.profile.voting.voted", { 
                      vote: t(`companies.profile.voting.${company.userVote}`)
                    })}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("companies.profile.stats.followers")}</p>
                <p className="text-2xl font-bold">{company.stats.followers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("companies.profile.stats.posts")}</p>
                <p className="text-2xl font-bold">{company.stats.posts.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("companies.profile.stats.donations")}</p>
                <p className="text-2xl font-bold">R$ {company.stats.donations.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("companies.profile.stats.since")}</p>
                <p className="text-2xl font-bold">
                  {new Date(company.createdAt).getFullYear()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="presentation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="presentation">{t("companies.profile.tabs.presentation")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("companies.profile.tabs.timeline")}</TabsTrigger>
          <TabsTrigger value="documents">{t("companies.profile.tabs.documents")}</TabsTrigger>
          <TabsTrigger value="info">{t("companies.profile.tabs.info")}</TabsTrigger>
        </TabsList>

        {/* Presentation Tab */}
        <TabsContent value="presentation">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("companies.profile.presentation.title")}</CardTitle>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={previewMode === "preview" ? "default" : "outline"}
                      onClick={() => setPreviewMode("preview")}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("common.preview")}
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "code" ? "default" : "outline"}
                      onClick={() => setPreviewMode("code")}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      {t("common.code")}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {previewMode === "code" ? (
                    <Textarea
                      value={presentation}
                      onChange={(e) => setPresentation(e.target.value)}
                      rows={20}
                      className="font-mono"
                      placeholder={t("companies.profile.presentation.placeholder")}
                    />
                  ) : (
                    <div className="prose prose-blue max-w-none">
                      {/* Here you would render the markdown - for now just showing as text */}
                      <div dangerouslySetInnerHTML={{ __html: presentation }} />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      {t("common.save")}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-blue max-w-none">
                  {company.presentation ? (
                    <div dangerouslySetInnerHTML={{ __html: company.presentation }} />
                  ) : (
                    <p className="text-gray-500">
                      {t("companies.profile.presentation.empty")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <CompanyTimeline companyId={company.id} isOwner={company.isOwner} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <CompanyDocuments documents={company.documents} isOwner={company.isOwner} />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>{t("companies.profile.info.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold">{t("companies.profile.info.mission")}</h3>
                <p className="text-gray-700">{company.mission}</p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">{t("companies.profile.info.impact")}</h3>
                <p className="text-gray-700">{company.impact}</p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">{t("companies.profile.info.contact")}</h3>
                <div className="space-y-2">
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={company.website} target="_blank" rel="noreferrer" 
                         className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                      {company.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{company.address}, {company.city}, {company.state}, {company.country}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}