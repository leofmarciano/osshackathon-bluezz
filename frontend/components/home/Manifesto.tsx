import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const GITHUB_URL = "https://github.com/bluezz-xyz/bluezz";

export default function Manifesto() {
  const { t } = useTranslation();

  return (
    <section id="manifesto" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t("home.manifesto.title", "Manifesto da comunidade")}
          </h2>
          <p className="mt-6 text-pretty text-lg text-gray-700">
            {t(
              "home.manifesto.excerpt",
              "Cansamos de doar no escuro. A Bluezz nasceu para que a comunidade seja a dona das decisões."
            )}
          </p>

          <div className="mt-8">
            <Button asChild size="lg" variant="outline">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t("home.manifesto.cta", "Ler manifesto no GitHub")}
              >
                <Github className="mr-2 h-5 w-5" />
                {t("home.manifesto.cta", "Ler manifesto no GitHub")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
