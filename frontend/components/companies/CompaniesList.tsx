import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBackend } from "@/lib/useBackend";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search, Filter, MapPin, Globe, Users, Target,
  Clock, CheckCircle, AlertCircle, ArrowRight,
  Building2, Heart, ThumbsUp, ThumbsDown, Calendar,
  Plus, Sparkles
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  type: "ngo" | "company";
  logo?: string;
  status: "approved" | "pending" | "rejected";
  category: string;
  description: string;
  location: string;
  website?: string;
  createdAt: Date;
  votingEndsAt?: Date;
  votes?: {
    yes: number;
    no: number;
    percentage: number;
  };
  stats: {
    followers: number;
    donations: number;
  };
  tags: string[];
  voting_ends_at?: string;
  votes_yes?: number;
  votes_no?: number;
  votes_abstain?: number;
}

export default function CompaniesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backend = useBackend();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const result = await backend.companies.getCompanies({});
      
      // Transform backend data to match frontend interface
      const transformedCompanies: Company[] = result.companies.map(c => ({
        id: c.id.toString(),
        name: c.name,
        type: c.type as "ngo" | "company",
        logo: undefined,
        status: c.status as "approved" | "pending" | "rejected",
        category: c.category,
        description: c.description,
        location: `${c.city}, ${c.state || c.country}`,
        website: c.website || undefined,
        createdAt: new Date(c.created_at),
        voting_ends_at: c.voting_ends_at || undefined,
        votes_yes: c.votes_yes,
        votes_no: c.votes_no,
        votes_abstain: c.votes_abstain,
        stats: {
          followers: 0,
          donations: 0
        },
        tags: []
      }));
      
      setCompanies(transformedCompanies);
    } catch (error: any) {
      console.error("Failed to fetch companies:", error);
      toast.error(t("companies.fetchError", "Failed to load companies"));
      // Use mock data as fallback
      setCompanies(mockCompanies);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockCompanies: Company[] = [
  ];

  const categories = [
    { value: "all", label: t("companies.categories.all") },
    { value: "ocean_cleanup", label: t("companies.categories.ocean_cleanup") },
    { value: "marine_conservation", label: t("companies.categories.marine_conservation") },
    { value: "pollution_prevention", label: t("companies.categories.pollution_prevention") },
    { value: "research", label: t("companies.categories.research") },
    { value: "education", label: t("companies.categories.education") },
    { value: "technology", label: t("companies.categories.technology") },
    { value: "recycling", label: t("companies.categories.recycling") }
  ];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || company.category === selectedCategory;
    const matchesType = selectedType === "all" || company.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const activeCompanies = filteredCompanies.filter(c => c.status === "approved");
  const pendingCompanies = filteredCompanies.filter(c => c.status === "pending");

  const calculateDaysLeft = (endDate: string | undefined) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateVotePercentage = (company: Company) => {
    const yesVotes = company.votes_yes || 0;
    const noVotes = company.votes_no || 0;
    const totalVotes = yesVotes + noVotes;
    if (totalVotes === 0) return 0;
    return Math.round((yesVotes / totalVotes) * 100);
  };

  const CompanyCard = ({ company }: { company: Company }) => {
    const votePercentage = calculateVotePercentage(company);
    const daysLeft = company.voting_ends_at ? calculateDaysLeft(company.voting_ends_at) : 7;
    
    return (
      <Card 
        className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
        onClick={() => navigate(`/companies/${company.id}`)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={company.logo} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{company.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={company.type === "ngo" ? "default" : "secondary"}>
                      {company.type === "ngo" ? "ONG" : t("companies.types.company")}
                    </Badge>
                    <Badge variant="outline">
                      {t(`companies.categories.${company.category}`, company.category)}
                    </Badge>
                  </div>
                </div>
                
                {company.status === "pending" && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-blue-600">{votePercentage}%</p>
                    <p className="text-xs text-gray-500">{t("companies.approval", "Approval")}</p>
                  </div>
                )}
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-gray-600">{company.description}</p>

              {/* Location and Website */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {company.location}
                </span>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" 
                     className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe className="h-3 w-3" />
                    {t("companies.website", "Website")}
                  </a>
                )}
              </div>

              {/* Stats or Voting Info */}
              {company.status === "approved" ? (
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    {company.stats.followers.toLocaleString()} {t("companies.followers", "followers")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-gray-400" />
                    R$ {company.stats.donations.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-yellow-50 p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center gap-2 text-yellow-800">
                      <Clock className="h-4 w-4" />
                      {t("companies.voting.daysLeft", { days: daysLeft })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        <span className="font-semibold text-green-600">{company.votes_yes || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                        <span className="font-semibold text-red-600">{company.votes_no || 0}</span>
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(votePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* View Profile Button */}
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/companies/${company.id}`}>
                    {t("companies.viewProfile", "View Profile")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section with CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Building2 className="w-3 h-3 mr-1" />
                {t("companies.badge", "Rede de Parceiros")}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {t("companies.title")}
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                {t("companies.subtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">{activeCompanies.length}</span>
                  <span className="text-blue-100">{t("companies.stats.active", "Organizações ativas")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{pendingCompanies.length}</span>
                  <span className="text-blue-100">{t("companies.stats.pending", "Em votação")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white p-6">
                <Sparkles className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("companies.cta.title", "Join the movement!")}
                </h3>
                <p className="text-blue-100 mb-4 text-sm">
                  {t("companies.cta.description", "Register your organization and join the largest ocean protection network.")}
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/companies/register")}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("companies.register.button", "Register Organization")}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder={t("companies.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("companies.types.all")}</SelectItem>
                <SelectItem value="ngo">{t("companies.types.ngo")}</SelectItem>
                <SelectItem value="company">{t("companies.types.company")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("companies.tabs.active")} ({activeCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t("companies.tabs.pending")} ({pendingCompanies.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Companies */}
        <TabsContent value="active">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                <p className="mt-4 text-gray-500">
                  {t("companies.loading", "Loading companies...")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {activeCompanies.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}
          
          {!loading && activeCompanies.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">
                  {t("companies.empty.active")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pending Companies */}
        <TabsContent value="pending">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                <p className="mt-4 text-gray-500">
                  {t("companies.loading", "Loading companies...")}
                </p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {pendingCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          )}
          
          {!loading && pendingCompanies.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">
                  {t("companies.empty.pending")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}