import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Share, Megaphone, Heart } from "lucide-react";

export function HowToHelpPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('howToHelp.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howToHelp.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>{t('howToHelp.contribute.title')}</CardTitle>
              <CardDescription>
                {t('howToHelp.contribute.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                {t('howToHelp.contribute.features', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link to="/discover">{t('howToHelp.contribute.button')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Share className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>{t('howToHelp.share.title')}</CardTitle>
              <CardDescription>
                {t('howToHelp.share.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                {t('howToHelp.share.features', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                {t('howToHelp.share.button')}
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>{t('howToHelp.ambassador.title')}</CardTitle>
              <CardDescription>
                {t('howToHelp.ambassador.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                {t('howToHelp.ambassador.features', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                {t('howToHelp.ambassador.button')}
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>{t('howToHelp.volunteer.title')}</CardTitle>
              <CardDescription>
                {t('howToHelp.volunteer.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                {t('howToHelp.volunteer.features', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                {t('howToHelp.volunteer.button')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('howToHelp.cta.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('howToHelp.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/how-it-works">{t('howToHelp.cta.howItWorksButton')}</Link>
            </Button>
            <Button variant="outline">
              {t('howToHelp.cta.contactButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
