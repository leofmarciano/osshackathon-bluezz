import { api, APIError } from "encore.dev/api";
import { announcementsDB } from "./db";
import type { UpdateAnnouncementRequest, Announcement } from "./types";

// Updates an existing announcement (restricted/internal).
export const update = api<UpdateAnnouncementRequest, Announcement>(
  { expose: false, method: "PUT", path: "/announcements" },
  async (req) => {
    const row = await announcementsDB.queryRow<any>`
      SELECT * FROM announcements WHERE id = ${req.id}
    `;
    if (!row) {
      throw APIError.notFound("announcement not found");
    }

    const title = req.title ?? row.title;
    const excerpt = req.excerpt ?? row.excerpt;
    const contentMd = req.contentMd ?? row.content_md;
    const coverImageUrl = req.coverImageUrl ?? row.cover_image_url;
    const goalAmount = req.goalAmount ?? Number(row.goal_amount);
    const orgName = req.organization?.name ?? row.organization_name;
    const orgLogo = req.organization?.logoUrl ?? row.organization_logo_url;
    const orgSummary = req.organization?.summary ?? row.organization_summary;

    await announcementsDB.exec`
      UPDATE announcements
      SET
        title = ${title},
        excerpt = ${excerpt},
        content_md = ${contentMd},
        cover_image_url = ${coverImageUrl},
        goal_amount = ${goalAmount},
        organization_name = ${orgName},
        organization_logo_url = ${orgLogo},
        organization_summary = ${orgSummary},
        updated_at = NOW()
      WHERE id = ${req.id}
    `;

    const updated = await announcementsDB.queryRow<any>`
      SELECT
        id, slug, title, excerpt, content_md, cover_image_url,
        goal_amount, pledged_amount, backers_count,
        organization_name, organization_logo_url, organization_summary,
        published, published_at, created_at, updated_at
      FROM announcements WHERE id = ${req.id}
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
