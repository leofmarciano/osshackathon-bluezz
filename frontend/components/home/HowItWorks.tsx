import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Users, Vote, Cpu, Eye } from "lucide-react";

const stepIcons = [Zap, Users, Vote, Cpu, Eye];

function QuickStep({
  index,
  title,
  icon: Icon,
}: {
  index: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
      <div className="flex-shrink-0 mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 text-xs font-medium">
          {index}
        </Badge>
        <h3 className="font-semibold text-gray-900 text-sm leading-relaxed">
          {title}
        </h3>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("home.howItWorks.steps.1.title"),
      icon: stepIcons[0],
    },
    {
      title: t("home.howItWorks.steps.2.title"),
      icon: stepIcons[1],
    },
    {
      title: t("home.howItWorks.steps.3.title"),
      icon: stepIcons[2],
    },
    {
      title: t("home.howItWorks.steps.4.title"),
      icon: stepIcons[3],
    },
    {
      title: t("home.howItWorks.steps.5.title"),
      icon: stepIcons[4],
    },
  ];

  return (
    <section id="how-it-works" className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-white text-sm px-4 py-2">
              {t("home.howItWorks.title")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl mb-6">
              {t("home.howItWorks.subtitle")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Da detecção à execução, tudo acontece com transparência total e governança comunitária
            </p>
          </div>

          <div className="grid gap-6 mb-16 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <QuickStep
                key={index}
                index={index + 1}
                title={step.title}
                icon={step.icon}
              />
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Quer entender cada etapa em detalhes?
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Descubra como a tecnologia e a comunidade se unem para transformar a limpeza dos oceanos
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button size="lg" asChild className="group px-8 py-3 text-base">
                  <Link to="/how-it-works">
                    {t("home.howItWorks.link")}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
