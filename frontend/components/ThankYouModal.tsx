import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Heart, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementTitle: string;
  onShare: () => void;
}

export function ThankYouModal({ isOpen, onClose, announcementTitle, onShare }: ThankYouModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {t("donation.thankYou.title")}
          </DialogTitle>
          <DialogDescription className="text-center mt-4 text-base">
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                {t("donation.thankYou.subtitle", { project: announcementTitle })}
              </p>
              <p className="text-gray-600">
                {t("donation.thankYou.message")}
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mt-4">
                <Heart className="h-5 w-5 fill-current" />
                <span>{t("donation.thankYou.impactMessage")}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3">
          <Button 
            onClick={() => {
              onShare();
              onClose();
            }}
            className="w-full"
            size="lg"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t("donation.thankYou.shareButton")}
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {t("donation.thankYou.continueButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}