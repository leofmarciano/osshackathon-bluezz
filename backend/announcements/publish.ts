import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { PublishAnnouncementRequest, Announcement } from "./types";

// Publishes or unpublishes an announcement (restricted/internal).
export const setPublished = api<PublishAnnouncementRequest, Announcement>(
  { expose: false, method: "POST", path: "/announcements/publish" },
  async ({ id, published }) => {
    const row = await announcementsDB.queryRow<any>`
      SELECT id FROM announcements WHERE id = ${id}
    `;
    if (!row) {
      throw APIError.notFound("announcement not found");
    }

    await announcementsDB.exec`
      UPDATE announcements
      SET
        published = ${published},
        published_at = ${published ? new Date() : null},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    const updated = await announcementsDB.queryRow<any>`
      SELECT
        id, slug, title, excerpt, content_md, cover_image_url,
        goal_amount, pledged_amount, backers_count,
        organization_name, organization_logo_url, organization_summary,
        published, published_at, created_at, updated_at
      FROM announcements WHERE id = ${id}
    `;

    const ann: Announcement = {
      id: Number(updated!.id),
      slug: updated!.slug,
      title: updated!.title,
      excerpt: updated!.excerpt ?? undefined,
      contentMd: updated!.content_md,
      coverImageUrl: updated!.cover_image_url ?? undefined,
      goalAmount: Number(updated!.goal_amount),
      pledgedAmount: Number(updated!.pledged_amount),
      backersCount: Number(updated!.backers_count),
      published: Boolean(updated!.published),
      publishedAt: updated!.published_at ? new Date(updated!.published_at) : null,
      createdAt: new Date(updated!.created_at),
      updatedAt: new Date(updated!.updated_at),
      organization: {
        name: updated!.organization_name,
        logoUrl: updated!.organization_logo_url ?? undefined,
        summary: updated!.organization_summary ?? undefined,
      },
    };

    return ann;
  }
);
