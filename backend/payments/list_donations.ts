import { api } from "encore.dev/api";
import { paymentsDB } from "./db";
import type { ListDonationsRequest, ListDonationsResponse, Donation } from "./types";

// Lists donations for an announcement with anonymized email addresses.
export const listDonations = api<ListDonationsRequest, ListDonationsResponse>(
  { expose: true, method: "GET", path: "/payments/donations/:announcementId" },
  async (req) => {
    const limit = Math.min(req.limit || 50, 100);
    const offset = req.offset || 0;

    // Get total count
    const countResult = await paymentsDB.queryRow<{ total: number }>`
      SELECT COUNT(*) as total
      FROM donations
      WHERE announcement_id = ${req.announcementId} AND status = 'completed'
    `;
    const total = countResult?.total || 0;

    // Get donations with only anonymized emails
    const rows = await paymentsDB.queryAll<{
      id: number;
      announcement_id: number;
      amount: number;
      anonymized_email: string;
      polar_order_id?: string;
      status: string;
      created_at: Date;
    }>`
      SELECT 
        id,
        announcement_id,
        amount,
        anonymized_email,
        polar_order_id,
        status,
        created_at
      FROM donations
      WHERE announcement_id = ${req.announcementId} AND status = 'completed'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const donations: Donation[] = rows.map(row => ({
      id: row.id,
      announcementId: row.announcement_id,
      amount: row.amount,
      userEmail: row.anonymized_email, // Return anonymized email as userEmail for API consistency
      anonymizedEmail: row.anonymized_email,
      polarOrderId: row.polar_order_id,
      status: row.status as 'pending' | 'completed' | 'failed',
      createdAt: row.created_at,
    }));

    return {
      donations,
      total,
    };
  }
);
