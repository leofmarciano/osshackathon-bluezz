import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Handshake, Vote, Cpu, GitFork } from "lucide-react";

export function HowItWorksPage() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Bot,
      title: t('howItWorks.steps.1.title'),
      description: t('howItWorks.steps.1.description'),
    },
    {
      icon: Handshake,
      title: t('howItWorks.steps.2.title'),
      description: t('howItWorks.steps.2.description'),
    },
    {
      icon: Vote,
      title: t('howItWorks.steps.3.title'),
      description: t('howItWorks.steps.3.description'),
    },
    {
      icon: Cpu,
      title: t('howItWorks.steps.4.title'),
      description: t('howItWorks.steps.4.description'),
    },
    {
      icon: GitFork,
      title: t('howItWorks.steps.5.title'),
      description: t('howItWorks.steps.5.description'),
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Headline Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('howItWorks.headline')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.subheadline')}
          </p>
        </div>

        {/* Steps Section - Timeline */}
        <div className="relative">
          {/* The connecting line for desktop */}
          <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-blue-200 hidden md:block" aria-hidden="true" />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="md:flex items-center md:justify-center md:gap-8 relative">
                  {/* Card */}
                  <div className={`md:w-5/12 ${isEven ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pl-8 md:order-2'}`}>
                    <Card className="text-left shadow-md hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-800">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Icon and timeline dot */}
                  <div className={`flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center z-10 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 ${isEven ? 'md:order-1' : ''}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Spacer for desktop layout */}
                  <div className={`hidden md:block md:w-5/12 ${isEven ? 'md:order-2' : ''}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-blue-600 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('howItWorks.cta.title')}
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('howItWorks.cta.subtitle')}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/sign-up">{t('howItWorks.cta.button')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
