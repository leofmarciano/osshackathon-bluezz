import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { announcementsDB } from "./db";
import type { BackRequest, BackResponse } from "./types";

// Creates a pledge for the project and updates totals.
export const back = api<BackRequest, BackResponse>(
  { expose: true, auth: true, method: "POST", path: "/announcements/:slug/back" },
  async ({ slug, amount }) => {
    if (amount <= 0) {
      throw APIError.invalidArgument("amount must be greater than 0");
    }
    const auth = getAuthData()!;

    const ann = await announcementsDB.queryRow<any>`
      SELECT id FROM announcements WHERE slug = ${slug} AND published = TRUE
    `;
    if (!ann) {
      throw APIError.notFound("announcement not found");
    }

    const tx = await announcementsDB.begin();
    try {
      await tx.exec`
        INSERT INTO announcement_pledges (announcement_id, user_id, amount)
        VALUES (${ann.id}, ${auth.userID}, ${amount})
      `;

      const totals = await tx.queryRow<any>`
        SELECT
          COALESCE(SUM(amount), 0) AS pledged,
          COALESCE(COUNT(DISTINCT user_id), 0) AS backers
        FROM announcement_pledges
        WHERE announcement_id = ${ann.id}
      `;

      await tx.exec`
        UPDATE announcements
        SET pledged_amount = ${Number(totals!.pledged)}, backers_count = ${Number(totals!.backers)}, updated_at = NOW()
        WHERE id = ${ann.id}
      `;

      await tx.commit();

      return {
        pledgedAmount: Number(totals!.pledged),
        backersCount: Number(totals!.backers),
      };
    } catch (err) {
      await tx.rollback();
      throw APIError.internal("failed to create pledge", err as Error);
    }
  }
);
