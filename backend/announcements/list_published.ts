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
    
    // Build the WHERE clause with parameterized queries to prevent SQL injection
    const conditions: string[] = ["a.published = true"];
    const params: any[] = [];
    let paramIndex = 1;

    // Search filter - using ILIKE for case-insensitive search
    if (req.search && req.search.trim()) {
      const searchTerm = `%${req.search.trim()}%`;
      conditions.push(`(
        COALESCE(t.title, a.title) ILIKE $${paramIndex} OR 
        COALESCE(t.description, a.description) ILIKE $${paramIndex + 1} OR 
        a.organization_name ILIKE $${paramIndex + 2}
      )`);
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    // Category filter
    if (req.category && req.category !== "all") {
      conditions.push(`a.category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }

    // Location filter
    if (req.location && req.location !== "all") {
      conditions.push(`a.location ILIKE $${paramIndex}`);
      params.push(`%${req.location}%`);
      paramIndex++;
    }

    // Goal range filters
    if (req.minGoal !== undefined && req.minGoal >= 0) {
      conditions.push(`a.goal_amount >= $${paramIndex}`);
      params.push(req.minGoal);
      paramIndex++;
    }

    if (req.maxGoal !== undefined && req.maxGoal >= 0) {
      conditions.push(`a.goal_amount <= $${paramIndex}`);
      params.push(req.maxGoal);
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
        // For relevance, we'll use a combination of factors
        orderBy = "ORDER BY (a.backers_count * 0.3 + (a.raised_amount::FLOAT / a.goal_amount::FLOAT) * 0.7) DESC";
        break;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM announcements a
      LEFT JOIN announcement_translations t ON a.id = t.announcement_id AND t.language = $${paramIndex}
      ${whereClause}
    `;
    
    params.push(language);
    const countResult = await announcementsDB.rawQueryRow<{ total: number }>(countQuery, ...params);
    const total = countResult?.total || 0;

    // Get announcements with translations
    const query = `
      SELECT 
        a.id,
        a.slug,
        COALESCE(t.title, a.title) as title,
        COALESCE(t.description, a.description) as description,
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
      LEFT JOIN announcement_translations t ON a.id = t.announcement_id AND t.language = $${paramIndex + 1}
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex + 2} OFFSET $${paramIndex + 3}
    `;

    params.push(language, limit, offset);

    const announcements: AnnouncementSummary[] = [];
    const rows = announcementsDB.rawQuery<{
      id: number;
      slug: string;
      title: string;
      description: string;
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
    }>(query, ...params);

    for await (const row of rows) {
      announcements.push({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
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
