import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, MapPin, Calendar, Target, SlidersHorizontal, Loader2 } from "lucide-react";
import backend from "~backend/client";
import type { AnnouncementSummary } from "~backend/announcements/types";

export function SearchPage() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [goalRange, setGoalRange] = useState([0, 500000]);
  const [progressFilter, setProgressFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  const categories = [
    { value: "all", label: t('discover.categories.all') },
    { value: "oil", label: t('discover.categories.oil') },
    { value: "plastic", label: t('discover.categories.plastic') },
    { value: "prevention", label: t('discover.categories.prevention') },
    { value: "restoration", label: t('discover.categories.restoration') }
  ];

  const locations = [
    { value: "all", label: t('search.locations.all') },
    { value: "nordeste", label: t('search.locations.northeast') },
    { value: "sudeste", label: t('search.locations.southeast') },
    { value: "sul", label: t('search.locations.south') },
    { value: "norte", label: t('search.locations.north') },
    { value: "centro-oeste", label: t('search.locations.centerWest') }
  ];

  const progressOptions = [
    { value: "all", label: t('search.progressOptions.all') },
    { value: "starting", label: t('search.progressOptions.starting') },
    { value: "progressing", label: t('search.progressOptions.progressing') },
    { value: "finishing", label: t('search.progressOptions.finishing') }
  ];

  const sortOptions = [
    { value: "relevance", label: t('search.sorting.relevance') },
    { value: "newest", label: t('search.sorting.newest') },
    { value: "goal-asc", label: t('search.sorting.goalAsc') },
    { value: "goal-desc", label: t('search.sorting.goalDesc') },
    { value: "progress", label: t('search.sorting.progress') }
  ];

  const getCategoryBadge = (category: string) => {
    const badges = {
      oil: { label: t('discover.categories.oil'), variant: "destructive" as const },
      plastic: { label: t('discover.categories.plastic'), variant: "secondary" as const },
      prevention: { label: t('discover.categories.prevention'), variant: "default" as const },
      restoration: { label: t('discover.categories.restoration'), variant: "outline" as const }
    };
    return badges[category as keyof typeof badges] || { label: t('discover.categories.other'), variant: "outline" as const };
  };

  const getProgressCategory = (progress: number) => {
    if (progress <= 25) return "starting";
    if (progress <= 75) return "progressing";
    return "finishing";
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await backend.announcements.listPublished({
        search: searchTerm || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        location: locationFilter === "all" ? undefined : locationFilter,
        minGoal: goalRange[0],
        maxGoal: goalRange[1],
        sortBy: sortBy as any,
        limit: 20,
        offset: 0,
        language: i18n.language,
      });

      // Filter by progress if needed (since backend doesn't support this filter yet)
      let filteredAnnouncements = response.announcements;
      if (progressFilter !== "all") {
        filteredAnnouncements = response.announcements.filter(announcement => {
          const progress = (announcement.raisedAmount / announcement.goalAmount) * 100;
          return getProgressCategory(progress) === progressFilter;
        });
      }

      setAnnouncements(filteredAnnouncements);
      setTotal(filteredAnnouncements.length);
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
  }, [searchTerm, categoryFilter, locationFilter, goalRange, progressFilter, sortBy, i18n.language]);

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('search.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('search.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('search.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              {t('search.filtersButton')}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {t('search.advancedFilters')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.category')}
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.location')}
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.progress')}
                  </label>
                  <Select value={progressFilter} onValueChange={setProgressFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {progressOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t('search.goalRange')}: {t('common.currency')} {goalRange[0].toLocaleString()} - {t('common.currency')} {goalRange[1].toLocaleString()}
                </label>
                <Slider
                  value={goalRange}
                  onValueChange={setGoalRange}
                  max={500000}
                  min={0}
                  step={5000}
                  className="w-full"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setLocationFilter("all");
                    setGoalRange([0, 500000]);
                    setProgressFilter("all");
                  }}
                >
                  {t('search.clearFilters')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading ? t('search.loading') : t('search.resultsCount', { count: total })}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('search.loading')}</span>
          </div>
        )}

        {/* Results Grid */}
        {!loading && announcements.length > 0 ? (
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
                        <span className="text-gray-600">{t('search.raised')}</span>
                        <span className="font-medium">
                          {t('common.currency')} {announcement.raisedAmount.toLocaleString()} {t('common.from')} {t('common.currency')} {announcement.goalAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{Math.round(progress)}% {t('search.achieved')}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {daysLeft} {t('search.daysLeft')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('search.backersCount', { count: announcement.backersCount })}
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link to={`/announcement/${announcement.slug}`}>
                        <Target className="w-4 h-4 mr-2" />
                        {t('search.viewProjectButton')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : !loading ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('search.noResults.title')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('search.noResults.subtitle')}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setLocationFilter("all");
                setGoalRange([0, 500000]);
                setProgressFilter("all");
              }}
            >
              {t('search.noResults.button')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
