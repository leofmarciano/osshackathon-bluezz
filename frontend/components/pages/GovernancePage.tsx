import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Info
} from "lucide-react";

export function GovernancePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("active-proposals");

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Zap className="w-3 h-3 mr-1" />
              {t("governance.badge")}
            </Badge>
            <h1 className="text-5xl font-bold mb-4">
              {t("governance.title")}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t("governance.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary">
                <Vote className="mr-2 h-5 w-5" />
                {t("governance.voteNow")}
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <FileText className="mr-2 h-5 w-5" />
                {t("governance.proposeChange")}
              </Button>
            </div>
          </div>
        </div>
        <Waves className="absolute bottom-0 right-0 w-64 h-64 text-white/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("governance.stats.activeProposals")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">3</div>
              <p className="text-xs text-gray-500 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {t("governance.stats.endingSoon")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("governance.stats.totalVotes")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">8,742</div>
              <p className="text-xs text-gray-500 mt-1">
                <Users className="w-3 h-3 inline mr-1" />
                {t("governance.stats.thisMonth")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("governance.stats.registeredNGOs")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">24</div>
              <p className="text-xs text-gray-500 mt-1">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                {t("governance.stats.verified")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("governance.stats.aiDetections")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">12</div>
              <p className="text-xs text-gray-500 mt-1">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {t("governance.stats.criticalIssues")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Detected Problems Alert */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <Brain className="h-4 w-4" />
          <AlertTitle>{t("governance.ai.alertTitle")}</AlertTitle>
          <AlertDescription>
            {t("governance.ai.alertDescription")}
          </AlertDescription>
        </Alert>

        {/* Main Content Tabs */}
        <Tabs defaultValue="active-proposals" className="space-y-8">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-gray-100">
            <TabsTrigger value="active-proposals" className="data-[state=active]:bg-white">
              <Vote className="w-4 h-4 mr-2" />
              {t("governance.tabs.activeProposals")}
            </TabsTrigger>
            <TabsTrigger value="ai-detection" className="data-[state=active]:bg-white">
              <Brain className="w-4 h-4 mr-2" />
              {t("governance.tabs.aiDetection")}
            </TabsTrigger>
            <TabsTrigger value="manifesto" className="data-[state=active]:bg-white">
              <FileText className="w-4 h-4 mr-2" />
              {t("governance.tabs.manifesto")}
            </TabsTrigger>
            <TabsTrigger value="ngos" className="data-[state=active]:bg-white">
              <Building2 className="w-4 h-4 mr-2" />
              {t("governance.tabs.ngos")}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white">
              <Clock className="w-4 h-4 mr-2" />
              {t("governance.tabs.history")}
            </TabsTrigger>
          </TabsList>

          {/* Active Proposals Tab */}
          <TabsContent value="active-proposals" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("governance.activeProposals.title")}</h2>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                {t("governance.activeProposals.createProposal")}
              </Button>
            </div>

            <div className="grid gap-6">
              {activeProposals.map((proposal) => (
                <Card key={proposal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(proposal.type)}
                            <Badge variant="outline">{proposal.type}</Badge>
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              {proposal.deadline}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                          <p className="text-gray-600 mb-2">{proposal.description}</p>
                          <p className="text-sm text-gray-500">
                            {t("governance.activeProposals.proposedBy")}: <span className="font-medium">{proposal.proposer}</span>
                          </p>
                          {proposal.budget && (
                            <p className="text-sm text-gray-500 mt-1">
                              {t("governance.activeProposals.budget")}: <span className="font-bold text-green-600">{proposal.budget}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{t("governance.activeProposals.currentVotes")}</span>
                          <span className="font-medium">
                            {proposal.votes.yes + proposal.votes.no + proposal.votes.abstain} {t("governance.activeProposals.votes")}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <Progress value={(proposal.votes.yes / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100} className="flex-1 h-2" />
                            <span className="text-sm font-medium text-green-600">{proposal.votes.yes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <Progress value={(proposal.votes.no / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100} className="flex-1 h-2 [&>div]:bg-red-500" />
                            <span className="text-sm font-medium text-red-600">{proposal.votes.no}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1" variant="default">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t("governance.activeProposals.voteYes")}
                          </Button>
                          <Button className="flex-1" variant="destructive">
                            <XCircle className="w-4 h-4 mr-2" />
                            {t("governance.activeProposals.voteNo")}
                          </Button>
                          <Button variant="outline">
                            {t("governance.activeProposals.details")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Detection Tab */}
          <TabsContent value="ai-detection" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("governance.aiDetection.title")}</h2>
              <Button variant="outline">
                <Map className="mr-2 h-4 w-4" />
                {t("governance.aiDetection.viewMap")}
              </Button>
            </div>

            <div className="grid gap-6">
              {aiDetectedProblems.map((problem) => (
                <Card key={problem.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(problem.severity)}>
                            {problem.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{problem.type}</Badge>
                          <Badge variant="secondary">
                            {t("governance.aiDetection.confidence")}: {problem.confidence}%
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{problem.location}</CardTitle>
                        <CardDescription>{problem.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {problem.detectedAt}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {problem.coordinates.lat}, {problem.coordinates.lng}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        {t("governance.aiDetection.createAction")}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Info className="w-4 h-4 mr-2" />
                        {t("governance.aiDetection.moreInfo")}
                      </Button>
                      <Button variant="ghost" size="sm">
                        {t("governance.aiDetection.reportFalse")}
                      </Button>
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
          </TabsContent>

          {/* Manifesto Tab */}
          <TabsContent value="manifesto" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("governance.manifesto.title")}</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <GitBranch className="mr-2 h-4 w-4" />
                  {t("governance.manifesto.viewHistory")}
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
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
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                  <div className="space-y-4">
                    <section>
                      <h3 className="text-lg font-semibold mb-2">{t("governance.manifesto.mission")}</h3>
                      <p className="text-gray-600">
                        {t("governance.manifesto.missionText")}
                      </p>
                    </section>
                    <Separator />
                    <section>
                      <h3 className="text-lg font-semibold mb-2">{t("governance.manifesto.values")}</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>{t("governance.manifesto.value1")}</li>
                        <li>{t("governance.manifesto.value2")}</li>
                        <li>{t("governance.manifesto.value3")}</li>
                        <li>{t("governance.manifesto.value4")}</li>
                      </ul>
                    </section>
                    <Separator />
                    <section>
                      <h3 className="text-lg font-semibold mb-2">{t("governance.manifesto.goals")}</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>{t("governance.manifesto.goal1")}</li>
                        <li>{t("governance.manifesto.goal2")}</li>
                        <li>{t("governance.manifesto.goal3")}</li>
                      </ul>
                    </section>
                  </div>
                </ScrollArea>
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
          </TabsContent>

          {/* NGOs Tab */}
          <TabsContent value="ngos" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("governance.ngos.title")}</h2>
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                {t("governance.ngos.register")}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {registeredNGOs.map((ngo, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {ngo.name}
                          {ngo.verified && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t("governance.ngos.verified")}
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t("governance.ngos.projects")}</span>
                        <span className="font-medium">{ngo.projectsCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t("governance.ngos.raised")}</span>
                        <span className="font-medium text-green-600">{ngo.totalRaised}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t("governance.ngos.rating")}</span>
                        <span className="font-medium">⭐ {ngo.rating}</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        {t("governance.ngos.viewProfile")}
                      </Button>
                    </div>
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
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("governance.history.title")}</h2>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("governance.history.stats")}
              </Button>
            </div>

            <div className="space-y-4">
              {completedProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(proposal.type)}
                          <Badge variant={proposal.result === "approved" ? "default" : "destructive"}>
                            {proposal.result === "approved" ? t("governance.history.approved") : t("governance.history.rejected")}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {proposal.completedAt}
                          </span>
                        </div>
                        <h4 className="font-semibold">{proposal.title}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>
                            <CheckCircle2 className="w-3 h-3 inline mr-1 text-green-500" />
                            {proposal.votes.yes}
                          </span>
                          <span>
                            <XCircle className="w-3 h-3 inline mr-1 text-red-500" />
                            {proposal.votes.no}
                          </span>
                          <span>
                            {t("governance.history.abstain")}: {proposal.votes.abstain}
                          </span>
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
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
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
        </div>
      </div>
    </div>
  );
}