import { api } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { CreateAnnouncementRequest, AnnouncementDetail } from "./types";

// Creates a new announcement (restricted endpoint).
export const create = api<CreateAnnouncementRequest, AnnouncementDetail>(
  { expose: false, method: "POST", path: "/announcements" },
  async (req) => {
    const now = new Date();
    
    const row = await announcementsDB.queryRow<{
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
    }>`
      INSERT INTO announcements (
        slug,
        title,
        description,
        content,
        category,
        location,
        organization_name,
        organization_description,
        goal_amount,
        image_url,
        created_at,
        updated_at,
        campaign_end_date
      ) VALUES (
        ${req.slug},
        ${req.title},
        ${req.description},
        ${req.content},
        ${req.category},
        ${req.location},
        ${req.organizationName},
        ${req.organizationDescription},
        ${req.goalAmount},
        ${req.imageUrl},
        ${now},
        ${now},
        ${req.campaignEndDate}
      )
      RETURNING *
    `;

    if (!row) {
      throw new Error("failed to create announcement");
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
