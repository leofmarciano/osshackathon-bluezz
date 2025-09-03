import { api, APIError } from "encore.dev/api";
import { paymentsDB } from "./db";
import { announcementsDB } from "../announcements/db";
import type { ProcessDonationRequest } from "./types";

interface ProcessDonationResponse {
  success: boolean;
  donationId: number;
}

function anonymizeEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  const hiddenLength = Math.max(1, localPart.length - 3);
  const hidden = '*'.repeat(hiddenLength);
  
  return `${visibleStart}${hidden}${visibleEnd}@${domain}`;
}

// Processes a completed donation and updates announcement totals.
export const processDonation = api<ProcessDonationRequest, ProcessDonationResponse>(
  { expose: false, method: "POST", path: "/payments/process" },
  async (req) => {
    if (req.amount < 0) {
      throw APIError.invalidArgument("amount cannot be negative");
    }

    if (!req.userEmail) {
      throw APIError.invalidArgument("user email is required");
    }

    // Check if announcement exists
    const announcement = await announcementsDB.queryRow<{ id: number }>`
      SELECT id FROM announcements WHERE id = ${req.announcementId}
    `;

    if (!announcement) {
      throw APIError.notFound("announcement not found");
    }

    // Insert the donation record
    try {
      const donationRow = await paymentsDB.queryRow<{ id: number }>`
        INSERT INTO donations (
          announcement_id, 
          amount, 
          user_email, 
          anonymized_email,
          user_name,
          polar_order_id,
          checkout_id,
          status
        ) VALUES (
          ${req.announcementId}, 
          ${req.amount}, 
          ${req.userEmail}, 
          ${anonymizeEmail(req.userEmail)},
          ${req.userName ?? null},
          ${req.polarOrderId},
          ${req.checkoutId},
          'completed'
        )
        RETURNING id
      `;

      if (!donationRow) {
        throw new Error("Failed to create donation record");
      }

      // Convert USD cents to BRL cents (approximate conversion, in real app would use current exchange rate)
      const usdToBrlRate = 5.0; // Approximate rate, should be fetched from a real API
      const amountInBrlCents = Math.round(req.amount * usdToBrlRate);

      // Calculate the updated backers count
      const backersCountResult = await paymentsDB.queryRow<{ count: number }>`
        SELECT COUNT(DISTINCT user_email) as count
        FROM donations 
        WHERE announcement_id = ${req.announcementId} AND status = 'completed'
      `;
      const backersCount = backersCountResult?.count ?? 0;

      // Update the announcement totals only if amount > 0
      if (req.amount > 0) {
        await announcementsDB.exec`
          UPDATE announcements 
          SET 
            raised_amount = raised_amount + ${amountInBrlCents},
            backers_count = ${backersCount}
          WHERE id = ${req.announcementId}
        `;
      } else {
        // For zero amount donations, just update the backers count
        await announcementsDB.exec`
          UPDATE announcements 
          SET 
            backers_count = ${backersCount}
          WHERE id = ${req.announcementId}
        `;
      }

      return {
        success: true,
        donationId: donationRow.id,
      };
    } catch (err) {
      console.error("Error processing donation:", err);
      throw APIError.internal("Failed to process donation");
    }
  }
);
