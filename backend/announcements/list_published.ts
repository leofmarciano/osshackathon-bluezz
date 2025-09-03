import { api } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { ListAnnouncementsRequest, AnnouncementSummary } from "./types";

interface ListPublishedResponse {
  announcements: AnnouncementSummary[];
  total: number;
}

// Lists all published announcements with filtering and search capabilities.
export const listPublished = api<ListAnnouncementsRequest, ListPublishedResponse>(
  { expose: true, method: "GET", path: "/announcements" },
  async (req) => {
    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;
    const language = req.language || 'pt';
    
    // Build the WHERE clause
    const conditions: string[] = ["a.published = true"];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (req.search && req.search.trim()) {
      const searchTerm = `%${req.search.trim()}%`;
      conditions.push(`(a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex + 1} OR a.organization_name ILIKE $${paramIndex + 2})`);
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    // Category filter
    if (req.category && req.category !== "all") {
      conditions.push(`a.category = $${paramIndex}`);
      queryParams.push(req.category);
      paramIndex++;
    }

    // Location filter
    if (req.location && req.location !== "all") {
      conditions.push(`a.location ILIKE $${paramIndex}`);
      queryParams.push(`%${req.location}%`);
      paramIndex++;
    }

    // Goal range filters
    if (req.minGoal !== undefined && req.minGoal >= 0) {
      conditions.push(`a.goal_amount >= $${paramIndex}`);
      queryParams.push(req.minGoal);
      paramIndex++;
    }

    if (req.maxGoal !== undefined && req.maxGoal >= 0) {
      conditions.push(`a.goal_amount <= $${paramIndex}`);
      queryParams.push(req.maxGoal);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Build ORDER BY clause
    let orderBy = "ORDER BY a.created_at DESC";
    switch (req.sortBy) {
      case "newest":
        orderBy = "ORDER BY a.created_at DESC";
        break;
      case "goal-asc":
        orderBy = "ORDER BY a.goal_amount ASC";
        break;
      case "goal-desc":
        orderBy = "ORDER BY a.goal_amount DESC";
        break;
      case "progress":
        orderBy = "ORDER BY (a.raised_amount::FLOAT / a.goal_amount::FLOAT) DESC";
        break;
      case "relevance":
        orderBy = "ORDER BY (a.backers_count * 0.3 + (a.raised_amount::FLOAT / a.goal_amount::FLOAT) * 0.7) DESC";
        break;
    }

    // Get total count first (simpler query)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM announcements a
      ${whereClause}
    `;
    
    const countResult = await announcementsDB.rawQueryRow<{ total: number }>(countQuery, ...queryParams);
    const total = countResult?.total || 0;

    // Get announcements - first get base data
    const baseQuery = `
      SELECT 
        a.id,
        a.slug,
        a.title as original_title,
        a.description as original_description,
        a.category,
        a.location,
        a.organization_name,
        a.goal_amount,
        a.raised_amount,
        a.backers_count,
        a.image_url,
        a.created_at,
        a.campaign_end_date,
        a.default_language
      FROM announcements a
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const finalParams = [...queryParams, limit, offset];
    const baseRows = await announcementsDB.rawQueryAll<{
      id: number;
      slug: string;
      original_title: string;
      original_description: string;
      category: string;
      location: string;
      organization_name: string;
      goal_amount: number;
      raised_amount: number;
      backers_count: number;
      image_url?: string;
      created_at: Date;
      campaign_end_date: Date;
      default_language: string;
    }>(baseQuery, ...finalParams);

    const announcements: AnnouncementSummary[] = [];

    // Get translations for each announcement if needed
    for (const row of baseRows) {
      let title = row.original_title;
      let description = row.original_description;

      // If requesting a different language than the default, try to get translation
      if (language !== row.default_language) {
        const translation = await announcementsDB.queryRow<{
          title: string;
          description: string;
        }>`
          SELECT title, description
          FROM announcement_translations
          WHERE announcement_id = ${row.id} AND language = ${language}
        `;

        if (translation) {
          title = translation.title;
          description = translation.description;
        }
      }

      announcements.push({
        id: row.id,
        slug: row.slug,
        title,
        description,
        category: row.category,
        location: row.location,
        organizationName: row.organization_name,
        goalAmount: row.goal_amount,
        raisedAmount: row.raised_amount,
        backersCount: row.backers_count,
        imageUrl: row.image_url,
        createdAt: row.created_at,
        campaignEndDate: row.campaign_end_date,
        defaultLanguage: row.default_language,
      });
    }

    return {
      announcements,
      total,
    };
  }
);
