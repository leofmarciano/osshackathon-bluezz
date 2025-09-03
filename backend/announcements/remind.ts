import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { announcementsDB } from "./db";
import type { RemindRequest, RemindResponse } from "./types";

// Registers a reminder for the authenticated user for an announcement.
export const remind = api<RemindRequest, RemindResponse>(
  { expose: true, auth: true, method: "POST", path: "/announcements/:slug/remind" },
  async ({ slug }) => {
    const auth = getAuthData()!;
    const ann = await announcementsDB.queryRow<any>`
      SELECT id FROM announcements WHERE slug = ${slug} AND published = TRUE
    `;
    if (!ann) {
      throw APIError.notFound("announcement not found");
    }

    let reminded = false;
    try {
      await announcementsDB.exec`
        INSERT INTO announcement_reminders (announcement_id, user_id)
        VALUES (${ann.id}, ${auth.userID})
      `;
      reminded = true;
    } catch (err) {
      // Unique violation means already reminded; ignore
      reminded = false;
    }

    return { reminded };
  }
);
