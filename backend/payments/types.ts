export interface CreateCheckoutRequest {
  announcementId: number;
  amount: number; // Amount in USD cents
  userEmail?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  checkoutId: string;
}

export interface ProcessDonationRequest {
  checkoutId: string;
  announcementId: number;
  amount: number;
  userEmail: string;
  polarOrderId?: string;
}

export interface Donation {
  id: number;
  announcementId: number;
  amount: number;
  userEmail: string;
  anonymizedEmail: string;
  polarOrderId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface ListDonationsRequest {
  announcementId: number;
  limit?: number;
  offset?: number;
}

export interface ListDonationsResponse {
  donations: Donation[];
  total: number;
}

export interface PolarWebhookPayload {
  type: string;
  data: any;
}
