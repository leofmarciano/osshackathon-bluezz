import { useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Heart, 
  TrendingUp, 
  Calendar, 
  Download, 
  Bell,
  Settings,
  CreditCard,
  FileText,
  Award
} from "lucide-react";

export function AccountPage() {
  const { user } = useUser();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('account.unauthorizedTitle')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('account.unauthorizedSubtitle')}
          </p>
          <Button>{t('account.loginButton')}</Button>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const contributions = [
    {
      id: 1,
      project: "Limpeza da Mancha de Óleo - Nordeste",
      amount: 150,
      date: "2024-01-15",
      status: "completed",
      progress: 85
    },
    {
      id: 2,
      project: "Coleta de Plástico no Oceano Atlântico",
      amount: 75,
      date: "2024-01-10",
      status: "active",
      progress: 72
    },
    {
      id: 3,
      project: "Barreira Anti-Poluição Marinha",
      amount: 100,
      date: "2024-01-05",
      status: "active",
      progress: 43
    }
  ];

  const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
  const activeProjects = contributions.filter(c => c.status === "active").length;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
              <AvatarFallback className="text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.fullName || t('common.user')}
              </h1>
              <p className="text-gray-600 mb-4">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{t('common.currency')} {totalContributed}</div>
                  <div className="text-sm text-gray-500">{t('account.stats.totalContributed')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{contributions.length}</div>
                  <div className="text-sm text-gray-500">{t('account.stats.projectsSupported')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{activeProjects}</div>
                  <div className="text-sm text-gray-500">{t('account.stats.activeProjects')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-gray-500">{t('account.stats.certificates')}</div>
                </div>
              </div>
            </div>
            
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              {t('account.editProfileButton')}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="contributions" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contributions">{t('account.tabs.contributions')}</TabsTrigger>
            <TabsTrigger value="certificates">{t('account.tabs.certificates')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('account.tabs.notifications')}</TabsTrigger>
            <TabsTrigger value="settings">{t('account.tabs.settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="contributions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  {t('account.contributions.title')}
                </CardTitle>
                <CardDescription>
                  {t('account.contributions.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contributions.map((contribution) => (
                    <div key={contribution.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {contribution.project}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t('account.contributions.contribution')}: {t('common.currency')} {contribution.amount} • {contribution.date}
                          </p>
                        </div>
                        <Badge variant={contribution.status === "completed" ? "secondary" : "default"}>
                          {contribution.status === "completed" ? t('account.contributions.completed') : t('account.contributions.active')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('account.contributions.projectProgress')}</span>
                          <span className="font-medium">{contribution.progress}%</span>
                        </div>
                        <Progress value={contribution.progress} className="h-2" />
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          {t('account.contributions.viewReportButton')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          {t('account.contributions.downloadReceiptButton')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  {t('account.certificates.title')}
                </CardTitle>
                <CardDescription>
                  {t('account.certificates.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{t('account.certificates.oceanDefender.title')}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('account.certificates.oceanDefender.description')}
                    </p>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t('account.certificates.downloadButton')}
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <Award className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{t('account.certificates.premiumContributor.title')}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('account.certificates.premiumContributor.description')}
                    </p>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t('account.certificates.downloadButton')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-500" />
                  {t('account.notifications.title')}
                </CardTitle>
                <CardDescription>
                  {t('account.notifications.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('account.notifications.projectUpdates.title')}</h3>
                      <p className="text-sm text-gray-500">
                        {t('account.notifications.projectUpdates.description')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">{t('account.notifications.enabled')}</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('account.notifications.newProjects.title')}</h3>
                      <p className="text-sm text-gray-500">
                        {t('account.notifications.newProjects.description')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">{t('account.notifications.enabled')}</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('account.notifications.monthlyReports.title')}</h3>
                      <p className="text-sm text-gray-500">
                        {t('account.notifications.monthlyReports.description')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">{t('account.notifications.disabled')}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-500" />
                  {t('account.settings.title')}
                </CardTitle>
                <CardDescription>
                  {t('account.settings.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <Button variant="outline" className="justify-start">
                    <User className="w-4 h-4 mr-2" />
                    {t('account.settings.editPersonalInfo')}
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('account.settings.paymentMethods')}
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    {t('account.settings.emailPreferences')}
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    {t('account.settings.downloadData')}
                  </Button>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="font-medium text-red-600 mb-4">{t('account.settings.dangerZone')}</h3>
                  <Button variant="destructive" className="w-full">
                    {t('account.settings.deleteAccount')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
