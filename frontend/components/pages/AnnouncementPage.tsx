import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import backend from "~backend/client";
import { useBackend } from "../../lib/useBackend";
import type { Announcement } from "~backend/announcements/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Bookmark, Share2, Twitter, Facebook, Linkedin, Clock, Users, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Heading {
  id: string;
  text: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractH1Headings(md: string): Heading[] {
  const lines = md.split(/\r?\n/);
  const headings: Heading[] = [];
  for (const line of lines) {
    const m = /^#\s+(.*)$/.exec(line);
    if (m) {
      const text = m[1].trim();
      headings.push({ id: slugify(text), text });
    }
  }
  return headings;
}

function useCurrency(i18nLang: string) {
  const locale = i18nLang?.startsWith("pt") ? "pt-BR" : "en-US";
  const currency = i18nLang?.startsWith("pt") ? "BRL" : "USD";
  const fmt = new Intl.NumberFormat(locale, { style: "currency", currency });
  return fmt;
}

export function AnnouncementPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const authedBackend = useBackend();

  const [ann, setAnn] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminded, setReminded] = useState(false);
  const [backOpen, setBackOpen] = useState(false);
  const [amount, setAmount] = useState("50"); // default amount (currency units)
  const currencyFmt = useCurrency(i18n.language || "pt-BR");

  const headings = useMemo(() => extractH1Headings(ann?.contentMd ?? ""), [ann?.contentMd]);

  const pledgedAmountCurrency = useMemo(() => currencyFmt.format((ann?.pledgedAmount ?? 0) / 100), [ann?.pledgedAmount, currencyFmt]);
  const goalAmountCurrency = useMemo(() => currencyFmt.format((ann?.goalAmount ?? 0) / 100), [ann?.goalAmount, currencyFmt]);

  const progressPct = useMemo(() => {
    if (!ann) return 0;
    if (ann.goalAmount === 0) return 0;
    return Math.min(100, Math.round((ann.pledgedAmount / ann.goalAmount) * 100));
  }, [ann]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const res = await backend.announcements.getBySlug({ slug });
        if (mounted) {
          setAnn(res.announcement);
        }
      } catch (err) {
        console.error(err);
        toast({
          variant: "destructive",
          title: t("announcement.errors.loadTitle", "Erro ao carregar anúncio"),
          description: t("announcement.errors.loadDesc", "Tente novamente mais tarde."),
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [slug, toast, t]);

  function onShare(target: "twitter" | "facebook" | "linkedin") {
    const url = window.location.href;
    const text = encodeURIComponent(ann?.title || "Bluezz");
    const shareUrl =
      target === "twitter"
        ? `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`
        : target === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        : `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${text}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  async function onRemind() {
    try {
      await authedBackend.announcements.remind({ slug });
      setReminded(true);
      toast({ title: t("announcement.remind.ok", "Você será lembrado sobre este projeto!") });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: t("announcement.remind.errTitle", "Falha ao definir lembrete"),
        description: t("announcement.remind.errDesc", "Entre na sua conta e tente novamente."),
      });
    }
  }

  async function onBack() {
    const cents = Math.round(Number(amount.replace(",", ".")) * 100);
    if (!cents || cents <= 0) {
      toast({ variant: "destructive", title: t("announcement.back.invalid", "Informe um valor válido") });
      return;
    }
    try {
      const res = await authedBackend.announcements.back({ slug, amount: cents });
      setAnn((prev) =>
        prev
          ? {
              ...prev,
              pledgedAmount: res.pledgedAmount,
              backersCount: res.backersCount,
            }
          : prev
      );
      setBackOpen(false);
      toast({ title: t("announcement.back.ok", "Obrigado por apoiar!") });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: t("announcement.back.errTitle", "Falha ao apoiar"),
        description: t("announcement.back.errDesc", "Entre na sua conta e tente novamente."),
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("common.loading", "Carregando...")}</div>
      </div>
    );
  }

  if (!ann) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("announcement.notfound.title", "Anúncio não encontrado")}</h1>
          <p className="text-muted-foreground">{t("announcement.notfound.desc", "Verifique o link e tente novamente.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header / Hero */}
      <section className="relative bg-white">
        {ann.coverImageUrl ? (
          <div className="h-72 w-full overflow-hidden">
            <img src={ann.coverImageUrl} alt={ann.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-blue-600 to-cyan-600" />
        )}

        <div className="container mx-auto px-4 -mt-12">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary">{ann.organization.name}</Badge>
                    {ann.publishedAt && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(ann.publishedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">{ann.title}</h1>
                  {ann.excerpt && <p className="mt-2 text-muted-foreground">{ann.excerpt}</p>}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Dialog open={backOpen} onOpenChange={setBackOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="min-w-[220px]">{t("announcement.actions.back", "Back this project")}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("announcement.back.title", "Apoiar este projeto")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <label className="text-sm text-muted-foreground">
                          {t("announcement.back.amount", "Valor da contribuição")}
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-40"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={onBack}>{t("announcement.actions.confirmBack", "Confirmar apoio")}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant={reminded ? "secondary" : "outline"} onClick={onRemind} className="min-w-[160px]">
                    <Bookmark className="w-4 h-4 mr-2" />
                    {reminded ? t("announcement.remind.set", "Lembrete definido") : t("announcement.actions.remind", "Remind me")}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => onShare("twitter")} aria-label="Share on Twitter">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onShare("facebook")} aria-label="Share on Facebook">
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onShare("linkedin")} aria-label="Share on LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigator.share?.({ title: ann.title, url: window.location.href })} aria-label="Share">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">{t("announcement.metrics.backers", "Backers")}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div className="text-2xl font-bold">{ann.backersCount}</div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">{t("announcement.metrics.pledgedOf", "Pledged of total")}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <div className="text-2xl font-bold">
                      {pledgedAmountCurrency} <span className="text-muted-foreground text-base">/ {goalAmountCurrency}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">{t("announcement.metrics.progress", "Progress")}</div>
                  <div className="mt-2">
                    <Progress value={progressPct} />
                    <div className="mt-1 text-sm text-muted-foreground">{progressPct}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Body Layout */}
      <section className="py-10">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left TOC */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="text-sm font-semibold mb-3">{t("announcement.toc", "Tópicos")}</div>
              <nav className="space-y-2">
                {headings.length === 0 && (
                  <div className="text-sm text-muted-foreground">{t("announcement.tocEmpty", "Sem tópicos")}</div>
                )}
                {headings.map((h) => (
                  <a key={h.id} href={`#${h.id}`} className="block text-sm text-muted-foreground hover:text-foreground">
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Center Content */}
          <main className="lg:col-span-7">
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children }) => {
                    const text = String(children);
                    const id = slugify(text);
                    return <h1 id={id}><span>{children}</span></h1>;
                  },
                  img: ({ src, alt }) => (
                    <img src={src || ""} alt={alt || ""} className="rounded-lg border" />
                  ),
                }}
              >
                {ann.contentMd}
              </ReactMarkdown>
            </article>
          </main>

          {/* Right Support / Organization */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("announcement.support.title", "Apoie este projeto")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("announcement.metrics.pledged", "Arrecadado")}</span>
                    <span className="font-semibold">{pledgedAmountCurrency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("announcement.metrics.goal", "Meta")}</span>
                    <span className="font-semibold">{goalAmountCurrency}</span>
                  </div>
                  <Progress value={progressPct} />
                  <div className="text-sm text-muted-foreground">{progressPct}% {t("announcement.metrics.achieved", "alcançado")}</div>
                  <Button className="w-full" onClick={() => setBackOpen(true)}>{t("announcement.actions.back", "Back this project")}</Button>
                  <Button variant="outline" className="w-full" onClick={onRemind}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {reminded ? t("announcement.remind.set", "Lembrete definido") : t("announcement.actions.remind", "Remind me")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("announcement.org.title", "Sobre a organização")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    {ann.organization.logoUrl && (
                      <img src={ann.organization.logoUrl} alt={ann.organization.name} className="h-10 w-10 rounded-full border object-cover" />
                    )}
                    <div className="font-semibold">{ann.organization.name}</div>
                  </div>
                  {ann.organization.summary && (
                    <p className="text-sm text-muted-foreground">{ann.organization.summary}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
