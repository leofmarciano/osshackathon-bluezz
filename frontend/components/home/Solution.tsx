import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Users, Github } from "lucide-react";

function Pillar({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Solution() {
  const { t } = useTranslation();

  return (
    <section id="solution" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t("home.solution.title", "Nossa solução")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t(
              "home.solution.subtitle",
              "Tecnologia, comunidade e transparência para transformar indignação em ação."
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Pillar
            Icon={Cpu}
            title={t("home.solution.tech.title", "Tecnologia")}
            description={t(
              "home.solution.tech.desc",
              "IA detecta áreas de risco e oportunidades de limpeza no oceano."
            )}
          />
          <Pillar
            Icon={Users}
            title={t("home.solution.governance.title", "Governança comunitária")}
            description={t(
              "home.solution.governance.desc",
              "A comunidade decide quem executa as ações e como os recursos são alocados."
            )}
          />
          <Pillar
            Icon={Github}
            title={t("home.solution.transparency.title", "Transparência radical")}
            description={t(
              "home.solution.transparency.desc",
              "Cada centavo auditável em tempo real com código aberto."
            )}
          />
        </div>
      </div>
    </section>
  );
}
