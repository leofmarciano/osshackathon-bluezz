import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, LineChart } from "lucide-react";

const GITHUB_URL = "https://github.com/bluezz-xyz/bluezz";

function useAnimatedCounter(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const steps = 40;
  const increment = useMemo(() => target / steps, [target]);

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      setValue((prev) => {
        const next = prev + increment;
        if (frame >= steps) {
          clearInterval(id);
          return target;
        }
        return next;
      });
    }, durationMs / steps);
    return () => clearInterval(id);
  }, [increment, steps, durationMs, target]);

  return Math.round(value);
}

export default function Governance() {
  const { t, i18n } = useTranslation();
  const targetFunds = 25000;
  const current = useAnimatedCounter(targetFunds);

  const formatted = useMemo(() => {
    const locale = i18n.language?.startsWith("pt") ? "pt-BR" : "en-US";
    const currency = i18n.language?.startsWith("pt") ? "BRL" : "USD";
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(current);
  }, [current, i18n.language]);

  return (
    <section id="governance" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t("home.governance.title", "Governança e Open Source")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t("home.governance.copy", "Nada escondido. Tudo auditável.")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {t("home.governance.funds.title", "Fundos disponíveis")}
              </CardTitle>
              <LineChart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight text-gray-900">
                {formatted}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {t(
                  "home.governance.funds.caption",
                  "Valores de exemplo para demonstração. Em breve: dados em tempo real."
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base">
                {t("home.governance.repo.title", "Acompanhe no GitHub")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t(
                  "home.governance.repo.desc",
                  "Código, issues, votações e auditorias abertas para qualquer pessoa verificar."
                )}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    {t("home.governance.repo.cta", "Ver repositório")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
