import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { payments } from "~encore/clients";
import type { PolarWebhookPayload } from "./types";

const polarWebhookSecret = secret("PolarWebhookSecret");

// Handles Polar webhook events.
export const webhook = api<PolarWebhookPayload, { success: boolean }>(
  { expose: true, method: "POST", path: "/payments/webhook" },
  async (req, { headers }) => {
    // Verify webhook signature (simplified - in production, use proper signature verification)
    const signature = headers.get("polar-signature");
    if (!signature) {
      throw APIError.unauthenticated("Missing webhook signature");
    }

    try {
      // Handle different webhook events
      switch (req.type) {
        case "order.paid":
          await handleOrderPaid(req.data);
          break;
        case "order.refunded":
          await handleOrderRefunded(req.data);
          break;
        default:
          console.log(`Unhandled webhook event: ${req.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Webhook processing error:", error);
      throw APIError.internal("Failed to process webhook");
    }
  }
);

async function handleOrderPaid(orderData: any) {
  const { id: orderId, metadata, amount, customer } = orderData;
  
  if (!metadata?.announcement_id) {
    console.error("Missing announcement_id in order metadata");
    return;
  }

  const announcementId = parseInt(metadata.announcement_id);
  
  // Process the donation
  await payments.processDonation({
    checkoutId: orderData.checkout_id || "",
    announcementId,
    amount: amount.amount, // Amount in cents
    userEmail: customer.email,
    polarOrderId: orderId,
  });
}

async function handleOrderRefunded(orderData: any) {
  // Handle refund logic here
  console.log("Order refunded:", orderData);
  // You could mark the donation as refunded and update announcement totals
}
