import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { AnnouncementDetail } from "./types";

interface GetBySlugRequest {
  slug: string;
  language?: Query<string>;
}

// Retrieves a published announcement by its slug with optional language support.
export const getBySlug = api<GetBySlugRequest, AnnouncementDetail>(
  { expose: true, method: "GET", path: "/announcements/:slug" },
  async (req) => {
    const language = req.language || 'pt';
    
    // First get the base announcement
    const baseRow = await announcementsDB.queryRow<{
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
      default_language: string;
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
        campaign_end_date,
        default_language
      FROM announcements
      WHERE slug = ${req.slug} AND published = true
    `;

    if (!baseRow) {
      throw APIError.notFound("announcement not found");
    }

    // Try to get translation for requested language
    let translatedContent = {
      title: baseRow.title,
      description: baseRow.description,
      content: baseRow.content
    };

    if (language !== baseRow.default_language) {
      const translation = await announcementsDB.queryRow<{
        title: string;
        description: string;
        content: string;
      }>`
        SELECT title, description, content
        FROM announcement_translations
        WHERE announcement_id = ${baseRow.id} AND language = ${language}
      `;

      if (translation) {
        translatedContent = translation;
      }
    }

    return {
      id: baseRow.id,
      slug: baseRow.slug,
      title: translatedContent.title,
      description: translatedContent.description,
      content: translatedContent.content,
      category: baseRow.category,
      location: baseRow.location,
      organizationName: baseRow.organization_name,
      organizationDescription: baseRow.organization_description,
      goalAmount: baseRow.goal_amount,
      raisedAmount: baseRow.raised_amount,
      backersCount: baseRow.backers_count,
      imageUrl: baseRow.image_url,
      published: baseRow.published,
      createdAt: baseRow.created_at,
      updatedAt: baseRow.updated_at,
      campaignEndDate: baseRow.campaign_end_date,
      defaultLanguage: baseRow.default_language,
    };
  }
);
