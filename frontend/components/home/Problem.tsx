import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Droplets, Skull } from "lucide-react";

function StatItem({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-white">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <Icon className="h-5 w-5 text-red-600" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Problem() {
  const { t } = useTranslation();

  return (
    <section id="problem" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t("home.problem.title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t("home.problem.subtitle", "A crise é real e está piorando. Precisamos agir agora.")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <StatItem
            Icon={AlertTriangle}
            title={t("home.problem.stat1.title", "12 milhões de toneladas/ano")}
            description={t(
              "home.problem.stat1.desc",
              "de plástico vão parar no oceano todos os anos."
            )}
          />
          <StatItem
            Icon={Droplets}
            title={t("home.problem.stat2.title", "80% da poluição marinha")}
            description={t(
              "home.problem.stat2.desc",
              "vem de resíduos terrestres sem tratamento."
            )}
          />
          <StatItem
            Icon={Skull}
            title={t("home.problem.stat3.title", "Milhares de espécies em risco")}
            description={t(
              "home.problem.stat3.desc",
              "Os ecossistemas marinhos estão à beira do colapso."
            )}
          />
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border bg-gray-50">
          <img
            src="/images/ocean-plastic.png"
            alt={t("home.problem.image_alt", "Infográfico simples mostrando a poluição oceânica")}
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
