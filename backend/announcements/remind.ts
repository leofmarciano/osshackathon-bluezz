import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { announcementsDB } from "./db";
import type { RemindAnnouncementRequest } from "./types";

interface RemindResponse {
  success: boolean;
}

// Sets a reminder for an announcement.
export const remind = api<RemindAnnouncementRequest, RemindResponse>(
  { expose: true, auth: true, method: "POST", path: "/announcements/remind" },
  async (req) => {
    const auth = getAuthData()!;

    // Check if announcement exists and is published
    const announcement = await announcementsDB.queryRow<{ id: number }>`
      SELECT id FROM announcements 
      WHERE id = ${req.announcementId} AND published = true
    `;

    if (!announcement) {
      throw APIError.notFound("announcement not found");
    }

    // Insert or update reminder (ON CONFLICT DO NOTHING for uniqueness)
    await announcementsDB.exec`
      INSERT INTO announcement_reminders (announcement_id, user_id)
      VALUES (${req.announcementId}, ${auth.userID})
      ON CONFLICT (announcement_id, user_id) DO NOTHING
    `;

    return { success: true };
  }
);
