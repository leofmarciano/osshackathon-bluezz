import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { GetAnnouncementRequest, GetAnnouncementResponse, Announcement } from "./types";

// Retrieves a published announcement by slug.
export const getBySlug = api<GetAnnouncementRequest, GetAnnouncementResponse>(
  { expose: true, method: "GET", path: "/announcements/:slug" },
  async ({ slug }) => {
    const r = await announcementsDB.queryRow<any>`
      SELECT
        id, slug, title, excerpt, content_md, cover_image_url,
        goal_amount, pledged_amount, backers_count,
        organization_name, organization_logo_url, organization_summary,
        published, published_at, created_at, updated_at
      FROM announcements
      WHERE slug = ${slug} AND published = TRUE
      LIMIT 1
    `;

    if (!r) {
      throw APIError.notFound("announcement not found");
    }

    const announcement: Announcement = {
      id: Number(r.id),
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? undefined,
      contentMd: r.content_md,
      coverImageUrl: r.cover_image_url ?? undefined,
      goalAmount: Number(r.goal_amount),
      pledgedAmount: Number(r.pledged_amount),
      backersCount: Number(r.backers_count),
      published: Boolean(r.published),
      publishedAt: r.published_at ? new Date(r.published_at) : null,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
      organization: {
        name: r.organization_name,
        logoUrl: r.organization_logo_url ?? undefined,
        summary: r.organization_summary ?? undefined,
      },
    };

    return { announcement };
  }
);
