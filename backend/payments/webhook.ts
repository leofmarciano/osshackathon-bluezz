import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import type { IncomingMessage, ServerResponse } from "http";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { payments } from "~encore/clients";

const webhookSecret = secret("PolarWebhookSecret");

// Raw handler to verify Polar webhook signatures.
export const webhook = api.raw({ expose: true, method: "POST", path: "/payments/webhook" }, async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const body = await readBody(req);

    const headers = {
      "webhook-id": String((req.headers["webhook-id"] ?? "")),
      "webhook-timestamp": String((req.headers["webhook-timestamp"] ?? "")),
      "webhook-signature": String((req.headers["webhook-signature"] ?? "")),
    };

    const event = validateEvent(body, headers as Record<string, string>, webhookSecret());

    switch ((event as any).type) {
      case "order.paid":
        await handleOrderCreated((event as any).data);
        break;
      default:
        console.log(`Unhandled webhook event: ${(event as any).type}`);
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: true }));
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      res.statusCode = 403;
      res.end(JSON.stringify({ received: false }));
      return;
    }
    console.error("Webhook processing error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Failed to process webhook" }));
  }
});

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  return await new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleOrderCreated(orderData: any) {
  const order = orderData?.order ?? orderData;

  const orderId = order?.id ?? orderData?.id ?? "";
  const metadata = order?.metadata ?? orderData?.metadata ?? {};
  const announcementIdRaw = metadata?.announcement_id ?? metadata?.announcementId;
  if (!announcementIdRaw) {
    console.error("Missing announcement_id in order metadata");
    return;
  }
  const announcementId = parseInt(String(announcementIdRaw), 10);
  if (Number.isNaN(announcementId)) {
    console.error("Invalid announcement_id in order metadata:", announcementIdRaw);
    return;
  }

  const checkoutId = order?.checkoutId ?? order?.checkout_id ?? orderData?.checkoutId ?? orderData?.checkout_id ?? "";
  const customer = order?.customer ?? orderData?.customer ?? {};
  const customerEmail = customer?.email ?? order?.customer_email ?? orderData?.customer_email ?? "";
  const customerName = customer?.name ?? order?.customer_name ?? orderData?.customer_name ?? undefined;

  const amountValue =
    typeof order?.amount === "number"
      ? order.amount
      : typeof order?.amount?.amount === "number"
      ? order.amount.amount
      : typeof order?.total_amount === "number"
      ? order.total_amount
      : typeof order?.totalAmount === "number"
      ? order.totalAmount
      : undefined;
  if (typeof amountValue !== "number") {
    console.error("Missing amount in order payload", order);
    return;
  }

  await payments.processDonation({
    checkoutId: checkoutId || "",
    announcementId,
    amount: amountValue, // cents
    userEmail: customerEmail,
    userName: customerName,
    polarOrderId: orderId,
  });
}
