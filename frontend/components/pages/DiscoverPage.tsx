import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Target } from "lucide-react";

export function DiscoverPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data for demonstration
  const projects = [
    {
      id: 1,
      title: "Limpeza da Mancha de Óleo - Nordeste",
      description: "Projeto para remoção de óleo que atingiu as praias do Nordeste brasileiro",
      location: "Bahia, Brasil",
      category: "oil",
      goal: 150000,
      raised: 89000,
      daysLeft: 15,
      image: "/placeholder-oil-cleanup.jpg"
    },
    {
      id: 2,
      title: "Coleta de Plástico no Oceano Atlântico",
      description: "Iniciativa para coleta e reciclagem de plástico acumulado no oceano",
      location: "Rio de Janeiro, Brasil",
      category: "plastic",
      goal: 200000,
      raised: 145000,
      daysLeft: 8,
      image: "/placeholder-plastic-cleanup.jpg"
    },
    {
      id: 3,
      title: "Barreira Anti-Poluição Marinha",
      description: "Instalação de barreiras para impedir que resíduos cheguem ao mar",
      location: "São Paulo, Brasil",
      category: "prevention",
      goal: 75000,
      raised: 32000,
      daysLeft: 22,
      image: "/placeholder-barrier.jpg"
    }
  ];

  const categories = [
    { value: "all", label: t('discover.categories.all') },
    { value: "oil", label: t('discover.categories.oil') },
    { value: "plastic", label: t('discover.categories.plastic') },
    { value: "prevention", label: t('discover.categories.prevention') }
  ];

  const getCategoryBadge = (category: string) => {
    const badges = {
      oil: { label: t('discover.categories.oil'), variant: "destructive" as const },
      plastic: { label: t('discover.categories.plastic'), variant: "secondary" as const },
      prevention: { label: t('discover.categories.prevention'), variant: "default" as const }
    };
    return badges[category as keyof typeof badges] || { label: "Outros", variant: "outline" as const };
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

        {/* Projects Grid */}
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

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('discover.raised')}</span>
                      <span className="font-medium">
                        {t('common.currency')} {project.raised.toLocaleString()} {t('common.from')} {t('common.currency')} {project.goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{Math.round(progress)}% {t('discover.achieved')}</span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {project.daysLeft} {t('discover.daysLeft')}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    {t('discover.contributeButton')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
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
