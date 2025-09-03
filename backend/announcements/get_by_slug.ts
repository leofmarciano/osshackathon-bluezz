import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { AnnouncementDetail } from "./types";

interface GetBySlugRequest {
  slug: string;
}

// Retrieves a published announcement by its slug.
export const getBySlug = api<GetBySlugRequest, AnnouncementDetail>(
  { expose: true, method: "GET", path: "/announcements/:slug" },
  async (req) => {
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
      SELECT 
        id,
        slug,
        title,
        description,
        content,
        category,
        location,
        organization_name,
        organization_description,
        goal_amount,
        raised_amount,
        backers_count,
        image_url,
        published,
        created_at,
        updated_at,
        campaign_end_date
      FROM announcements
      WHERE slug = ${req.slug} AND published = true
    `;

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
