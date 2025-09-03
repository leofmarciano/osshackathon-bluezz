import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [goalRange, setGoalRange] = useState([0, 500000]);
  const [progressFilter, setProgressFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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

  const locations = [
    { value: "all", label: t('search.locations.all') },
    { value: "northeast", label: t('search.locations.northeast') },
    { value: "southeast", label: t('search.locations.southeast') },
    { value: "south", label: t('search.locations.south') },
    { value: "north", label: t('search.locations.north') },
    { value: "center-oeste", label: t('search.locations.centerWest') }
  ];

  const progressOptions = [
    { value: "all", label: t('search.progressOptions.all') },
    { value: "starting", label: t('search.progressOptions.starting') },
    { value: "progressing", label: t('search.progressOptions.progressing') },
    { value: "finishing", label: t('search.progressOptions.finishing') }
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

  const getProgressCategory = (progress: number) => {
    if (progress <= 25) return "starting";
    if (progress <= 75) return "progressing";
    return "finishing";
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const resp = await backend.announcements.listPublished({
        search: searchTerm || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        sortBy: "newest",
        limit: 50,
        offset: 0,
      });
      setAnnouncements(resp.announcements);
      setTotal(resp.total);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setAnnouncements([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter]);

  const filteredAnnouncements = useMemo(() => {
    const mapLocationValueToLabel: Record<string, string> = {
      "northeast": t('search.locations.northeast'),
      "southeast": t('search.locations.southeast'),
      "south": t('search.locations.south'),
      "north": t('search.locations.north'),
      "center-oeste": t('search.locations.centerWest'),
    };

    return announcements.filter(a => {
      // Location filtering (best-effort substring match)
      const matchesLocation = locationFilter === "all" 
        || (a.location || "").toLowerCase().includes((mapLocationValueToLabel[locationFilter] || "").toLowerCase())
        || (a.location || "").toLowerCase().includes(locationFilter.replace("-", " "));

      // Goal range filtering (by project goal)
      const matchesGoalRange = a.goalAmount >= goalRange[0] && a.goalAmount <= goalRange[1];

      // Progress filtering
      const progress = (a.raisedAmount / a.goalAmount) * 100;
      const matchesProgress = progressFilter === "all" || getProgressCategory(progress) === progressFilter;

      return matchesLocation && matchesGoalRange && matchesProgress;
    });
  }, [announcements, locationFilter, goalRange, progressFilter, t]);

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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t("discover.loading")}</span>
          </div>
        )}

        {/* Results Header */}
        {!loading && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {t('search.resultsCount', { count: filteredAnnouncements.length })}
            </p>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('search.sorting.relevance')}</SelectItem>
                <SelectItem value="newest">{t('search.sorting.newest')}</SelectItem>
                <SelectItem value="goal-asc">{t('search.sorting.goalAsc')}</SelectItem>
                <SelectItem value="goal-desc">{t('search.sorting.goalDesc')}</SelectItem>
                <SelectItem value="progress">{t('search.sorting.progress')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Results Grid */}
        {!loading && (filteredAnnouncements.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnnouncements.map((a) => {
              const progress = (a.raisedAmount / a.goalAmount) * 100;
              const categoryBadge = getCategoryBadge(a.category);
              const daysLeft = getDaysLeft(a.campaignEndDate);

              return (
                <Card key={a.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {a.imageUrl && (
                      <img 
                        src={a.imageUrl} 
                        alt={a.title}
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
                    <CardTitle className="line-clamp-2">{a.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {a.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {a.location}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>{t('search.organization')}:</strong> {a.organizationName}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('search.raised')}</span>
                        <span className="font-medium">
                          {t('common.currency')} {a.raisedAmount.toLocaleString()} {t('common.from')} {t('common.currency')} {a.goalAmount.toLocaleString()}
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
                    </div>

                    <Button className="w-full" asChild>
                      <Link to={`/announcement/${a.slug}`}>
                        <Target className="w-4 h-4 mr-2" />
                        {t('search.viewProjectButton')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
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
        ))}
      </div>
    </div>
  );
}
