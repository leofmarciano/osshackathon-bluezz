import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white">
      <div className="absolute inset-0 -z-10 opacity-30">
        <video
          className="h-full w-full object-cover"
          src="/media/ocean.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Ocean background video"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-900/40 to-blue-900/80" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          <h1 className="max-w-5xl text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
            {t("home.hero.headline")}
          </h1>
          <p className="mt-6 max-w-3xl text-pretty text-lg text-blue-100 md:text-2xl">
            {t("home.hero.subheadline")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="group">
              <Link to="/discover" aria-label={t("home.hero.cta_primary")}>
                {t("home.hero.cta_primary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="bg-white/10 text-white hover:bg-white/20">
              <a href="#how-it-works" aria-label={t("home.hero.cta_secondary")}>
                <PlayCircle className="mr-2 h-5 w-5" />
                {t("home.hero.cta_secondary")}
              </a>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-blue-100/80">
            <span>Open Source</span>
            <span className="h-1 w-1 rounded-full bg-blue-200/50" />
            <span>{t("home.hero.badges.community_first", "Comunidade em primeiro lugar")}</span>
            <span className="h-1 w-1 rounded-full bg-blue-200/50" />
            <span>{t("home.hero.badges.radical_transparency", "Transparência radical")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
