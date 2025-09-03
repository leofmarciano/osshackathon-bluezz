import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Heart, DollarSign } from "lucide-react";
import { useBackend, useIsSignedIn } from "../lib/useBackend";
import { useToast } from "@/components/ui/use-toast";

interface DonationModalProps {
  announcementId: number;
  announcementTitle: string;
  children: React.ReactNode;
}

export function DonationModal({ announcementId, announcementTitle, children }: DonationModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const authBackend = useBackend();
  const isSignedIn = useIsSignedIn();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("10.00");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = ["5.00", "10.00", "25.00", "50.00", "100.00"];

  const handleAmountSelect = (value: string) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === "") {
      setCustomAmount(value);
      setAmount(value);
    }
  };

  const handleDonate = async () => {
    if (!isSignedIn) {
      toast({
        title: t("common.error"),
        description: t("donation.signInRequired"),
        variant: "destructive",
      });
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount < 0.50) {
      toast({
        title: t("common.error"),
        description: t("donation.minimumAmount"),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Convert dollars to cents
      const amountInCents = Math.round(donationAmount * 100);
      
      const response = await authBackend.payments.createCheckout({
        announcementId,
        amount: amountInCents,
      });

      // Redirect to Polar checkout
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error("Failed to create checkout:", error);
      toast({
        title: t("common.error"),
        description: t("donation.checkoutError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            {t("donation.title")}
          </DialogTitle>
          <DialogDescription>
            {t("donation.subtitle", { project: announcementTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Predefined amounts */}
          <div>
            <Label className="text-sm font-medium">
              {t("donation.selectAmount")}
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {predefinedAmounts.map((preAmount) => (
                <Button
                  key={preAmount}
                  variant={amount === preAmount && !customAmount ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAmountSelect(preAmount)}
                  className="text-sm"
                >
                  ${preAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="custom-amount" className="text-sm font-medium">
              {t("donation.customAmount")}
            </Label>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="custom-amount"
                type="text"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Current amount display */}
          {amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("donation.donationAmount")}</span>
                <span className="text-xl font-bold">${amount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("donation.processingNote")}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleDonate} 
              disabled={loading || !amount || parseFloat(amount) < 0.50}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              {t("donation.donateButton")}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            {t("donation.secureNote")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
