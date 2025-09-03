import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { announcementsDB } from "./db";
import type { BackAnnouncementRequest } from "./types";

interface BackResponse {
  success: boolean;
}

// Backs an announcement with a monetary contribution.
export const back = api<BackAnnouncementRequest, BackResponse>(
  { expose: true, auth: true, method: "POST", path: "/announcements/back" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (req.amount <= 0) {
      throw APIError.invalidArgument("amount must be greater than 0");
    }

    // Check if announcement exists and is published
    const announcement = await announcementsDB.queryRow<{ id: number }>`
      SELECT id FROM announcements 
      WHERE id = ${req.announcementId} AND published = true
    `;

    if (!announcement) {
      throw APIError.notFound("announcement not found");
    }

    // Use a transaction to ensure consistency
    await announcementsDB.begin().then(async (tx) => {
      try {
        // Insert the back record
        await tx.exec`
          INSERT INTO announcement_backs (announcement_id, user_id, amount)
          VALUES (${req.announcementId}, ${auth.userID}, ${req.amount})
        `;

        // Update the announcement totals
        await tx.exec`
          UPDATE announcements 
          SET 
            raised_amount = raised_amount + ${req.amount},
            backers_count = (
              SELECT COUNT(DISTINCT user_id) 
              FROM announcement_backs 
              WHERE announcement_id = ${req.announcementId}
            )
          WHERE id = ${req.announcementId}
        `;

        await tx.commit();
      } catch (err) {
        await tx.rollback();
        throw err;
      }
    });

    return { success: true };
  }
);
