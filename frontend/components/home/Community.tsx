import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

function Testimonial({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <p className="text-gray-800">&ldquo;{quote}&rdquo;</p>
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium text-gray-900">{author}</span> &middot; {role}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const { t } = useTranslation();

  return (
    <section id="community" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t("home.community.title", "Comunidade e participação")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t(
              "home.community.subtitle",
              "Junte-se ao movimento. Participe das discussões, proponha ideias e vote."
            )}
          </p>
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <a href="https://discord.gg/" target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              {t("home.community.discord", "Entrar no Discord")}
            </a>
          </Button>
          <Button asChild>
            <a href="https://t.me/" target="_blank" rel="noreferrer">
              <Send className="mr-2 h-5 w-5" />
              {t("home.community.telegram", "Entrar no Telegram")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
