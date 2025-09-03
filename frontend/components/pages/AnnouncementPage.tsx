import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Bell, 
  Share2, 
  Facebook, 
  Twitter, 
  MapPin, 
  Building,
  Loader2,
  MessageCircle
} from "lucide-react";
import { Streamdown } from "streamdown";
import backend from "~backend/client";
import { useBackend, useIsSignedIn } from "../../lib/useBackend";
import { useToast } from "@/components/ui/use-toast";
import { DonationModal } from "../DonationModal";
import { DonationsList } from "../DonationsList";
import { ThankYouModal } from "../ThankYouModal";
import type { AnnouncementDetail } from "~backend/announcements/types";

export function AnnouncementPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const authBackend = useBackend();
  const isSignedIn = useIsSignedIn();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const processingCheckoutRef = useRef(false);

  useEffect(() => {
    if (slug) {
      fetchAnnouncement();
    }
  }, [slug, i18n.language]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isSuccess = searchParams.get("donation_success") === "true";
    const checkoutId = searchParams.get("checkout_id");

    if (!isSuccess || processingCheckoutRef.current) return;

    processingCheckoutRef.current = true;

    (async () => {
      try {
        // Try to confirm/process the donation server-side (reuses existing backend payments flow).
        if (checkoutId) {
          const client = isSignedIn ? authBackend : backend;
          // Cast to any to avoid tight coupling to the exact request shape.
          await (client as any).payments.processDonation({ checkoutId });
        }
      } catch (error) {
        console.error("Failed to process donation after checkout:", error);
        // Even if this step fails, the webhook should reconcile it.
      } finally {
        // Refresh the announcement to reflect updated totals/backers.
        await fetchAnnouncement();

        // Show success message to the user.
        triggerConfetti();
        
        // Show thank you modal
        setShowThankYouModal(true);

        // Clean up the URL
        navigate(`/announcement/${slug}`, { replace: true });
      }
    })();
  }, [location.search, isSignedIn, authBackend, slug, t, toast, navigate]);

  function triggerConfetti() {
    const colors = ["#34D399", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA"]; // tailwind-esque
    const pieces = 120;
    const duration = 2500;
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100%";
    container.style.height = "0"; // don't block clicks
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const now = Date.now();
    for (let i = 0; i < pieces; i++) {
      const el = document.createElement("div");
      const size = Math.random() * 8 + 6;
      el.style.position = "fixed";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = "-10px";
      el.style.width = size + "px";
      el.style.height = size * 0.6 + "px";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.opacity = "0.9";
      el.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
      el.style.transition = `transform ${1.5 + Math.random() * 1.5}s ease-out, opacity 300ms linear`;
      el.style.willChange = "transform, opacity";
      container.appendChild(el);
      // kick off animation in next frame
      requestAnimationFrame(() => {
        const xJitter = (Math.random() * 100 - 50) + "px";
        el.style.transform = `translateY(100vh) translateX(${xJitter}) rotate(${720 + Math.random() * 720}deg)`;
        setTimeout(() => (el.style.opacity = "0"), duration - 300);
        const done = () => el.remove();
        el.addEventListener("transitionend", done, { once: true });
        setTimeout(done, duration + 500);
      });
    }
    setTimeout(() => container.remove(), duration + 800);
  }

  const fetchAnnouncement = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const response = await backend.announcements.getBySlug(slug!, { 
        language: i18n.language 
      });
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

  const handleRemind = async () => {
    if (!announcement) return;
    
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    
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

  const handleShare = (platform: 'facebook' | 'twitter' | 'generic') => {
    if (!announcement) return;
    
    const url = window.location.href;
    const text = `${announcement.title} - ${announcement.description}`;
    
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'generic':
        if (navigator.share) {
          navigator.share({
            title: announcement.title,
            text: announcement.description,
            url: url,
          }).catch(console.error);
        } else {
          navigator.clipboard.writeText(url).then(() => {
            toast({
              title: t("common.success"),
              description: t("announcement.linkCopied"),
            });
          }).catch(() => {
            toast({
              title: t("common.error"),
              description: t("announcement.linkCopyError"),
              variant: "destructive",
            });
          });
        }
        break;
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
    return badges[category as keyof typeof badges] || { label: t("discover.categories.other"), variant: "outline" as const };
  };

  const extractHeadings = (content: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: { id: string; text: string; level: number }[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ id, text, level });
    }
    
    return headings;
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
                <DonationModal 
                  announcementId={announcement.id} 
                  announcementTitle={announcement.title}
                >
                  <Button size="lg" className="w-full text-lg">
                    <Heart className="w-5 h-5 mr-2" />
                    {t("announcement.backButton")}
                  </Button>
                </DonationModal>
                
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  {t("announcement.shareFacebook")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  {t("announcement.shareTwitter")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleShare('generic')}
                >
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
                            className={`block text-sm hover:text-blue-600 transition-colors ${
                              heading.level === 1 ? 'font-semibold text-gray-900' :
                              heading.level === 2 ? 'font-medium text-gray-800 ml-2' :
                              'text-gray-600 ml-4'
                            }`}
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
            <Tabs defaultValue="description" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">{t("announcement.tabs.description")}</TabsTrigger>
                <TabsTrigger value="updates">{t("announcement.tabs.updates")}</TabsTrigger>
                <TabsTrigger value="supporters">{t("announcement.tabs.supporters")}</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardContent className="p-8">
                    <div className="prose prose-lg max-w-none">
                      <Streamdown 
                        className="max-w-none"
                        shikiTheme="github-light"
                      >
                        {announcement.content}
                      </Streamdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates">
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{t("announcement.noUpdates")}</p>
                      <p className="text-sm text-gray-400 mt-1">{t("announcement.updatesComingSoon")}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="supporters">
                <DonationsList announcementId={announcement.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => setShowThankYouModal(false)}
        announcementTitle={announcement.title}
        onShare={() => handleShare('generic')}
      />
    </div>
  );
}
