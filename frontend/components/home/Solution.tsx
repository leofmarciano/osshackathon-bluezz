import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Satellite, Users, Github, Target, Shield, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Pillar({
  Icon,
  title,
  description,
  features,
  color = "blue",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features?: string[];
  color?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200 hover:border-blue-400",
    green: "bg-green-500/10 text-green-600 border-green-200 hover:border-green-400",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200 hover:border-purple-400",
  };

  return (
    <Card className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${colorClasses[color].split(" ")[2]} ${colorClasses[color].split(" ")[3]}`}>
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${colorClasses[color].split(" ")[0]} opacity-20 blur-2xl transition-all duration-300 group-hover:scale-150`} />
      <CardHeader className="text-center">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colorClasses[color].split(" ")[0]} transition-all duration-300 group-hover:scale-110`}>
          <Icon className={`h-7 w-7 ${colorClasses[color].split(" ")[1]}`} />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="mt-2 text-base">{description}</CardDescription>
      </CardHeader>
      {features && (
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className={`mt-1 block h-1.5 w-1.5 rounded-full ${colorClasses[color].split(" ")[0].replace("/10", "")} opacity-60`} />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

export default function Solution() {
  const { t } = useTranslation();

  return (
    <section id="solution" className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            <Target className="h-4 w-4" />
            {t("home.solution.badge", "NOSSA MISSÃO")}
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {t("home.solution.title", "O Bluezz Ataca o Mal pela Raiz")}
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            {t(
              "home.solution.subtitle",
              "Monitorar vazamentos de óleo e lixo plástico em tempo real. Mobilizar a comunidade global para financiar missões de limpeza transparentes e auditadas."
            )}
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <Pillar
            Icon={Satellite}
            title={t("home.solution.tech.title", "Monitoramento em Tempo Real")}
            description={t(
              "home.solution.tech.desc",
              "Tecnologia avançada para detectar e rastrear poluição nos oceanos 24/7."
            )}
            features={[
              t("home.solution.tech.f1", "IA detecta vazamentos de óleo e concentrações de plástico"),
              t("home.solution.tech.f2", "Satélites e drones mapeiam áreas críticas"),
              t("home.solution.tech.f3", "Alertas automáticos para resposta rápida"),
            ]}
            color="blue"
          />
          <Pillar
            Icon={Users}
            title={t("home.solution.governance.title", "Mobilização Comunitária")}
            description={t(
              "home.solution.governance.desc",
              "Poder de decisão nas mãos de quem se importa com os oceanos."
            )}
            features={[
              t("home.solution.governance.f1", "Votação democrática em todas as missões"),
              t("home.solution.governance.f2", "Financiamento coletivo transparente"),
              t("home.solution.governance.f3", "Comunidade escolhe executores verificados"),
            ]}
            color="green"
          />
          <Pillar
            Icon={Shield}
            title={t("home.solution.transparency.title", "100% Auditável e Transparente")}
            description={t(
              "home.solution.transparency.desc",
              "Cada centavo rastreado, cada ação documentada, tudo público."
            )}
            features={[
              t("home.solution.transparency.f1", "Código 100% open source no GitHub"),
              t("home.solution.transparency.f2", "Blockchain para rastreabilidade total"),
              t("home.solution.transparency.f3", "Relatórios públicos de impacto"),
            ]}
            color="purple"
          />
        </div>

        {/* Impact Section */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white shadow-2xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-3xl font-bold md:text-4xl">
                {t("home.solution.impact.title", "O Impacto que Queremos Gerar")}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-blue-100">
                {t("home.solution.impact.text", "Cada ação no Bluezz é um ataque direto ao maior inimigo silencioso da vida. Não estamos falando de 'salvar peixinhos': estamos falando de garantir oxigênio, alimentos e saúde para todas as espécies, inclusive a humana.")}
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary" className="font-bold" asChild>
                  <Link to="/discover">
                    {t("home.solution.cta", "Participe da Mudança")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                <Eye className="mb-3 h-8 w-8 text-blue-200" />
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-blue-200">{t("home.solution.stat1", "Transparência Total")}</div>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                <Users className="mb-3 h-8 w-8 text-blue-200" />
                <div className="text-3xl font-bold">1M+</div>
                <div className="text-sm text-blue-200">{t("home.solution.stat2", "Meta de Apoiadores")}</div>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                <Target className="mb-3 h-8 w-8 text-blue-200" />
                <div className="text-3xl font-bold">365</div>
                <div className="text-sm text-blue-200">{t("home.solution.stat3", "Dias de Operação")}</div>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                <Shield className="mb-3 h-8 w-8 text-blue-200" />
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-blue-200">{t("home.solution.stat4", "Monitoramento")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
