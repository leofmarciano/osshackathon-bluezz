import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { UpdateTranslationRequest, AnnouncementTranslation } from "./types";

// Updates a translation for an announcement (restricted endpoint).
export const updateTranslation = api<UpdateTranslationRequest, AnnouncementTranslation>(
  { expose: false, method: "PUT", path: "/announcements/translations/:announcementId/:language" },
  async (req) => {
    const now = new Date();
    
    // Build dynamic UPDATE query based on provided fields
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      params.push(req.title);
      paramIndex++;
    }

    if (req.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      params.push(req.description);
      paramIndex++;
    }

    if (req.content !== undefined) {
      updateFields.push(`content = $${paramIndex}`);
      params.push(req.content);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    params.push(now);
    paramIndex++;

    // Add the WHERE clause parameters
    params.push(req.announcementId, req.language);

    const query = `
      UPDATE announcement_translations 
      SET ${updateFields.join(", ")}
      WHERE announcement_id = $${paramIndex} AND language = $${paramIndex + 1}
      RETURNING *
    `;

    const row = await announcementsDB.rawQueryRow<{
      id: number;
      announcement_id: number;
      language: string;
      title: string;
      description: string;
      content: string;
      created_at: Date;
      updated_at: Date;
    }>(query, ...params);

    if (!row) {
      throw APIError.notFound("translation not found");
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
