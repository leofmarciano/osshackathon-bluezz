import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, GitFork, Eye, Gauge } from "lucide-react";

function Row({
  icon,
  label,
  ongs,
  bluezz,
}: {
  icon: React.ReactNode;
  label: string;
  ongs: string;
  bluezz: string;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 rounded-lg border bg-white p-4 md:grid-cols-3">
      <div className="flex items-center gap-2 text-gray-900">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">{ongs}</div>
      <div className="rounded-md bg-green-50 p-3 text-sm text-gray-800">{bluezz}</div>
    </div>
  );
}

export default function Differentials() {
  const { t } = useTranslation();

  return (
    <section id="differentials" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t("home.differentials.title", "Por que a Bluezz é diferente")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t(
              "home.differentials.subtitle",
              "Transparência e governança abertas desde o primeiro dia."
            )}
          </p>
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-base text-gray-700">
              {t("home.differentials.comparison_title", "Comparação direta")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Headers */}
            <div className="grid grid-cols-1 items-center gap-4 rounded-lg bg-gray-100 p-4 md:grid-cols-3">
              <div className="font-semibold text-gray-900 text-center md:text-left">
                {t("home.differentials.headers.aspect", "Aspecto")}
              </div>
              <div className="font-semibold text-gray-900 text-center">
                {t("home.differentials.headers.traditional_ngos", "ONGs Tradicionais")}
              </div>
              <div className="font-semibold text-gray-900 text-center">
                {t("home.differentials.headers.bluezz", "Bluezz")}
              </div>
            </div>

            <Row
              icon={<Eye className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row1.label", "Rastreabilidade das doações")}
              ongs={t(
                "home.differentials.row1.ongs",
                "Sem rastreio claro do uso dos recursos."
              )}
              bluezz={t(
                "home.differentials.row1.bluezz",
                "Cada centavo auditável em tempo real."
              )}
            />
            <Row
              icon={<Lock className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row2.label", "Governança")}
              ongs={t(
                "home.differentials.row2.ongs",
                "Decisões centralizadas e pouco transparentes."
              )}
              bluezz={t(
                "home.differentials.row2.bluezz",
                "Votações comunitárias abertas e registradas."
              )}
            />
            <Row
              icon={<GitFork className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row3.label", "Código e processos")}
              ongs={t(
                "home.differentials.row3.ongs",
                "Ferramentas fechadas e sem auditoria pública."
              )}
              bluezz={t(
                "home.differentials.row3.bluezz",
                "Open-source no GitHub. Nada escondido."
              )}
            />
            <Row
              icon={<Gauge className="h-5 w-5 text-blue-600" />}
              label={t("home.differentials.row4.label", "Velocidade de resposta")}
              ongs={t(
                "home.differentials.row4.ongs",
                "Ciclos longos e pouca visibilidade."
              )}
              bluezz={t(
                "home.differentials.row4.bluezz",
                "Ciclos curtos, com resultados públicos."
              )}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
