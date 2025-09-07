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
import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowRight,
  Globe
} from "lucide-react";

interface AggregatedDetection {
  areaId: string;
  areaName: string;
  centerLat: number;
  centerLon: number;
  detectionCount: number;
  maxSeverity: 'low' | 'medium' | 'high' | 'critical';
  totalAreaKm2: number;
  pollutionTypes: string[];
  avgConfidence: number;
  latestDetection: string;
  imageIds: string[];
}

interface DetectionDetails {
  detections: any[];
  images: Array<{
    imageId: string;
    objectKey: string;
    tileX: number;
    tileY: number;
    detectedAt: string;
  }>;
}

export function GovernancePage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const backend = useBackend();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("proposals");
  const [loading, setLoading] = useState(false);
  const [editingManifesto, setEditingManifesto] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentManifesto, setCurrentManifesto] = useState<any>(null);
  const [manifestoProposals, setManifestoProposals] = useState<any[]>([]);
  const [votingProposal, setVotingProposal] = useState<number | null>(null);
  const [aiDetections, setAiDetections] = useState<AggregatedDetection[]>([]);
  const [loadingDetections, setLoadingDetections] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<AggregatedDetection | null>(null);
  const [detectionDetails, setDetectionDetails] = useState<DetectionDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; alt: string } | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Load AI detections from backend
  const loadAIDetections = async () => {
    try {
      setLoadingDetections(true);
      const response = await backend.pollution_detector.getAggregatedDetections();
      console.log('AI Detections response:', response);
      // Ensure we're setting an array even if response is malformed
      const detections = Array.isArray(response?.detections) ? response.detections : [];
      setAiDetections(detections);
    } catch (error) {
      console.error('Failed to load AI detections:', error);
      // Set empty array on error instead of keeping stale data
      setAiDetections([]);
      toast({
        title: t("governance.ai.loadError", "Error loading detections"),
        description: t("governance.ai.loadErrorDesc", "Failed to load pollution detections"),
        variant: "destructive",
      });
    } finally {
      setLoadingDetections(false);
    }
  };

  // Load detection details
  const loadDetectionDetails = async (areaId: string) => {
    try {
      const response = await backend.pollution_detector.getDetectionsByArea(areaId);
      setDetectionDetails(response);
    } catch (error) {
      console.error('Failed to load detection details:', error);
      toast({
        title: "Error loading details",
        description: "Failed to load detection details",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (detection: AggregatedDetection) => {
    setSelectedDetection(detection);
    setShowDetailsModal(true);
    await loadDetectionDetails(detection.areaId);
  };

  // Load companies from backend
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const result = await backend.companies.getCompanies({});
      setCompanies(result.companies);
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast({
        title: t("companies.fetchError", "Error loading organizations"),
        description: t("companies.fetchErrorDesc", "Failed to load organizations"),
        variant: "destructive",
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const activeProposals = [
    {
      id: 1,
      title: t("governance.mockData.proposal1Title", "Limpeza emergencial da Baía de Guanabara"),
      type: "action",
      proposer: "ONG Oceano Limpo",
      description: t("governance.mockData.proposal1Desc", "Mobilização de equipes para remoção de óleo detectado pela IA"),
      budget: "R$ 150.000",
      votes: { yes: 1234, no: 87, abstain: 23 },
      deadline: "2024-01-20",
      status: "voting"
    },
    {
      id: 2,
      title: t("governance.mockData.proposal2Title", "Alteração no Manifesto: Inclusão de metas de microplásticos"),
      type: "manifesto",
      proposer: t("governance.mockData.community", "Comunidade"),
      description: t("governance.mockData.proposal2Desc", "Adicionar seção específica sobre combate a microplásticos"),
      votes: { yes: 892, no: 234, abstain: 45 },
      deadline: "2024-01-22",
      status: "voting"
    },
    {
      id: 3,
      title: t("governance.mockData.proposal3Title", "Registro de ONG: Instituto Mar Azul"),
      type: "ngo",
      proposer: "Instituto Mar Azul",
      description: t("governance.mockData.proposal3Desc", "Aprovação para participação no programa de limpeza oceânica"),
      documents: ["CNPJ", t("governance.mockData.statute", "Estatuto"), t("governance.mockData.certificates", "Certidões")],
      votes: { yes: 567, no: 12, abstain: 8 },
      deadline: "2024-01-18",
      status: "voting"
    }
  ];

  // Mock data - commented out for now until we have real historical data
  const completedProposals: any[] = [];
  // const completedProposals = [
  //   {
  //     id: 4,
  //     title: t("governance.mockData.completed1Title", "Instalação de barreiras de contenção em Santos"),
  //     type: "action",
  //     result: "approved",
  //     votes: { yes: 2341, no: 123, abstain: 56 },
  //     completedAt: "2024-01-10"
  //   },
  //   {
  //     id: 5,
  //     title: t("governance.mockData.completed2Title", "Criação do Conselho de Transparência"),
  //     type: "governance",
  //     result: "approved",
  //     votes: { yes: 3456, no: 234, abstain: 89 },
  //     completedAt: "2024-01-08"
  //   }
  // ];

  useEffect(() => {
    if (activeSection === "manifesto") {
      loadManifestoData();
    } else if (activeSection === "ai") {
      loadAIDetections();
    } else if (activeSection === "ngos") {
      loadCompanies();
    }
  }, [activeSection, i18n.language]);
  
  // Load all data on mount to populate stats
  useEffect(() => {
    loadAIDetections();
    loadCompanies();
    if (!currentManifesto) {
      loadManifestoData();
    }
  }, []);

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



  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
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

  // Count the number of detection areas (groups), not individual detections
  const aiDetectionAreas = aiDetections.length;
  const totalDetections = aiDetections.reduce((sum, d) => sum + d.detectionCount, 0);
  const hasUrgentDetections = aiDetections.some(d => d.maxSeverity === 'critical' || d.maxSeverity === 'high');
  
  const menuItems = [
    { id: "proposals", label: t("governance.tabs.activeProposals"), icon: Vote, badge: activeProposals.length > 0 ? activeProposals.length.toString() : undefined },
    { id: "ai", label: t("governance.tabs.aiDetection"), icon: Brain, badge: aiDetectionAreas > 0 ? aiDetectionAreas.toString() : undefined, urgent: hasUrgentDetections },
    { id: "manifesto", label: t("governance.tabs.manifesto"), icon: FileText, badge: manifestoProposals.length > 0 ? manifestoProposals.length.toString() : undefined },
    { id: "ngos", label: t("governance.tabs.ngos"), icon: Building2, badge: companies.length > 0 ? companies.length.toString() : undefined },
    { id: "history", label: t("governance.tabs.history"), icon: Clock, badge: completedProposals.length > 0 ? completedProposals.length.toString() : undefined }
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection("proposals")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.activeProposals")}</p>
                  <p className="text-2xl font-bold">{activeProposals.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeProposals.filter(p => {
                      const deadline = new Date(p.deadline);
                      const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return daysLeft <= 3;
                    }).length} {t("governance.stats.endingSoon")}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection("proposals")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.totalVotes")}</p>
                  <p className="text-2xl font-bold">
                    {activeProposals.reduce((sum, p) => sum + p.votes.yes + p.votes.no + p.votes.abstain, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t("governance.stats.thisMonth")}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 grid place-items-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection("ngos")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.registeredNGOs")}</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {companies.filter(c => c.status === 'active').length} {t("governance.stats.verified")}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 grid place-items-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection("ai")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("governance.stats.aiDetections")}</p>
                  <p className="text-2xl font-bold">{aiDetectionAreas}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalDetections} {t("governance.stats.totalDetections", "total detections")} • {aiDetections.filter(d => d.maxSeverity === 'critical' || d.maxSeverity === 'high').length} {t("governance.stats.criticalIssues")}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full grid place-items-center ${
                  hasUrgentDetections ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-orange-100 text-orange-600'
                }`}>
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
            <Card className="sticky top-4 border-0 shadow-lg">
              
              <CardContent className="p-3">
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md transform scale-[1.02]"
                            : "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            isActive ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge 
                            variant={item.urgent ? "destructive" : isActive ? "secondary" : "outline"} 
                            className={`ml-auto h-6 px-2 min-w-[24px] flex items-center justify-center ${
                              isActive && !item.urgent ? 'bg-white/20 text-white border-white/30' : ''
                            } ${
                              item.urgent ? 'animate-pulse' : ''
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md" 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("governance.createProposal")}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    {t("governance.lastUpdate", "Last update")}: {new Date().toLocaleTimeString()}
                  </p>
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
                                  <span className="text-gray-600">{total} {t("governance.votes", "votos")}</span>
                                  <span className="font-medium text-green-600">
                                    {Math.round(yesPercentage)}% {t("governance.approval", "aprovação")}
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
                </div>

                {loadingDetections ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : aiDetections.length > 0 ? (
                  <div className="grid gap-4">
                    {aiDetections.map((detection) => {
                      const pollutionType = detection.pollutionTypes.map(type => 
                        type === 'oil' ? t("governance.aiDetection.oil") : 
                        type === 'plastic' ? t("governance.aiDetection.plastic") : 
                        type
                      ).join(', ');
                      const formattedDate = new Date(detection.latestDetection).toLocaleDateString('pt-BR');
                      
                      return (
                        <Card key={detection.areaId} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`h-10 w-10 rounded-lg grid place-items-center flex-shrink-0 ${
                                detection.maxSeverity === 'critical' ? 'bg-red-100 text-red-600' :
                                detection.maxSeverity === 'high' ? 'bg-orange-100 text-orange-600' :
                                detection.maxSeverity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{detection.areaName}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {detection.detectionCount} {t("governance.aiDetection.detectionsOf")} {pollutionType} {t("governance.aiDetection.in")} {detection.totalAreaKm2.toFixed(1)} km²
                                    </p>
                                  </div>
                                  <Badge variant={getSeverityColor(detection.maxSeverity)}>
                                    {t(`governance.aiDetection.severityLevels.${detection.maxSeverity}`).toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formattedDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {t("governance.aiDetection.confidence")}: {Math.round(detection.avgConfidence * 100)}%
                                  </span>
                                  <span className="text-xs">
                                    {detection.centerLat.toFixed(4)}, {detection.centerLon.toFixed(4)}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <Button size="sm" variant="default">
                                    <Target className="w-3 h-3 mr-1" />
                                    {t("governance.aiDetection.createAction")}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewDetails(detection)}
                                  >
                                    <Info className="w-3 h-3 mr-1" />
                                    {t("governance.aiDetection.moreInfo")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      {t("governance.aiDetection.noDetections")}
                    </AlertDescription>
                  </Alert>
                )}

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
                  <h2 className="text-2xl font-bold">{t("companies.title")}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/companies">
                        <Eye className="w-4 h-4 mr-2" />
                        {t("governance.viewAll")}
                      </Link>
                    </Button>
                    <Button size="sm" onClick={() => navigate("/companies/register")}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("companies.register.button")}
                    </Button>
                  </div>
                </div>

                {/* Stats for Active vs Pending */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("companies.tabs.active")}</p>
                          <p className="text-2xl font-bold">
                            {companies.filter(c => c.status === 'active').length}
                          </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("companies.tabs.pending")}</p>
                          <p className="text-2xl font-bold">
                            {companies.filter(c => c.status === 'pending').length}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{companies.length}</p>
                        </div>
                        <Building2 className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Companies Grid */}
                {loadingCompanies ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {companies.slice(0, 6).map((company) => {
                      const totalVotes = (company.votes_yes || 0) + (company.votes_no || 0) + (company.votes_abstain || 0);
                      const votePercentage = totalVotes > 0 
                        ? Math.round((company.votes_yes / totalVotes) * 100) 
                        : 0;
                      const daysLeft = company.voting_ends_at
                        ? Math.ceil((new Date(company.voting_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
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
                                  {company.status === "active" && (
                                    <Badge variant="default" className="bg-green-500">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      {t("companies.status.active")}
                                    </Badge>
                                  )}
                                  <Badge variant="outline">
                                    {t(`companies.categories.${company.category}`)}
                                  </Badge>
                                  {company.status === "pending" && (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                      {t("companies.status.pending")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {company.description}
                            </p>
                            
                            {/* Voting Progress for Pending Companies */}
                            {company.status === "pending" && totalVotes > 0 && (
                              <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-gray-600">
                                    {daysLeft > 0 ? `${daysLeft} ${t("governance.manifesto.daysLeft")}` : t("companies.voting.ended")}
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {votePercentage}% {t("companies.approval")}
                                  </span>
                                </div>
                                <Progress value={votePercentage} className="h-2" />
                                <div className="flex justify-between mt-2 text-xs">
                                  <span className="text-green-600">
                                    ✓ {company.votes_yes || 0} {t("companies.profile.voting.yes")}
                                  </span>
                                  <span className="text-red-600">
                                    ✗ {company.votes_no || 0} {t("companies.profile.voting.no")}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Location and Website */}
                            <div className="text-sm text-gray-500 mb-3">
                              <p className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {company.city}, {company.state || company.country}
                              </p>
                              {company.website && (
                                <p className="flex items-center gap-1 mt-1">
                                  <Globe className="w-3 h-3" />
                                  {company.website}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1" 
                                size="sm"
                                asChild
                              >
                                <Link to={`/companies/${company.id}`}>
                                  {t("companies.viewProfile")}
                                </Link>
                              </Button>
                              {company.status === "pending" && (
                                <Button size="sm" className="flex-1" onClick={() => navigate(`/companies/${company.id}`)}>
                                  <Vote className="w-3 h-3 mr-1" />
                                  {t("governance.voteNow")}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <Alert className="mt-6">
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

                {completedProposals.length > 0 ? (
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
                ) : (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>{t("governance.history.noHistory", "No voting history yet")}</AlertTitle>
                    <AlertDescription>
                      {t("governance.history.noHistoryDesc", "Completed proposals will appear here after voting ends.")}
                    </AlertDescription>
                  </Alert>
                )}
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

      {/* Image Zoom Modal */}
      <Dialog open={!!expandedImage} onOpenChange={(open) => !open && setExpandedImage(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {expandedImage && (
            <div className="relative">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <img 
                src={expandedImage.url}
                alt={expandedImage.alt}
                className="w-full h-auto max-h-[90vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojOTk5O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjIwcHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <p className="text-center">{expandedImage.alt}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detection Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDetection?.areaName}</DialogTitle>
            <DialogDescription>
              {selectedDetection?.detectionCount} {t("governance.aiDetection.detections")} • 
              {selectedDetection?.totalAreaKm2.toFixed(1)} km² • 
              {t("governance.aiDetection.severity")}: {selectedDetection?.maxSeverity && t(`governance.aiDetection.severityLevels.${selectedDetection.maxSeverity}`)}
            </DialogDescription>
          </DialogHeader>

          {detectionDetails && (
            <div className="space-y-6">
              {/* Images Grid */}
              <div>
                <h3 className="font-semibold mb-3">{t("governance.aiDetection.capturedImages")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {detectionDetails.images.map((image) => {
                    // Use the backend base URL for the image
                    const baseUrl = (window as any).VITE_ENCORE_API_URL || 'http://localhost:4000';
                    const imageUrl = `${baseUrl}/ocean-monitor/images/${encodeURIComponent(image.objectKey)}`;
                    const imageAlt = `Tile ${image.tileX},${image.tileY}`;
                    
                    return (
                      <div 
                        key={image.imageId} 
                        className="relative group cursor-pointer"
                        onClick={() => setExpandedImage({ url: imageUrl, alt: imageAlt })}
                      >
                        <img 
                          src={imageUrl}
                          alt={imageAlt}
                          className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            console.error('Failed to load image:', image.objectKey);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojOTk5O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjIwcHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                          <div className="text-white text-center">
                            <p className="text-sm font-medium mb-1">{t("governance.aiDetection.clickToZoom")}</p>
                            <p className="text-xs">Tile: {image.tileX},{image.tileY}</p>
                            <p className="text-xs">{new Date(image.detectedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detections List */}
              <div>
                <h3 className="font-semibold mb-3">{t("governance.aiDetection.individualDetections")}</h3>
                <div className="space-y-3">
                  {detectionDetails.detections.map((det: any) => (
                    <Card key={det.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={det.pollutionType === 'oil' ? 'destructive' : 'default'}>
                                {det.pollutionType === 'oil' ? t("governance.aiDetection.oil") : t("governance.aiDetection.plastic")}
                              </Badge>
                              <Badge variant={getSeverityColor(det.severity)}>
                                {t(`governance.aiDetection.severityLevels.${det.severity}`)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {(det.confidence * 100).toFixed(0)}% {t("governance.aiDetection.confidence")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{det.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("governance.aiDetection.affectedArea")}: {det.estimatedAreaKm2.toFixed(2)} km² • 
                              Tile: {det.tileX},{det.tileY}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}