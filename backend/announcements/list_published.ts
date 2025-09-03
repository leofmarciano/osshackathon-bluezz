import { api } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { ListPublishedResponse, AnnouncementSummary } from "./types";

// Lists all published announcements.
export const listPublished = api<void, ListPublishedResponse>(
  { expose: true, method: "GET", path: "/announcements" },
  async () => {
    const rows = await announcementsDB.queryAll<any>`
      SELECT
        id, slug, title, excerpt, cover_image_url,
        goal_amount, pledged_amount, backers_count,
        organization_name, organization_logo_url,
        published_at
      FROM announcements
      WHERE published = TRUE
      ORDER BY COALESCE(published_at, created_at) DESC
    `;

    const announcements: AnnouncementSummary[] = rows.map((r) => ({
      id: Number(r.id),
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? undefined,
      coverImageUrl: r.cover_image_url ?? undefined,
      goalAmount: Number(r.goal_amount),
      pledgedAmount: Number(r.pledged_amount),
      backersCount: Number(r.backers_count),
      organization: {
        name: r.organization_name,
        logoUrl: r.organization_logo_url ?? undefined,
      },
      publishedAt: r.published_at ? new Date(r.published_at) : null,
    }));

    return { announcements };
  }
);
