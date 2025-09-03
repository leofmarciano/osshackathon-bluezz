import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, FileText, Users, Vote, Shield, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const GITHUB_URL = "https://github.com/bluezz-xyz/bluezz";

function ManifestoPrinciple({ icon: Icon, title, description, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card className={`group relative overflow-hidden border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 transition-all duration-700 hover:border-purple-300 hover:shadow-xl ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-200/20 blur-2xl transition-all duration-500 group-hover:scale-150" />
      <Icon className="mb-4 h-8 w-8 text-purple-600" />
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </Card>
  );
}

export default function Manifesto() {
  const { t } = useTranslation();
  const [particleCount, setParticleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticleCount((prev) => (prev + 1) % 20);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const principles = [
    {
      icon: Heart,
      title: t("home.manifesto.principle1.title", "Impacto Primeiro"),
      description: t("home.manifesto.principle1.desc", "Cada decisão é guiada pelo impacto real nos oceanos, não por política ou lucro."),
    },
    {
      icon: Users,
      title: t("home.manifesto.principle2.title", "Poder Comunitário"),
      description: t("home.manifesto.principle2.desc", "A comunidade decide. Sem hierarquia, sem burocracia. Voto direto em tudo."),
    },
    {
      icon: Shield,
      title: t("home.manifesto.principle3.title", "Transparência Radical"),
      description: t("home.manifesto.principle3.desc", "Código aberto, contas abertas, decisões abertas. Nada escondido, nunca."),
    },
    {
      icon: Vote,
      title: t("home.manifesto.principle4.title", "Governança Democrática"),
      description: t("home.manifesto.principle4.desc", "Um apoiador, um voto. Todas as mudanças passam por votação pública."),
    },
  ];

  return (
    <section id="manifesto" className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-200/20 blur-3xl" />
        {/* Floating particles effect */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute h-2 w-2 rounded-full bg-purple-400/20 ${
              particleCount === i ? "animate-ping" : ""
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white">
            <FileText className="mr-2 h-4 w-4" />
            {t("home.manifesto.badge", "MANIFESTO BLUEZZ")}
          </Badge>

          <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {t("home.manifesto.title", "Nossa Constituição É a Comunidade")}
          </h2>
          
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-700">
            {t(
              "home.manifesto.excerpt",
              "Cansamos de doar no escuro. Cansamos de confiar sem verificar. A Bluezz nasceu para devolver o poder às pessoas que se importam com os oceanos."
            )}
          </p>
        </div>

        {/* Principles Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, i) => (
            <ManifestoPrinciple
              key={i}
              icon={principle.icon}
              title={principle.title}
              description={principle.description}
              delay={i * 100}
            />
          ))}
        </div>

        {/* Featured Quote */}
        <div className="mt-20 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 shadow-2xl md:p-12">
          <div className="relative">
            <Sparkles className="absolute -left-4 -top-4 h-8 w-8 text-yellow-300 opacity-60" />
            <Sparkles className="absolute -bottom-4 -right-4 h-6 w-6 text-yellow-300 opacity-60" />
            
            <blockquote className="text-center">
              <p className="text-2xl font-bold italic leading-relaxed text-white md:text-3xl">
                {t("home.manifesto.quote", "\"O mal já é global. O impacto já é total. A solução precisa ser coletiva.\"")}
              </p>
              <cite className="mt-4 block text-lg text-purple-200">
                {t("home.manifesto.quote_author", "- Manifesto Bluezz, 2024")}
              </cite>
            </blockquote>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" className="group bg-gradient-to-r from-purple-500 to-pink-500 font-bold hover:from-purple-600 hover:to-pink-600" asChild>
            <Link to="/governance">
              <FileText className="mr-2 h-5 w-5" />
              {t("home.manifesto.cta_primary", "Ler Manifesto Completo")}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-purple-300 font-bold hover:bg-purple-50" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <Github className="mr-2 h-5 w-5" />
              {t("home.manifesto.cta_secondary", "Ver no GitHub")}
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-black text-purple-600">60</div>
            <p className="mt-1 text-sm text-gray-600">{t("home.manifesto.stat1", "Dias para Votação")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-600">100%</div>
            <p className="mt-1 text-sm text-gray-600">{t("home.manifesto.stat2", "Decisões Públicas")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-600">0</div>
            <p className="mt-1 text-sm text-gray-600">{t("home.manifesto.stat3", "Hierarquia")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-600">∞</div>
            <p className="mt-1 text-sm text-gray-600">{t("home.manifesto.stat4", "Transparência")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
