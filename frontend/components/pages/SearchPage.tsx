import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, MapPin, Calendar, Target, SlidersHorizontal } from "lucide-react";

export function SearchPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [goalRange, setGoalRange] = useState([0, 500000]);
  const [progressFilter, setProgressFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const projects = [
    {
      id: 1,
      title: "Limpeza da Mancha de Óleo - Nordeste",
      description: "Projeto emergencial para remoção de óleo que atingiu as praias do Nordeste brasileiro, focando na recuperação da vida marinha local",
      location: "Bahia, Brasil",
      category: "oil",
      goal: 150000,
      raised: 89000,
      daysLeft: 15,
      organization: "ONG Mar Limpo"
    },
    {
      id: 2,
      title: "Coleta de Plástico no Oceano Atlântico",
      description: "Iniciativa inovadora para coleta e reciclagem de plástico acumulado no oceano usando embarcações especializadas",
      location: "Rio de Janeiro, Brasil",
      category: "plastic",
      goal: 200000,
      raised: 145000,
      daysLeft: 8,
      organization: "Instituto Oceano Azul"
    },
    {
      id: 3,
      title: "Barreira Anti-Poluição Marinha",
      description: "Instalação de barreiras flutuantes para impedir que resíduos urbanos cheguem ao mar através dos rios",
      location: "São Paulo, Brasil",
      category: "prevention",
      goal: 75000,
      raised: 32000,
      daysLeft: 22,
      organization: "Fundação Águas Limpas"
    },
    {
      id: 4,
      title: "Recuperação de Corais - Fernando de Noronha",
      description: "Projeto de reflorestamento marinho e recuperação de recifes de corais degradados pela poluição",
      location: "Pernambuco, Brasil",
      category: "restoration",
      goal: 300000,
      raised: 180000,
      daysLeft: 30,
      organization: "Centro de Pesquisa Marinha"
    },
    {
      id: 5,
      title: "Limpeza de Microplásticos - Lagoa dos Patos",
      description: "Tecnologia avançada para remoção de microplásticos em ecossistemas lagunares do sul do Brasil",
      location: "Rio Grande do Sul, Brasil",
      category: "plastic",
      goal: 120000,
      raised: 45000,
      daysLeft: 18,
      organization: "EcoTech Solutions"
    }
  ];

  const categories = [
    { value: "all", label: t('discover.categories.all') },
    { value: "oil", label: t('discover.categories.oil') },
    { value: "plastic", label: t('discover.categories.plastic') },
    { value: "prevention", label: t('discover.categories.prevention') },
    { value: "restoration", label: "Restauração" }
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

  const getCategoryBadge = (category: string) => {
    const badges = {
      oil: { label: t('discover.categories.oil'), variant: "destructive" as const },
      plastic: { label: t('discover.categories.plastic'), variant: "secondary" as const },
      prevention: { label: t('discover.categories.prevention'), variant: "default" as const },
      restoration: { label: "Restauração", variant: "outline" as const }
    };
    return badges[category as keyof typeof badges] || { label: "Outros", variant: "outline" as const };
  };

  const getProgressCategory = (progress: number) => {
    if (progress <= 25) return "starting";
    if (progress <= 75) return "progressing";
    return "finishing";
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.organization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
    
    const matchesGoalRange = project.goal >= goalRange[0] && project.goal <= goalRange[1];
    
    const progress = (project.raised / project.goal) * 100;
    const matchesProgress = progressFilter === "all" || getProgressCategory(progress) === progressFilter;
    
    return matchesSearch && matchesCategory && matchesGoalRange && matchesProgress;
  });

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
            {t('search.resultsCount', { count: filteredProjects.length })}
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

        {/* Results Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const progress = (project.raised / project.goal) * 100;
              const categoryBadge = getCategoryBadge(project.category);

              return (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge 
                      variant={categoryBadge.variant}
                      className="absolute top-3 left-3"
                    >
                      {categoryBadge.label}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {project.location}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>{t('search.organization')}:</strong> {project.organization}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('search.raised')}</span>
                        <span className="font-medium">
                          {t('common.currency')} {project.raised.toLocaleString()} {t('common.from')} {t('common.currency')} {project.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{Math.round(progress)}% {t('search.achieved')}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {project.daysLeft} {t('search.daysLeft')}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      {t('search.viewProjectButton')}
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
        )}
      </div>
    </div>
  );
}
