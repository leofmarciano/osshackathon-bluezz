import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";

export default function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section id="join" className="relative overflow-hidden bg-blue-600 py-20 text-white">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,224L48,192C96,160,192,96,288,69.3C384,43,480,53,576,96C672,139,768,213,864,245.3C960,277,1056,267,1152,250.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            opacity="0.3"
          />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <Waves className="mx-auto h-10 w-10 opacity-90" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {t("home.cta.title", "Faça parte da primeira onda")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-blue-100">
          {t(
            "home.cta.subtitle",
            "Ajude a decidir quem limpa nosso oceano hoje."
          )}
        </p>
        <div className="mt-8">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/sign-up">{t("home.cta.button", "Registre-se agora")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
