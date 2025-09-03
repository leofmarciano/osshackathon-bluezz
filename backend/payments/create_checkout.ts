import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { secret } from "encore.dev/config";
import type { CreateCheckoutRequest, CheckoutResponse } from "./types";

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

    try {
      // Create checkout session with Polar
      const response = await fetch("https://api.polar.sh/v1/checkouts/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${polarKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_price_type: "one_time",
          success_url: `${process.env.FRONTEND_URL || 'https://vaquinha-social-frontend-d2r21j482vjq7vd7ksug.lp.dev'}/announcement/${req.announcementId}/success?checkout_id={CHECKOUT_ID}`,
          customer_email: req.userEmail || auth.email,
          metadata: {
            announcement_id: req.announcementId.toString(),
            user_id: auth.userID,
          },
          amount: req.amount, // Amount in cents
          currency: "USD",
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Polar API error:", errorData);
        throw APIError.internal("Failed to create checkout session");
      }

      const checkoutData = await response.json();

      return {
        checkoutUrl: checkoutData.url,
        checkoutId: checkoutData.id,
      };
    } catch (error) {
      console.error("Error creating Polar checkout:", error);
      throw APIError.internal("Failed to create checkout session");
    }
  }
);
