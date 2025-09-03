import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";

interface PublishRequest {
  id: number;
}

interface PublishResponse {
  success: boolean;
}

// Publishes an announcement (restricted endpoint).
export const publish = api<PublishRequest, PublishResponse>(
  { expose: false, method: "POST", path: "/announcements/:id/publish" },
  async (req) => {
    const now = new Date();
    
    await announcementsDB.exec`
      UPDATE announcements 
      SET published = true, updated_at = ${now}
      WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
