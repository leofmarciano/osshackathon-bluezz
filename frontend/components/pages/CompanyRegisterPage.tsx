import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import CompanyRegistrationForm from "../companies/CompanyRegistrationForm";
import {
  ArrowLeft,
  Building2,
  Vote,
  Shield,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Waves,
  Target,
  FileText,
  TrendingUp,
  Award,
  Zap,
  Heart
} from "lucide-react";

export function CompanyRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const benefits = [
    {
      icon: Users,
      title: t("companies.register.benefits.visibility", "Visibilidade Global"),
      description: t("companies.register.benefits.visibilityDesc", "Alcance milhares de apoiadores e parceiros em todo o Brasil")
    },
    {
      icon: TrendingUp,
      title: t("companies.register.benefits.funding", "Captação de Recursos"),
      description: t("companies.register.benefits.fundingDesc", "Acesse financiamento coletivo e parcerias estratégicas")
    },
    {
      icon: Shield,
      title: t("companies.register.benefits.credibility", "Credibilidade"),
      description: t("companies.register.benefits.credibilityDesc", "Selo de verificação e transparência aumentam a confiança")
    },
    {
      icon: Target,
      title: t("companies.register.benefits.impact", "Maior Impacto"),
      description: t("companies.register.benefits.impactDesc", "Colabore com outras organizações e multiplique seus resultados")
    }
  ];

  const votingProcess = [
    {
      step: 1,
      title: t("companies.register.process.submit", "Submissão"),
      description: t("companies.register.process.submitDesc", "Preencha o formulário com informações completas"),
      icon: FileText
    },
    {
      step: 2,
      title: t("companies.register.process.review", "Revisão"),
      description: t("companies.register.process.reviewDesc", "A comunidade analisa sua proposta"),
      icon: Users
    },
    {
      step: 3,
      title: t("companies.register.process.voting", "Votação (7 dias)"),
      description: t("companies.register.process.votingDesc", "Período de votação aberta para todos"),
      icon: Vote
    },
    {
      step: 4,
      title: t("companies.register.process.approval", "Aprovação"),
      description: t("companies.register.process.approvalDesc", "Com maioria simples, sua organização é aprovada"),
      icon: CheckCircle2
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative container mx-auto px-4 py-16">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back", "Voltar")}
          </Button>
          
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Zap className="w-3 h-3 mr-1" />
              {t("companies.register.badge", "Cadastro de Organização")}
            </Badge>
            
            <h1 className="text-5xl font-bold mb-4">
              {t("companies.register.heroTitle", "Junte-se ao Movimento")}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t("companies.register.heroSubtitle", "Cadastre sua organização e faça parte da maior rede de proteção oceânica do Brasil")}
            </p>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">24</span>
                <span className="text-blue-100">{t("companies.stats.registered", "Organizações ativas")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">12.5K</span>
                <span className="text-blue-100">{t("companies.stats.supporters", "Apoiadores")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">R$ 5.2M</span>
                <span className="text-blue-100">{t("companies.stats.raised", "Arrecadados")}</span>
              </div>
            </div>
          </div>
        </div>
        <Waves className="absolute bottom-0 right-0 w-96 h-96 text-white/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("companies.register.benefitsTitle", "Por que cadastrar sua organização?")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full grid place-items-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Voting Process */}
        <Card className="mb-12 border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t("companies.register.processTitle", "Como funciona o processo?")}
            </CardTitle>
            <CardDescription>
              {t("companies.register.processDesc", "Processo democrático e transparente de aprovação")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {votingProcess.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative">
                    {index < votingProcess.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-100 -z-10" />
                    )}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full grid place-items-center mx-auto mb-4 text-white shadow-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Alert className="mt-8 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertTitle>{t("companies.register.votingInfo", "Sobre a votação")}</AlertTitle>
              <AlertDescription>
                {t("companies.register.votingInfoDesc", "A votação dura 7 dias e requer maioria simples (>50% de votos positivos) para aprovação. Todos os membros verificados da comunidade podem votar.")}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
            <CardTitle className="text-2xl">
              {t("companies.register.formTitle", "Formulário de Cadastro")}
            </CardTitle>
            <CardDescription>
              {t("companies.register.formDesc", "Preencha com atenção. Informações completas aumentam suas chances de aprovação.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <CompanyRegistrationForm 
              onCancel={() => navigate(-1)}
            />
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Alert className="mt-8 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("companies.register.important", "Importante")}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>{t("companies.register.note1", "Você será o responsável pela organização e poderá gerenciar seu perfil")}</li>
              <li>{t("companies.register.note2", "Todos os documentos enviados serão públicos para garantir transparência")}</li>
              <li>{t("companies.register.note3", "A organização só ficará ativa após aprovação pela comunidade")}</li>
              <li>{t("companies.register.note4", "O processo de votação não pode ser cancelado após o início")}</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}