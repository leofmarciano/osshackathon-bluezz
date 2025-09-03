import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Fish, Users, Heart, Activity, Globe } from "lucide-react";
import { useEffect, useState } from "react";

function StatItem({
  Icon,
  title,
  number,
  description,
  color = "red",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  number?: string;
  description: string;
  color?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const colorClasses = {
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <Card className={`relative overflow-hidden border-2 bg-white transition-all duration-500 hover:shadow-xl ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    } ${colorClasses[color].split(" ")[2]}`}>
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${colorClasses[color].split(" ")[0]} opacity-20 blur-2xl`} />
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses[color].split(" ")[0]}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].split(" ")[1]}`} />
          </div>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {number && (
          <div className="mb-2 text-3xl font-black text-gray-900">
            {number}
          </div>
        )}
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Problem() {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev < 500) return prev + 10;
        return 500;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="problem" className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-red-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-100/30 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {t("home.problem.badge", "CRISE GLOBAL")}
          </div>
          
          <h2 className="mt-6 text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {t("home.problem.title", "O Problema que Já Impacta 100% da Vida na Terra")}
          </h2>
          
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            {t("home.problem.subtitle", "Plástico, lixo e óleo já chegaram a todos os lugares: no mar, no ar, na chuva, no nosso sangue e até na placenta humana.")}
          </p>

          {/* Big Impact Number */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white shadow-2xl">
            <div className="text-6xl font-black md:text-8xl">
              {counter}+ {t("home.problem.millions", "MILHÕES")}
            </div>
            <p className="mt-4 text-xl">
              {t("home.problem.animals_dead", "de animais visíveis morrem todo ano por plástico e óleo")}
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatItem
            Icon={Fish}
            title={t("home.problem.stat1.title", "Animais Marinhos")}
            number={t("home.problem.stat1.number", "500+ milhões/ano")}
            description={t(
              "home.problem.stat1.desc",
              "Tartarugas, aves, mamíferos marinhos e peixes morrem vítimas de plástico e óleo anualmente."
            )}
            color="red"
          />
          <StatItem
            Icon={Users}
            title={t("home.problem.stat2.title", "Seres Humanos")}
            number={t("home.problem.stat2.number", "8 bilhões")}
            description={t(
              "home.problem.stat2.desc",
              "Todas as pessoas do planeta já carregam microplásticos no corpo, inclusive no sangue."
            )}
            color="orange"
          />
          <StatItem
            Icon={Activity}
            title={t("home.problem.stat3.title", "Microrganismos")}
            number={t("home.problem.stat3.number", "Trilhões")}
            description={t(
              "home.problem.stat3.desc",
              "Microrganismos essenciais para o equilíbrio marinho estão sendo contaminados e extintos."
            )}
            color="purple"
          />
          <StatItem
            Icon={Globe}
            title={t("home.problem.stat4.title", "Plástico nos Oceanos")}
            number={t("home.problem.stat4.number", "12 milhões ton/ano")}
            description={t(
              "home.problem.stat4.desc",
              "Quantidade de plástico despejada nos oceanos anualmente, equivalente a um caminhão por minuto."
            )}
            color="red"
          />
          <StatItem
            Icon={AlertTriangle}
            title={t("home.problem.stat5.title", "Poluição Terrestre")}
            number={t("home.problem.stat5.number", "80%")}
            description={t(
              "home.problem.stat5.desc",
              "Da poluição marinha vem de resíduos terrestres sem tratamento adequado."
            )}
            color="orange"
          />
          <StatItem
            Icon={Heart}
            title={t("home.problem.stat6.title", "Cadeia Alimentar")}
            number={t("home.problem.stat6.number", "100%")}
            description={t(
              "home.problem.stat6.desc",
              "Toda a cadeia alimentar está contaminada, do plâncton aos grandes predadores."
            )}
            color="purple"
          />
        </div>

        <div className="mt-16 rounded-2xl bg-gray-900 p-8 text-white md:p-12">
          <h3 className="text-2xl font-bold md:text-3xl">
            {t("home.problem.urgent_title", "Não há mais tempo a perder")}
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-gray-300">
            {t("home.problem.urgent_text", "Cada dia que passa, mais vidas são perdidas. Os oceanos são responsáveis por 70% do oxigênio que respiramos. Sem oceanos saudáveis, não há vida na Terra.")}
          </p>
        </div>
      </div>
    </section>
  );
}
