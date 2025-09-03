import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, GitFork, Eye, Gauge, X, Check, TrendingUp, Users, Shield, Zap } from "lucide-react";
import React, { useState } from "react";

function ComparisonRow({
  icon,
  label,
  ongs,
  bluezz,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  ongs: string;
  bluezz: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all duration-700 hover:border-blue-400 hover:shadow-xl md:grid-cols-3 ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}>
      <div className="flex items-center gap-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 md:border-b-0 md:border-r">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          {icon}
        </div>
        <span className="font-semibold text-gray-900">{label}</span>
      </div>
      <div className="relative flex items-start border-b border-gray-200 bg-gradient-to-br from-red-50 to-orange-50 p-5 md:border-b-0 md:border-r">
        <div className="mr-3 flex-shrink-0">
          <X className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-sm leading-relaxed text-gray-700">{ongs}</p>
      </div>
      <div className="relative flex items-start bg-gradient-to-br from-green-50 to-emerald-50 p-5">
        <div className="mr-3 flex-shrink-0">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-sm font-medium leading-relaxed text-gray-800">{bluezz}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500 shadow-blue-500/30",
    green: "from-green-500 to-emerald-500 shadow-green-500/30",
    purple: "from-purple-500 to-pink-500 shadow-purple-500/30",
    orange: "from-orange-500 to-red-500 shadow-orange-500/30",
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`} />
      <CardContent className="relative p-6">
        <Icon className="mb-4 h-8 w-8 text-gray-700" />
        <div className="text-3xl font-black text-gray-900">{value}</div>
        <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function Differentials() {
  const { t } = useTranslation();

  return (
    <section id="differentials" className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-green-100/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white">
            {t("home.differentials.badge", "DIFERENÇA QUE IMPORTA")}
          </Badge>
          
          <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {t("home.differentials.title", "Por Que o Bluezz É a Revolução")}
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            {t(
              "home.differentials.subtitle",
              "Transparência radical, governança comunitária e tecnologia de ponta. Comparado com o modelo tradicional, somos o futuro."
            )}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Shield}
            value="100%"
            label={t("home.differentials.stat1", "Open Source")}
            color="blue"
          />
          <StatCard
            icon={Users}
            value="24/7"
            label={t("home.differentials.stat2", "Governança Aberta")}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            value="0%"
            label={t("home.differentials.stat3", "Taxa Administrativa")}
            color="purple"
          />
          <StatCard
            icon={Zap}
            value="48h"
            label={t("home.differentials.stat4", "Tempo de Resposta")}
            color="orange"
          />
        </div>

        {/* Comparison Table */}
        <div className="mt-20">
          <div className="mb-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {t("home.differentials.comparison_title", "Bluezz vs. Modelo Tradicional")}
            </h3>
            <p className="mt-3 text-lg text-gray-600">
              {t("home.differentials.comparison_subtitle", "A diferença está nos detalhes - e nos resultados")}
            </p>
          </div>

          {/* Table Headers */}
          <div className="mb-6 grid grid-cols-1 gap-0 overflow-hidden rounded-xl border-2 border-gray-300 bg-gradient-to-r from-gray-800 to-gray-900 text-white md:grid-cols-3">
            <div className="border-b border-gray-700 p-5 text-center font-bold md:border-b-0 md:border-r">
              {t("home.differentials.headers.aspect", "🎯 Aspecto")}
            </div>
            <div className="border-b border-gray-700 p-5 text-center font-bold md:border-b-0 md:border-r">
              {t("home.differentials.headers.traditional_ngos", "❌ ONGs Tradicionais")}
            </div>
            <div className="p-5 text-center font-bold">
              {t("home.differentials.headers.bluezz", "✅ Bluezz")}
            </div>
          </div>

          <div className="space-y-4">
            <ComparisonRow
              icon={<Eye className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row1.label", "Rastreio de Doações")}
              ongs={t(
                "home.differentials.row1.ongs",
                "Relatórios anuais genéricos, sem detalhes de uso"
              )}
              bluezz={t(
                "home.differentials.row1.bluezz",
                "Blockchain + Dashboard público em tempo real"
              )}
              delay={100}
            />
            <ComparisonRow
              icon={<Lock className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row2.label", "Tomada de Decisão")}
              ongs={t(
                "home.differentials.row2.ongs",
                "Diretoria fechada decide tudo internamente"
              )}
              bluezz={t(
                "home.differentials.row2.bluezz",
                "Comunidade vota em todas as missões e ações"
              )}
              delay={200}
            />
            <ComparisonRow
              icon={<GitFork className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row3.label", "Tecnologia")}
              ongs={t(
                "home.differentials.row3.ongs",
                "Sistemas proprietários, código fechado"
              )}
              bluezz={t(
                "home.differentials.row3.bluezz",
                "100% open source no GitHub, auditável por todos"
              )}
              delay={300}
            />
            <ComparisonRow
              icon={<Gauge className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row4.label", "Velocidade")}
              ongs={t(
                "home.differentials.row4.ongs",
                "Meses para aprovar e executar projetos"
              )}
              bluezz={t(
                "home.differentials.row4.bluezz",
                "48h da detecção à mobilização comunitária"
              )}
              delay={400}
            />
            <ComparisonRow
              icon={<Shield className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row5.label", "Prestação de Contas")}
              ongs={t(
                "home.differentials.row5.ongs",
                "Relatórios periódicos com informações limitadas"
              )}
              bluezz={t(
                "home.differentials.row5.bluezz",
                "Evidências fotográficas + GPS + blockchain de cada ação"
              )}
              delay={500}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white shadow-2xl md:p-12">
          <h3 className="text-3xl font-bold md:text-4xl">
            {t("home.differentials.cta.title", "Chega de Promessas Vazias")}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-blue-100">
            {t("home.differentials.cta.text", "Com o Bluezz, cada real doado vira ação verificável. Junte-se à revolução da transparência ambiental.")}
          </p>
        </div>
      </div>
    </section>
  );
}
