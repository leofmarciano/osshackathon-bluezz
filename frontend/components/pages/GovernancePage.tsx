import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Streamdown } from "streamdown";
import { useBackend } from "@/lib/useBackend";
import { ManifestoEditor } from "../manifesto/ManifestoEditor";
import { ManifestoHistoryModal } from "../manifesto/ManifestoHistoryModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CompanyRegistrationForm from "../companies/CompanyRegistrationForm";
import { useNavigate, Link } from "react-router-dom";
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
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const backend = useBackend();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("proposals");
  const [loading, setLoading] = useState(false);
  const [editingManifesto, setEditingManifesto] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false);
  const [currentManifesto, setCurrentManifesto] = useState<any>(null);
  const [manifestoProposals, setManifestoProposals] = useState<any[]>([]);
  const [votingProposal, setVotingProposal] = useState<number | null>(null);

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

  useEffect(() => {
    if (activeSection === "manifesto") {
      loadManifestoData();
    }
  }, [activeSection, i18n.language]);

  const loadManifestoData = async () => {
    try {
      setLoading(true);
      // Load current manifesto with translations
      const manifestoRes = await backend.manifesto.getCurrent();
      
      // Fetch the manifesto with translation for current language
      const translatedRes = await backend.manifesto.getManifestoWithTranslations(
        manifestoRes.manifesto.id.toString(),
        { language: i18n.language }
      );
      
      setCurrentManifesto(translatedRes.manifesto);
      
      // Load active proposals (filter by voting status)
      const proposalsRes = await backend.manifesto.getProposals({ status: "voting" });
      setManifestoProposals(proposalsRes.proposals);
    } catch (error) {
      console.error("Failed to load manifesto data:", error);
      toast({
        title: t("manifesto.loadError"),
        description: t("manifesto.loadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, voteType: 'yes' | 'no' | 'abstain') => {
    try {
      setVotingProposal(proposalId);
      const userId = localStorage.getItem("userId") || "anonymous";
      
      await backend.manifesto.voteOnProposal({
        proposal_id: proposalId,
        user_id: userId,
        vote_type: voteType,
      });

      toast({
        title: t("manifesto.voteSuccess"),
        description: t("manifesto.voteSuccessDesc"),
      });

      // Reload proposals
      await loadManifestoData();
    } catch (error: any) {
      console.error("Vote failed:", error);
      toast({
        title: t("manifesto.voteError"),
        description: error?.message || t("manifesto.voteErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setVotingProposal(null);
    }
  };

  const handleCompanySubmit = async (data: any) => {
    console.log("Company registration data:", data);
    // Here you would submit to your backend
    toast({
      title: t("companies.register.success", "Organização submetida"),
      description: t("companies.register.successDesc", "Sua organização foi submetida para votação."),
    });
    setShowCompanyRegistration(false);
    // Optionally redirect to companies page
    navigate("/companies");
  };

  // Mock data for companies - in production this would come from API
  const registeredCompanies = [
    {
      id: "1",
      name: "Ocean Cleanup Brasil",
      type: "ngo",
      status: "active",
      verified: true,
      projectsCompleted: 12,
      totalRaised: "R$ 2.3M",
      rating: 4.8,
      followers: 12500,
      category: "ocean_cleanup"
    },
    {
      id: "2",
      name: "Marine Tech Solutions",
      type: "company",
      status: "pending",
      verified: false,
      projectsCompleted: 0,
      totalRaised: "R$ 0",
      rating: 0,
      followers: 340,
      category: "technology",
      votes: { yes: 234, no: 56, total: 290 },
      votingEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      name: "Guardiões do Mar",
      type: "ngo",
      status: "active",
      verified: true,
      projectsCompleted: 8,
      totalRaised: "R$ 1.1M",
      rating: 4.6,
      followers: 8900,
      category: "marine_conservation"
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
                {editingManifesto ? (
                  <ManifestoEditor 
                    onClose={() => setEditingManifesto(false)}
                    onSuccess={() => {
                      setEditingManifesto(false);
                      loadManifestoData();
                    }}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">{t("governance.manifesto.title")}</h2>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowHistoryModal(true)}
                        >
                          <GitBranch className="w-4 h-4 mr-2" />
                          {t("governance.manifesto.viewHistory")}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setEditingManifesto(true)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {t("governance.manifesto.propose")}
                        </Button>
                      </div>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("governance.manifesto.current")}</CardTitle>
                        <CardDescription>
                          {currentManifesto && (
                            <>
                              {t("governance.manifesto.version")}: {currentManifesto.version_number} • 
                              {t("governance.manifesto.author")}: {currentManifesto.author_name} • 
                              {t("governance.manifesto.lastUpdated")}: {new Date(currentManifesto.created_at).toLocaleDateString('pt-BR')}
                            </>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : currentManifesto ? (
                          <div className="prose prose-sm max-w-none">
                            <Streamdown>
                              {currentManifesto.content}
                            </Streamdown>
                          </div>
                        ) : (
                          <Alert>
                            <AlertDescription>
                              {t("governance.manifesto.noContent")}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    {manifestoProposals.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("governance.manifesto.pendingChanges")}</CardTitle>
                          <CardDescription>
                            {manifestoProposals.length} {t("governance.manifesto.activeProposals")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {manifestoProposals.map((proposal) => {
                              const total = proposal.votes_yes + proposal.votes_no + proposal.votes_abstain;
                              const yesPercentage = total > 0 ? (proposal.votes_yes / total) * 100 : 0;
                              const daysLeft = Math.ceil(
                                (new Date(proposal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                              );

                              return (
                                <div key={proposal.id} className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold">{proposal.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
                                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {proposal.author_name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {daysLeft} {t("governance.manifesto.daysLeft")}
                                        </span>
                                      </div>
                                    </div>
                                    <Badge variant={proposal.status === 'voting' ? 'default' : 'secondary'}>
                                      {t(`governance.manifesto.status.${proposal.status}`)}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {total} {t("governance.manifesto.totalVotes")}
                                      </span>
                                      <span className="font-medium text-green-600">
                                        {Math.round(yesPercentage)}% {t("governance.manifesto.approval")}
                                      </span>
                                    </div>
                                    <Progress value={yesPercentage} className="h-2" />
                                    
                                    <div className="flex gap-2 mt-3">
                                      <Button 
                                        size="sm" 
                                        className="flex-1"
                                        disabled={votingProposal === proposal.id || proposal.status !== 'voting'}
                                        onClick={() => handleVote(proposal.id, 'yes')}
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        {t("governance.manifesto.voteYes")} ({proposal.votes_yes})
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className="flex-1"
                                        disabled={votingProposal === proposal.id || proposal.status !== 'voting'}
                                        onClick={() => handleVote(proposal.id, 'no')}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        {t("governance.manifesto.voteNo")} ({proposal.votes_no})
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        disabled={votingProposal === proposal.id || proposal.status !== 'voting'}
                                        onClick={() => handleVote(proposal.id, 'abstain')}
                                      >
                                        {t("governance.manifesto.abstain")} ({proposal.votes_abstain})
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                <ManifestoHistoryModal 
                  isOpen={showHistoryModal}
                  onClose={() => setShowHistoryModal(false)}
                />
              </>
            )}

            {/* NGOs/Companies Section */}
            {activeSection === "ngos" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t("companies.title", "Organizações Parceiras")}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/companies">
                        <Eye className="w-4 h-4 mr-2" />
                        {t("companies.viewAll", "Ver Todas")}
                      </Link>
                    </Button>
                    <Button size="sm" onClick={() => setShowCompanyRegistration(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("companies.register.title", "Cadastrar Organização")}
                    </Button>
                  </div>
                </div>

                {/* Stats for Active vs Pending */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("companies.stats.active", "Ativas")}</p>
                          <p className="text-2xl font-bold">18</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("companies.stats.pending", "Em Votação")}</p>
                          <p className="text-2xl font-bold">6</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("companies.stats.total", "Total")}</p>
                          <p className="text-2xl font-bold">24</p>
                        </div>
                        <Building2 className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Companies Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {registeredCompanies.map((company) => {
                    const votePercentage = company.votes 
                      ? Math.round((company.votes.yes / company.votes.total) * 100) 
                      : 0;
                    const daysLeft = company.votingEndsAt
                      ? Math.ceil((new Date(company.votingEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <Card key={company.id} className="hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                                <Badge variant={company.type === "ngo" ? "default" : "secondary"}>
                                  {company.type === "ngo" ? "ONG" : t("companies.types.company")}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                {company.verified && (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {t("companies.verified", "Verificada")}
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {t(`companies.categories.${company.category}`)}
                                </Badge>
                                {company.status === "pending" && (
                                  <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                                    {t("companies.status.pending", "Em Votação")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {company.rating > 0 && (
                              <div className="text-right">
                                <div className="text-sm text-gray-500">⭐ {company.rating}</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Voting Progress for Pending Companies */}
                          {company.status === "pending" && company.votes && (
                            <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">
                                  {daysLeft} {t("companies.voting.daysLeft", "dias restantes")}
                                </span>
                                <span className="font-medium text-green-600">
                                  {votePercentage}% {t("companies.approval", "aprovação")}
                                </span>
                              </div>
                              <Progress value={votePercentage} className="h-2" />
                              <div className="flex justify-between mt-2 text-xs">
                                <span className="text-green-600">
                                  ✓ {company.votes.yes} {t("companies.votes.yes", "sim")}
                                </span>
                                <span className="text-red-600">
                                  ✗ {company.votes.no} {t("companies.votes.no", "não")}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-gray-500">{t("companies.stats.followers", "Seguidores")}</p>
                              <p className="font-medium">{company.followers.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">{t("companies.stats.projects", "Projetos")}</p>
                              <p className="font-medium">{company.projectsCompleted}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">{t("companies.stats.raised", "Arrecadado")}</p>
                              <p className="font-medium text-green-600">{company.totalRaised}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/companies/${company.id}`}>
                                {t("companies.viewProfile", "Ver Perfil")}
                              </Link>
                            </Button>
                            {company.status === "pending" && (
                              <Button size="sm" className="flex-1">
                                <Vote className="w-3 h-3 mr-1" />
                                {t("companies.vote", "Votar")}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Alert className="mt-6">
                  <Shield className="h-4 w-4" />
                  <AlertTitle>{t("companies.verification.title", "Processo de Verificação")}</AlertTitle>
                  <AlertDescription>
                    {t("companies.verification.desc", "Todas as organizações passam por um rigoroso processo de verificação incluindo análise de documentos, histórico e votação da comunidade. O período de votação é de 30 dias e requer maioria simples para aprovação.")}
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

      {/* Company Registration Modal */}
      <Dialog open={showCompanyRegistration} onOpenChange={setShowCompanyRegistration}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("companies.register.title", "Cadastrar Organização")}</DialogTitle>
            <DialogDescription>
              {t("companies.register.description", "Preencha os dados para submeter sua organização para votação.")}
            </DialogDescription>
          </DialogHeader>
          <CompanyRegistrationForm 
            onSubmit={handleCompanySubmit}
            onCancel={() => setShowCompanyRegistration(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}