import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { CreateTranslationRequest, AnnouncementTranslation } from "./types";

// Creates a translation for an announcement (restricted endpoint).
export const createTranslation = api<CreateTranslationRequest, AnnouncementTranslation>(
  { expose: false, method: "POST", path: "/announcements/translations" },
  async (req) => {
    const now = new Date();
    
    // Check if announcement exists
    const announcement = await announcementsDB.queryRow<{ id: number }>`
      SELECT id FROM announcements WHERE id = ${req.announcementId}
    `;

    if (!announcement) {
      throw APIError.notFound("announcement not found");
    }

    // Check if translation already exists
    const existingTranslation = await announcementsDB.queryRow<{ id: number }>`
      SELECT id FROM announcement_translations 
      WHERE announcement_id = ${req.announcementId} AND language = ${req.language}
    `;

    if (existingTranslation) {
      throw APIError.alreadyExists("translation already exists for this language");
    }

    const row = await announcementsDB.queryRow<{
      id: number;
      announcement_id: number;
      language: string;
      title: string;
      description: string;
      content: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO announcement_translations (
        announcement_id,
        language,
        title,
        description,
        content,
        created_at,
        updated_at
      ) VALUES (
        ${req.announcementId},
        ${req.language},
        ${req.title},
        ${req.description},
        ${req.content},
        ${now},
        ${now}
      )
      RETURNING *
    `;

    if (!row) {
      throw new Error("failed to create translation");
    }

    return {
      id: row.id,
      announcementId: row.announcement_id,
      language: row.language,
      title: row.title,
      description: row.description,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
