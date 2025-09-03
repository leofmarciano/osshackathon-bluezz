import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search, Filter, MapPin, Globe, Users, Target,
  Clock, CheckCircle, AlertCircle, ArrowRight,
  Building2, Heart, ThumbsUp, ThumbsDown, Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  type: "ngo" | "company";
  logo?: string;
  status: "active" | "pending";
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
}

export default function CompaniesList() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Mock data
  const companies: Company[] = [
    {
      id: "1",
      name: "Ocean Cleanup Brasil",
      type: "ngo",
      status: "active",
      category: "ocean_cleanup",
      description: "Dedicated to removing plastic waste from Brazilian coastlines and educating communities about ocean conservation.",
      location: "São Paulo, SP",
      website: "https://oceancleanup.br",
      createdAt: new Date(2023, 0, 15),
      stats: {
        followers: 12500,
        donations: 450000
      },
      tags: ["plastic", "beaches", "education"]
    },
    {
      id: "2",
      name: "Marine Tech Solutions",
      type: "company",
      status: "pending",
      category: "technology",
      description: "Developing innovative AI-powered solutions to track and prevent ocean pollution in real-time.",
      location: "Rio de Janeiro, RJ",
      createdAt: new Date(2024, 10, 1),
      votingEndsAt: new Date(2024, 11, 1),
      votes: {
        yes: 234,
        no: 56,
        percentage: 81
      },
      stats: {
        followers: 3400,
        donations: 0
      },
      tags: ["AI", "monitoring", "innovation"]
    },
    {
      id: "3",
      name: "Coral Restoration Foundation",
      type: "ngo",
      status: "active",
      category: "marine_conservation",
      description: "Working to restore coral reefs damaged by climate change and pollution through scientific research.",
      location: "Fernando de Noronha, PE",
      website: "https://coralrestore.org.br",
      createdAt: new Date(2022, 5, 10),
      stats: {
        followers: 8900,
        donations: 780000
      },
      tags: ["coral", "research", "climate"]
    },
    {
      id: "4",
      name: "Blue Ocean Recycling",
      type: "company",
      status: "pending",
      category: "recycling",
      description: "Converting ocean plastic into sustainable products and creating circular economy solutions.",
      location: "Salvador, BA",
      createdAt: new Date(2024, 10, 15),
      votingEndsAt: new Date(2024, 11, 15),
      votes: {
        yes: 156,
        no: 89,
        percentage: 64
      },
      stats: {
        followers: 1200,
        donations: 0
      },
      tags: ["recycling", "circular economy", "products"]
    }
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

  const activeCompanies = filteredCompanies.filter(c => c.status === "active");
  const pendingCompanies = filteredCompanies.filter(c => c.status === "pending");

  const calculateDaysLeft = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const CompanyCard = ({ company }: { company: Company }) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={company.logo} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{company.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={company.type === "ngo" ? "default" : "secondary"}>
                    {company.type === "ngo" ? "ONG" : t("companies.types.company")}
                  </Badge>
                  <Badge variant="outline">
                    {t(`companies.categories.${company.category}`)}
                  </Badge>
                </div>
              </div>
              
              {company.status === "pending" && company.votes && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{company.votes.percentage}%</p>
                  <p className="text-xs text-gray-500">{t("companies.approval")}</p>
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
                  {t("companies.website")}
                </a>
              )}
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {company.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Stats or Voting Info */}
            {company.status === "active" ? (
              <div className="mt-4 flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  {company.stats.followers.toLocaleString()} {t("companies.followers")}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-gray-400" />
                  R$ {company.stats.donations.toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-yellow-800">
                    <Clock className="h-4 w-4" />
                    {t("companies.voting.daysLeft", { days: calculateDaysLeft(company.votingEndsAt!) })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-green-600" />
                      <span className="font-semibold text-green-600">{company.votes!.yes}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3 text-red-600" />
                      <span className="font-semibold text-red-600">{company.votes!.no}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${company.votes!.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* View Profile Button */}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/companies/${company.id}`}>
                  {t("companies.viewProfile")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("companies.title")}</h1>
        <p className="mt-2 text-gray-600">
          {t("companies.subtitle")}
        </p>
      </div>

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
          <div className="grid gap-6 lg:grid-cols-2">
            {activeCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          
          {activeCompanies.length === 0 && (
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
          <div className="grid gap-6 lg:grid-cols-2">
            {pendingCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          
          {pendingCompanies.length === 0 && (
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
  );
}