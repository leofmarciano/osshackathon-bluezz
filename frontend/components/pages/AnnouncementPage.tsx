import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Bell, 
  Share2, 
  Facebook, 
  Twitter, 
  MapPin, 
  Building,
  Loader2
} from "lucide-react";
import backend from "~backend/client";
import { useBackend } from "../../lib/useBackend";
import { useToast } from "@/components/ui/use-toast";
import type { AnnouncementDetail } from "~backend/announcements/types";

export function AnnouncementPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const authBackend = useBackend();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [backing, setBacking] = useState(false);
  const [reminding, setReminding] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchAnnouncement();
    }
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await backend.announcements.getBySlug({ slug: slug! });
      setAnnouncement(response);
    } catch (error) {
      console.error("Failed to fetch announcement:", error);
      toast({
        title: t("common.error"),
        description: t("announcement.fetchError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (!announcement) return;
    
    try {
      setBacking(true);
      await authBackend.announcements.back({
        announcementId: announcement.id,
        amount: 5000, // Default amount in cents (R$ 50.00)
      });
      
      toast({
        title: t("common.success"),
        description: t("announcement.backSuccessDesc"),
      });
      
      await fetchAnnouncement();
    } catch (error) {
      console.error("Failed to back announcement:", error);
      toast({
        title: t("common.error"),
        description: t("announcement.backErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setBacking(false);
    }
  };

  const handleRemind = async () => {
    if (!announcement) return;
    
    try {
      setReminding(true);
      await authBackend.announcements.remind({
        announcementId: announcement.id,
      });
      
      toast({
        title: t("common.success"),
        description: t("announcement.remindSuccessDesc"),
      });
    } catch (error) {
      console.error("Failed to set reminder:", error);
      toast({
        title: t("common.error"),
        description: t("announcement.remindErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setReminding(false);
    }
  };

  const getDaysLeft = (campaignEndDate: Date) => {
    const now = new Date();
    const end = new Date(campaignEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      oil: { label: t("discover.categories.oil"), variant: "destructive" as const },
      plastic: { label: t("discover.categories.plastic"), variant: "secondary" as const },
      prevention: { label: t("discover.categories.prevention"), variant: "default" as const },
      restoration: { label: t("discover.categories.restoration"), variant: "outline" as const }
    };
    return badges[category as keyof typeof badges] || { label: t("discover.categories.all"), variant: "outline" as const };
  };

  const extractHeadings = (content: string) => {
    const headingRegex = /^#\s+(.+)$/gm;
    const headings: { id: string; text: string }[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[1];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ id, text });
    }
    
    return headings;
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown parser for demonstration
    return content
      .replace(/^# (.+)$/gm, '<h1 id="$1" class="text-3xl font-bold mb-4 mt-8">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mb-2 mt-4">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t("announcement.loading")}</span>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("announcement.notFoundTitle")}</h1>
          <p className="text-gray-600">{t("announcement.notFoundSubtitle")}</p>
        </div>
      </div>
    );
  }

  const progress = (announcement.raisedAmount / announcement.goalAmount) * 100;
  const categoryBadge = getCategoryBadge(announcement.category);
  const daysLeft = getDaysLeft(announcement.campaignEndDate);
  const headings = extractHeadings(announcement.content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
                {announcement.imageUrl && (
                  <img 
                    src={announcement.imageUrl} 
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="mb-4">
                <Badge variant={categoryBadge.variant}>
                  {categoryBadge.label}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {announcement.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {announcement.description}
              </p>
              
              <div className="flex items-center text-gray-500 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                {announcement.location}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {t("common.currency")} {announcement.raisedAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("announcement.pledgedOfGoal", {
                          currency: t("common.currency"),
                          goal: announcement.goalAmount.toLocaleString()
                        })}
                      </div>
                    </div>
                    
                    <Progress value={progress} className="h-3" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{announcement.backersCount}</div>
                        <div className="text-sm text-gray-500">{t("announcement.backers")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{daysLeft}</div>
                        <div className="text-sm text-gray-500">{t("announcement.daysToGo")}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={handleBack}
                  disabled={backing}
                >
                  {backing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 mr-2" />
                  )}
                  {t("announcement.backButton")}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={handleRemind}
                  disabled={reminding}
                >
                  {reminding ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Bell className="w-5 h-5 mr-2" />
                  )}
                  {t("announcement.remindButton")}
                </Button>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Facebook className="w-4 h-4 mr-2" />
                  {t("announcement.shareFacebook")}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Twitter className="w-4 h-4 mr-2" />
                  {t("announcement.shareTwitter")}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  {t("announcement.shareGeneric")}
                </Button>
              </div>

              {/* Organization Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    {t("announcement.aboutOrg")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {announcement.organizationName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{announcement.organizationName}</h3>
                      {announcement.organizationDescription && (
                        <p className="text-sm text-gray-600 mt-1">
                          {announcement.organizationDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("announcement.contents")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a 
                            href={`#${heading.id}`}
                            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className={headings.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card>
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(announcement.content) }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
