import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users, Heart, Globe, Star, Quote, Twitter, Instagram, Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function Testimonial({
  quote,
  author,
  role,
  location,
  delay,
}: {
  quote: string;
  author: string;
  role: string;
  location: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card className={`group relative overflow-hidden border-2 border-blue-100 bg-white transition-all duration-700 hover:border-blue-300 hover:shadow-xl ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
    }`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/30 blur-2xl" />
      <Quote className="absolute right-4 top-4 h-8 w-8 text-blue-200" />
      <CardContent className="relative p-6">
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-lg leading-relaxed text-gray-700">&ldquo;{quote}&rdquo;</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{author}</p>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            <Globe className="mr-1 h-3 w-3" />
            {location}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function CommunityMetric({ value, label, icon: Icon }: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 text-center">
      <Icon className="mb-3 h-8 w-8 text-blue-600" />
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  );
}

export default function Community() {
  const { t } = useTranslation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      quote: t("home.community.testimonial1.quote", "Finalmente uma plataforma onde posso ver exatamente para onde vai minha doação. A transparência do Bluezz é revolucionária!"),
      author: "Marina Silva",
      role: t("home.community.testimonial1.role", "Bióloga Marinha"),
      location: "Brasil",
    },
    {
      quote: t("home.community.testimonial2.quote", "Participar das votações e ver minha voz sendo ouvida nas decisões é incrível. É assim que deveria funcionar!"),
      author: "Carlos Mendes",
      role: t("home.community.testimonial2.role", "Ativista Ambiental"),
      location: "Portugal",
    },
    {
      quote: t("home.community.testimonial3.quote", "O código aberto me deu confiança total. Posso auditar tudo, desde o código até as transações. Isso é o futuro!"),
      author: "Ana Rodríguez",
      role: t("home.community.testimonial3.role", "Desenvolvedora"),
      location: "Espanha",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="community" className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute bottom-1/3 right-0 h-96 w-96 rounded-full bg-cyan-100/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-green-500 px-4 py-2 text-sm font-semibold text-white">
            <Users className="mr-2 h-4 w-4" />
            {t("home.community.badge", "COMUNIDADE GLOBAL")}
          </Badge>

          <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {t("home.community.title", "Somos Milhares Unidos pelos Oceanos")}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-700">
            {t(
              "home.community.subtitle",
              "Uma comunidade global de pessoas que não aceitam mais promessas vazias. Juntos, transformamos indignação em ação concreta."
            )}
          </p>
        </div>

        {/* Community Metrics */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CommunityMetric
            value="50K+"
            label={t("home.community.metric1", "Membros Ativos")}
            icon={Users}
          />
          <CommunityMetric
            value="120+"
            label={t("home.community.metric2", "Países Representados")}
            icon={Globe}
          />
          <CommunityMetric
            value="500+"
            label={t("home.community.metric3", "Missões Propostas")}
            icon={Heart}
          />
          <CommunityMetric
            value="24/7"
            label={t("home.community.metric4", "Suporte Comunitário")}
            icon={MessageCircle}
          />
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <h3 className="mb-12 text-center text-2xl font-bold text-gray-900">
            {t("home.community.testimonials_title", "O Que Nossa Comunidade Diz")}
          </h3>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <Testimonial
                key={i}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                location={testimonial.location}
                delay={i * 150}
              />
            ))}
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-20 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 p-8 shadow-2xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-3xl font-bold text-white md:text-4xl">
                {t("home.community.join.title", "Faça Parte da Mudança")}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-blue-100">
                {t("home.community.join.text", "Entre para nossa comunidade e participe ativamente das decisões. Sua voz importa, seu voto conta, sua ação transforma.")}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" className="font-bold" asChild>
                  <a href="https://discord.gg/bluezz" target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("home.community.discord", "Discord")}
                  </a>
                </Button>
                <Button size="lg" variant="secondary" className="font-bold" asChild>
                  <a href="https://t.me/bluezz" target="_blank" rel="noreferrer">
                    <Send className="mr-2 h-5 w-5" />
                    {t("home.community.telegram", "Telegram")}
                  </a>
                </Button>
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/20" asChild>
                  <a href="https://github.com/bluezz-xyz/bluezz" target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    {t("home.community.github", "GitHub")}
                  </a>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <Twitter className="mx-auto mb-2 h-6 w-6 text-white" />
                <div className="text-2xl font-bold text-white">25K</div>
                <p className="text-sm text-blue-200">Followers</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <Instagram className="mx-auto mb-2 h-6 w-6 text-white" />
                <div className="text-2xl font-bold text-white">40K</div>
                <p className="text-sm text-blue-200">Followers</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <MessageCircle className="mx-auto mb-2 h-6 w-6 text-white" />
                <div className="text-2xl font-bold text-white">10K</div>
                <p className="text-sm text-blue-200">Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-gray-700">
            {t("home.community.final_cta", "O mal já é global. A solução precisa ser coletiva.")}
          </p>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {t("home.community.hashtag", "#JuntosPelosOceanos #BluezzRevolution")}
          </p>
        </div>
      </div>
    </section>
  );
}
