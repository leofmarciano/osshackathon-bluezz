import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Vote, 
  Brain, 
  FileText, 
  Building2, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Map,
  Waves,
  Target,
  Shield,
  GitBranch,
  MessageSquare,
  Calendar,
  BarChart3,
  Zap,
  Info,
  Plus,
  Eye,
  ArrowRight
} from "lucide-react";

export function GovernancePage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("proposals");

  // Mock data for demonstration
  const aiDetectedProblems = [
    {
      id: 1,
      location: "Baía de Guanabara, RJ",
      severity: "critical",
      type: "oil",
      description: "Manchas de óleo detectadas próximas à entrada da baía",
      detectedAt: "2024-01-15",
      coordinates: { lat: -22.8, lng: -43.1 },
      confidence: 95
    },
    {
      id: 2,
      location: "Litoral de Santos, SP",
      severity: "high",
      type: "plastic",
      description: "Alta concentração de resíduos plásticos",
      detectedAt: "2024-01-14",
      coordinates: { lat: -23.9, lng: -46.3 },
      confidence: 88
    },
    {
      id: 3,
      location: "Praia de Copacabana, RJ",
      severity: "medium",
      type: "sewage",
      description: "Possível descarga de esgoto não tratado",
      detectedAt: "2024-01-13",
      coordinates: { lat: -22.9, lng: -43.2 },
      confidence: 72
    }
  ];

  const activeProposals = [
    {
      id: 1,
      title: "Limpeza emergencial da Baía de Guanabara",
      type: "action",
      proposer: "ONG Oceano Limpo",
      description: "Mobilização de equipes para remoção de óleo detectado pela IA",
      budget: "R$ 150.000",
      votes: { yes: 1234, no: 87, abstain: 23 },
      deadline: "2024-01-20",
      status: "voting"
    },
    {
      id: 2,
      title: "Alteração no Manifesto: Inclusão de metas de microplásticos",
      type: "manifesto",
      proposer: "Comunidade",
      description: "Adicionar seção específica sobre combate a microplásticos",
      votes: { yes: 892, no: 234, abstain: 45 },
      deadline: "2024-01-22",
      status: "voting"
    },
    {
      id: 3,
      title: "Registro de ONG: Instituto Mar Azul",
      type: "ngo",
      proposer: "Instituto Mar Azul",
      description: "Aprovação para participação no programa de limpeza oceânica",
      documents: ["CNPJ", "Estatuto", "Certidões"],
      votes: { yes: 567, no: 12, abstain: 8 },
      deadline: "2024-01-18",
      status: "voting"
    }
  ];

  const completedProposals = [
    {
      id: 4,
      title: "Instalação de barreiras de contenção em Santos",
      type: "action",
      result: "approved",
      votes: { yes: 2341, no: 123, abstain: 56 },
      completedAt: "2024-01-10"
    },
    {
      id: 5,
      title: "Criação do Conselho de Transparência",
      type: "governance",
      result: "approved",
      votes: { yes: 3456, no: 234, abstain: 89 },
      completedAt: "2024-01-08"
    }
  ];

  const registeredNGOs = [
    {
      name: "Oceano Limpo",
      verified: true,
      projectsCompleted: 12,
      totalRaised: "R$ 2.3M",
      rating: 4.8
    },
    {
      name: "Guardiões do Mar",
      verified: true,
      projectsCompleted: 8,
      totalRaised: "R$ 1.1M",
      rating: 4.6
    },
    {
      name: "Projeto Azul",
      verified: false,
      projectsCompleted: 3,
      totalRaised: "R$ 450K",
      rating: 4.2
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "orange";
      case "medium": return "yellow";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "action": return <Target className="w-4 h-4" />;
      case "manifesto": return <FileText className="w-4 h-4" />;
      case "ngo": return <Building2 className="w-4 h-4" />;
      case "governance": return <Shield className="w-4 h-4" />;
      default: return <Vote className="w-4 h-4" />;
    }
  };

  const menuItems = [
    { id: "proposals", label: t("governance.tabs.activeProposals"), icon: Vote, badge: "3" },
    { id: "ai", label: t("governance.tabs.aiDetection"), icon: Brain, badge: "12", urgent: true },
    { id: "manifesto", label: t("governance.tabs.manifesto"), icon: FileText },
    { id: "ngos", label: t("governance.tabs.ngos"), icon: Building2, badge: "24" },
    { id: "history", label: t("governance.tabs.history"), icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Zap className="w-3 h-3 mr-1" />
              {t("governance.badge")}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              {t("governance.title")}
            </h1>
            <p className="text-lg text-blue-100 mb-6">
              {t("governance.subtitle")}
            </p>
          </div>
        </div>
        <Waves className="absolute bottom-0 right-0 w-64 h-64 text-white/10" />
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.activeProposals")}</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.totalVotes")}</p>
                  <p className="text-2xl font-bold">8,742</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 grid place-items-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.registeredNGOs")}</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 grid place-items-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.aiDetections")}</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 grid place-items-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("governance.menu", "Menu")}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge 
                            variant={item.urgent ? "destructive" : "secondary"} 
                            className="ml-auto h-5 px-1.5 min-w-[20px] flex items-center justify-center"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <Button className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("governance.createProposal", "Criar Proposta")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Alert - Always visible when there are critical issues */}
            {activeSection === "proposals" && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("governance.ai.alertTitle")}</AlertTitle>
                <AlertDescription>
                  {t("governance.ai.alertDescription")}
                </AlertDescription>
              </Alert>
            )}

            {/* Active Proposals Section */}
            {activeSection === "proposals" && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t("governance.activeProposals.title")}</h2>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    {t("governance.viewAll", "Ver Todas")}
                  </Button>
                </div>

                <div className="grid gap-4">
                  {activeProposals.map((proposal) => {
                    const total = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;
                    const yesPercentage = (proposal.votes.yes / total) * 100;
                    
                    return (
                      <Card key={proposal.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 grid place-items-center flex-shrink-0">
                              {getTypeIcon(proposal.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                    {proposal.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {proposal.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {proposal.proposer}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {proposal.deadline}
                                </span>
                                {proposal.budget && (
                                  <span className="font-medium text-green-600">
                                    {proposal.budget}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">{total} votos</span>
                                  <span className="font-medium text-green-600">
                                    {Math.round(yesPercentage)}% aprovação
                                  </span>
                                </div>
                                <Progress value={yesPercentage} className="h-2" />
                                
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {t("governance.activeProposals.voteYes")}
                                  </Button>
                                  <Button size="sm" variant="destructive" className="flex-1">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    {t("governance.activeProposals.voteNo")}
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            {/* AI Detection Section */}
            {activeSection === "ai" && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t("governance.aiDetection.title")}</h2>
                  <Button variant="outline" size="sm">
                    <Map className="w-4 h-4 mr-2" />
                    {t("governance.aiDetection.viewMap")}
                  </Button>
                </div>

                <div className="grid gap-4">
                  {aiDetectedProblems.map((problem) => (
                    <Card key={problem.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-lg grid place-items-center flex-shrink-0 ${
                            problem.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            problem.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{problem.location}</h3>
                                <p className="text-sm text-gray-600 mt-1">{problem.description}</p>
                              </div>
                              <Badge variant={getSeverityColor(problem.severity)}>
                                {problem.severity.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {problem.detectedAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {t("governance.aiDetection.confidence")}: {problem.confidence}%
                              </span>
                              <span className="text-xs">
                                {problem.coordinates.lat}, {problem.coordinates.lng}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" variant="default">
                                <Target className="w-3 h-3 mr-1" />
                                {t("governance.aiDetection.createAction")}
                              </Button>
                              <Button size="sm" variant="outline">
                                <Info className="w-3 h-3 mr-1" />
                                {t("governance.aiDetection.moreInfo")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertTitle>{t("governance.aiDetection.howItWorks")}</AlertTitle>
                  <AlertDescription>
                    {t("governance.aiDetection.description")}
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* Manifesto Section */}
            {activeSection === "manifesto" && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t("governance.manifesto.title")}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <GitBranch className="w-4 h-4 mr-2" />
                      {t("governance.manifesto.viewHistory")}
                    </Button>
                    <Button size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      {t("governance.manifesto.propose")}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("governance.manifesto.current")}</CardTitle>
                    <CardDescription>
                      {t("governance.manifesto.lastUpdated")}: 2024-01-01
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-lg font-semibold mb-2">{t("governance.manifesto.mission")}</h3>
                        <p className="text-gray-600">
                          {t("governance.manifesto.missionText")}
                        </p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold mb-2">{t("governance.manifesto.values")}</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          <li>{t("governance.manifesto.value1")}</li>
                          <li>{t("governance.manifesto.value2")}</li>
                          <li>{t("governance.manifesto.value3")}</li>
                          <li>{t("governance.manifesto.value4")}</li>
                        </ul>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold mb-2">{t("governance.manifesto.goals")}</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          <li>{t("governance.manifesto.goal1")}</li>
                          <li>{t("governance.manifesto.goal2")}</li>
                          <li>{t("governance.manifesto.goal3")}</li>
                        </ul>
                      </section>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("governance.manifesto.pendingChanges")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{t("governance.manifesto.change1")}</p>
                          <p className="text-sm text-gray-500">{t("governance.manifesto.proposedBy")}: Marina Silva</p>
                        </div>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {t("governance.manifesto.voting")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* NGOs Section */}
            {activeSection === "ngos" && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t("governance.ngos.title")}</h2>
                  <Button size="sm">
                    <Building2 className="w-4 h-4 mr-2" />
                    {t("governance.ngos.register")}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {registeredNGOs.map((ngo, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{ngo.name}</h3>
                            {ngo.verified && (
                              <Badge variant="default" className="mt-1 bg-green-500">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t("governance.ngos.verified")}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">⭐ {ngo.rating}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">{t("governance.ngos.projects")}</p>
                            <p className="font-medium">{ngo.projectsCompleted}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t("governance.ngos.raised")}</p>
                            <p className="font-medium text-green-600">{ngo.totalRaised}</p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full" size="sm">
                          {t("governance.ngos.viewProfile")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>{t("governance.ngos.verification")}</AlertTitle>
                  <AlertDescription>
                    {t("governance.ngos.verificationDesc")}
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* History Section */}
            {activeSection === "history" && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t("governance.history.title")}</h2>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t("governance.history.stats")}
                  </Button>
                </div>

                <div className="space-y-3">
                  {completedProposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-50 grid place-items-center flex-shrink-0">
                              {getTypeIcon(proposal.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <Badge variant={proposal.result === "approved" ? "default" : "destructive"}>
                                  {proposal.result === "approved" ? t("governance.history.approved") : t("governance.history.rejected")}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {proposal.completedAt}
                                </span>
                              </div>
                              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  {proposal.votes.yes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  {proposal.votes.no}
                                </span>
                                <span>
                                  {t("governance.history.abstain")}: {proposal.votes.abstain}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("governance.cta.title")}
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              {t("governance.cta.description")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Users className="mr-2 h-5 w-5" />
                {t("governance.cta.joinCommunity")}
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <MessageSquare className="mr-2 h-5 w-5" />
                {t("governance.cta.startDiscussion")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}