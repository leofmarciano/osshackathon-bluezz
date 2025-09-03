import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { UpdateAnnouncementRequest, AnnouncementDetail } from "./types";

// Updates an existing announcement (restricted endpoint).
export const update = api<UpdateAnnouncementRequest, AnnouncementDetail>(
  { expose: false, method: "PUT", path: "/announcements/:id" },
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

    if (req.category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }

    if (req.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`);
      params.push(req.location);
      paramIndex++;
    }

    if (req.organizationName !== undefined) {
      updateFields.push(`organization_name = $${paramIndex}`);
      params.push(req.organizationName);
      paramIndex++;
    }

    if (req.organizationDescription !== undefined) {
      updateFields.push(`organization_description = $${paramIndex}`);
      params.push(req.organizationDescription);
      paramIndex++;
    }

    if (req.goalAmount !== undefined) {
      updateFields.push(`goal_amount = $${paramIndex}`);
      params.push(req.goalAmount);
      paramIndex++;
    }

    if (req.imageUrl !== undefined) {
      updateFields.push(`image_url = $${paramIndex}`);
      params.push(req.imageUrl);
      paramIndex++;
    }

    if (req.campaignEndDate !== undefined) {
      updateFields.push(`campaign_end_date = $${paramIndex}`);
      params.push(req.campaignEndDate);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    params.push(now);
    paramIndex++;

    // Add the ID parameter for WHERE clause
    params.push(req.id);

    const query = `
      UPDATE announcements 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await announcementsDB.rawQueryRow<{
      id: number;
      slug: string;
      title: string;
      description: string;
      content: string;
      category: string;
      location: string;
      organization_name: string;
      organization_description?: string;
      goal_amount: number;
      raised_amount: number;
      backers_count: number;
      image_url?: string;
      published: boolean;
      created_at: Date;
      updated_at: Date;
      campaign_end_date: Date;
    }>(query, ...params);

    if (!row) {
      throw APIError.notFound("announcement not found");
    }

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      content: row.content,
      category: row.category,
      location: row.location,
      organizationName: row.organization_name,
      organizationDescription: row.organization_description,
      goalAmount: row.goal_amount,
      raisedAmount: row.raised_amount,
      backersCount: row.backers_count,
      imageUrl: row.image_url,
      published: row.published,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      campaignEndDate: row.campaign_end_date,
    };
  }
);
