import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Satellite, Users, Vote, Rocket, Eye, CheckCircle, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

const stepIcons = [Satellite, Users, Vote, Rocket, Eye];

function QuickStep({
  index,
  title,
  description,
  icon: Icon,
  isActive,
}: {
  index: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <div className="relative">
      {/* Connection line to next step */}
      {index < 5 && (
        <div className="absolute left-1/2 top-20 hidden h-20 w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-200 to-transparent lg:block" />
      )}
      
      <div className={`group relative flex flex-col items-center rounded-2xl border-2 p-6 transition-all duration-500 ${
        isActive 
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-xl scale-105" 
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
      }`}>
        <div className="mb-4 flex-shrink-0">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${
            isActive
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30"
              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200"
          }`}>
            <Icon className={`h-8 w-8 transition-colors duration-500 ${
              isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"
            }`} />
          </div>
        </div>
        
        <Badge 
          variant={isActive ? "default" : "secondary"} 
          className={`mb-3 font-bold ${
            isActive ? "bg-blue-500 text-white" : ""
          }`}
        >
          ETAPA {index}
        </Badge>
        
        <h3 className="mb-2 text-center text-lg font-bold text-gray-900">
          {title}
        </h3>
        
        <p className="text-center text-sm leading-relaxed text-gray-600">
          {description}
        </p>
        
        {isActive && (
          <div className="absolute -bottom-2 -right-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: t("home.howItWorks.steps.1.title", "Detecção Inteligente"),
      description: t("home.howItWorks.steps.1.desc", "IA e satélites identificam poluição em tempo real"),
      icon: stepIcons[0],
    },
    {
      title: t("home.howItWorks.steps.2.title", "Mobilização Instantânea"),
      description: t("home.howItWorks.steps.2.desc", "Comunidade é alertada e missões são propostas"),
      icon: stepIcons[1],
    },
    {
      title: t("home.howItWorks.steps.3.title", "Votação Democrática"),
      description: t("home.howItWorks.steps.3.desc", "Apoiadores decidem prioridades e executores"),
      icon: stepIcons[2],
    },
    {
      title: t("home.howItWorks.steps.4.title", "Execução Verificada"),
      description: t("home.howItWorks.steps.4.desc", "Equipes aprovadas realizam a limpeza"),
      icon: stepIcons[3],
    },
    {
      title: t("home.howItWorks.steps.5.title", "Transparência Total"),
      description: t("home.howItWorks.steps.5.desc", "Resultados auditáveis e públicos em tempo real"),
      icon: stepIcons[4],
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-cyan-100/20 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white">
              {t("home.howItWorks.title", "COMO FUNCIONA")}
            </Badge>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {t("home.howItWorks.subtitle", "Do Problema à Solução em 5 Etapas")}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-700">
              {t("home.howItWorks.description", "Sistema inteligente que transforma indignação em ação concreta. Cada etapa é transparente, auditável e controlada pela comunidade.")}
            </p>
          </div>

          {/* Steps Grid with Animation */}
          <div className="mb-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <QuickStep
                key={index}
                index={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isActive={activeStep === index}
              />
            ))}
          </div>

          {/* CTA Section with Statistics */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 p-8 shadow-2xl md:p-12">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
            
            <div className="relative grid gap-8 lg:grid-cols-3 lg:items-center">
              <div className="lg:col-span-2">
                <h3 className="text-3xl font-bold text-white md:text-4xl">
                  {t("home.howItWorks.cta.title", "Pronto para Fazer Parte da Mudança?")}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-blue-100">
                  {t("home.howItWorks.cta.text", "Junte-se a milhares de pessoas que já estão transformando a saúde dos oceanos. Cada ação conta, cada apoio importa.")}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" variant="secondary" className="font-bold" asChild>
                    <Link to="/discover">
                      {t("home.howItWorks.cta.button", "Começar Agora")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/20" asChild>
                    <Link to="/how-it-works">
                      {t("home.howItWorks.cta.learn", "Saiba Mais")}
                      <ArrowDown className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-blue-200">{t("home.howItWorks.stat1", "Monitoramento Contínuo")}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="text-3xl font-bold text-white">48h</div>
                  <div className="text-sm text-blue-200">{t("home.howItWorks.stat2", "Resposta Rápida")}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur lg:col-span-1">
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-sm text-blue-200">{t("home.howItWorks.stat3", "Transparência Garantida")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
