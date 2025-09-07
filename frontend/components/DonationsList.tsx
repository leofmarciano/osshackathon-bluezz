import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Loader2 } from "lucide-react";
import backend from "~backend/client";
import type { Donation } from "~backend/payments/types";

interface DonationsListProps {
  announcementId: number;
}

export function DonationsList({ announcementId }: DonationsListProps) {
  const { t } = useTranslation();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, [announcementId]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await backend.payments.listDonations({
        announcementId,
        limit: 20,
        offset: 0,
      });
      setDonations(response.donations);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
      setDonations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amountInCents: number) => {
    return `$${(amountInCents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            {t("donations.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">{t("donations.loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            {t("donations.title")}
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {total} {t("donations.supporters")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("donations.noDonations")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("donations.beFirst")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{donation.anonymizedEmail}</p>
                    <p className="text-xs text-gray-500">{formatDate(donation.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatAmount(donation.amount)}</p>
                  <Badge variant="outline" size="sm">
                    {t("donations.completed")}
                  </Badge>
                </div>
              </div>
            ))}
            
            {total > donations.length && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  {t("donations.showingCount", { 
                    showing: donations.length, 
                    total: total 
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
