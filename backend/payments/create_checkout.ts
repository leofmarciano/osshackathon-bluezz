import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { secret } from "encore.dev/config";
import { announcementsDB } from "../announcements/db";
import type { CreateCheckoutRequest, CheckoutResponse } from "./types";
// Polar TypeScript SDK
import { Polar } from "@polar-sh/sdk";

const polarKey = secret("PolarKey");

// Creates a Polar checkout session for a donation.
export const createCheckout = api<CreateCheckoutRequest, CheckoutResponse>(
  { expose: true, auth: true, method: "POST", path: "/payments/checkout" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (req.amount <= 0) {
      throw APIError.invalidArgument("amount must be greater than 0");
    }

    if (req.amount < 50) { // Minimum $0.50
      throw APIError.invalidArgument("minimum donation amount is $0.50");
    }

    // Get announcement slug for success URL
    const announcement = await announcementsDB.queryRow<{ slug: string }>`
      SELECT slug FROM announcements WHERE id = ${req.announcementId} AND published = true
    `;

    if (!announcement) {
      throw APIError.notFound("announcement not found");
    }

    try {
      // Initialize the Polar SDK client
      const client = new Polar({
        accessToken: polarKey(),
        // Default server points to production (https://api.polar.sh)
      });

      const successUrl = `${process.env.FRONTEND_URL || "https://vaquinha-social-frontend-d2r21j482vjq7vd7ksug.lp.dev"}/announcement/${announcement.slug}?donation_success=true&checkout_id={CHECKOUT_ID}`;

      // Create a custom checkout session via SDK
      const session = await client.checkouts.custom.create({
        successUrl,
        customerEmail: req.userEmail || auth.email,
        metadata: {
          announcement_id: req.announcementId.toString(),
          user_id: auth.userID,
        },
        amount: req.amount, // cents
        productId: "b26e017c-06ca-4217-9510-ed4b5c529bda",
      });

      if (!session || !session.id || !session.url) {
        console.error("Polar SDK returned unexpected session:", session);
        throw APIError.internal("Failed to create checkout session");
      }

      return {
        checkoutUrl: session.url as string,
        checkoutId: session.id as string,
      };
    } catch (error: any) {
      // Log SDK/API error details when available
      const data = error?.data || error?.response?.data || error?.message;
      console.error("Error creating Polar checkout (SDK):", data ?? error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to create checkout session");
    }
  }
);
