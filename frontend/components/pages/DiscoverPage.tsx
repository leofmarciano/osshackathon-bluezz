import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Target, Loader2 } from "lucide-react";
import backend from "~backend/client";
import type { AnnouncementSummary } from "~backend/announcements/types";

export function DiscoverPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const categories = [
    { value: "all", label: t('discover.categories.all') },
    { value: "oil", label: t('discover.categories.oil') },
    { value: "plastic", label: t('discover.categories.plastic') },
    { value: "prevention", label: t('discover.categories.prevention') },
    { value: "restoration", label: t('discover.categories.restoration') }
  ];

  const getCategoryBadge = (category: string) => {
    const badges = {
      oil: { label: t('discover.categories.oil'), variant: "destructive" as const },
      plastic: { label: t('discover.categories.plastic'), variant: "secondary" as const },
      prevention: { label: t('discover.categories.prevention'), variant: "default" as const },
      restoration: { label: t('discover.categories.restoration'), variant: "outline" as const }
    };
    return badges[category as keyof typeof badges] || { label: t('discover.categories.all'), variant: "outline" as const };
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await backend.announcements.listPublished({
        search: searchTerm || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        sortBy: "newest",
        limit: 20,
        offset: 0,
      });
      setAnnouncements(response.announcements);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      setAnnouncements([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [searchTerm, categoryFilter]);

  const getDaysLeft = (campaignEndDate: Date) => {
    const now = new Date();
    const end = new Date(campaignEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('discover.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('discover.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('discover.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t('discover.filterByCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t("discover.loading")}</span>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              {t("discover.resultsCount", { count: total })}
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && announcements.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((announcement) => {
              const progress = (announcement.raisedAmount / announcement.goalAmount) * 100;
              const categoryBadge = getCategoryBadge(announcement.category);
              const daysLeft = getDaysLeft(announcement.campaignEndDate);

              return (
                <Card key={announcement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {announcement.imageUrl && (
                      <img 
                        src={announcement.imageUrl} 
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge 
                      variant={categoryBadge.variant}
                      className="absolute top-3 left-3"
                    >
                      {categoryBadge.label}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {announcement.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {announcement.location}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>{t('search.organization')}:</strong> {announcement.organizationName}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('discover.raised')}</span>
                        <span className="font-medium">
                          {t('common.currency')} {announcement.raisedAmount.toLocaleString()} {t('common.from')} {t('common.currency')} {announcement.goalAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{Math.round(progress)}% {t('discover.achieved')}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {daysLeft} {t('discover.daysLeft')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {announcement.backersCount} {t("discover.supporters")}
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link to={`/announcement/${announcement.slug}`}>
                        <Target className="w-4 h-4 mr-2" />
                        {t('discover.contributeButton')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No results */}
        {!loading && announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {t('discover.noProjects')}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
              }}
              className="mt-4"
            >
              {t('discover.clearFilters')}
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('discover.cta.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('discover.cta.subtitle')}
          </p>
          <Button>
            {t('discover.cta.button')}
          </Button>
        </div>
      </div>
    </div>
  );
}
