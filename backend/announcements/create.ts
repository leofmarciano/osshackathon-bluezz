import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { CreateAnnouncementRequest, Announcement } from "./types";

// Creates a new announcement (restricted/internal).
export const create = api<CreateAnnouncementRequest, Announcement>(
  { expose: false, method: "POST", path: "/announcements" },
  async (req) => {
    // Validate minimal fields
    if (!req.slug.match(/^[a-z0-9-]+$/)) {
      throw APIError.invalidArgument("slug must be lowercase letters, numbers, and dashes only");
    }
    if (req.goalAmount <= 0) {
      throw APIError.invalidArgument("goalAmount must be > 0");
    }

    const exists = await announcementsDB.queryRow<{ slug: string }>`
      SELECT slug FROM announcements WHERE slug = ${req.slug}
    `;
    if (exists) {
      throw APIError.alreadyExists("slug already exists");
    }

    await announcementsDB.exec`
      INSERT INTO announcements
        (slug, title, excerpt, content_md, cover_image_url,
         goal_amount, pledged_amount, backers_count,
         organization_name, organization_logo_url, organization_summary,
         published, published_at)
      VALUES
        (${req.slug}, ${req.title}, ${req.excerpt ?? null}, ${req.contentMd}, ${req.coverImageUrl ?? null},
         ${req.goalAmount}, 0, 0,
         ${req.organization.name}, ${req.organization.logoUrl ?? null}, ${req.organization.summary ?? null},
         FALSE, NULL)
    `;

    const row = await announcementsDB.queryRow<any>`
      SELECT
        id, slug, title, excerpt, content_md, cover_image_url,
        goal_amount, pledged_amount, backers_count,
        organization_name, organization_logo_url, organization_summary,
        published, published_at, created_at, updated_at
      FROM announcements WHERE slug = ${req.slug}
    `;

    const announcement: Announcement = {
      id: Number(row!.id),
      slug: row!.slug,
      title: row!.title,
      excerpt: row!.excerpt ?? undefined,
      contentMd: row!.content_md,
      coverImageUrl: row!.cover_image_url ?? undefined,
      goalAmount: Number(row!.goal_amount),
      pledgedAmount: Number(row!.pledged_amount),
      backersCount: Number(row!.backers_count),
      published: Boolean(row!.published),
      publishedAt: row!.published_at ? new Date(row!.published_at) : null,
      createdAt: new Date(row!.created_at),
      updatedAt: new Date(row!.updated_at),
      organization: {
        name: row!.organization_name,
        logoUrl: row!.organization_logo_url ?? undefined,
        summary: row!.organization_summary ?? undefined,
      },
    };

    return announcement;
  }
);
