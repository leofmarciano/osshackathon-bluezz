export interface AnnouncementSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  location: string;
  organizationName: string;
  goalAmount: number;
  raisedAmount: number;
  backersCount: number;
  imageUrl?: string;
  createdAt: Date;
  campaignEndDate: Date;
}

export interface AnnouncementDetail {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  location: string;
  organizationName: string;
  organizationDescription?: string;
  goalAmount: number;
  raisedAmount: number;
  backersCount: number;
  imageUrl?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  campaignEndDate: Date;
}

export interface CreateAnnouncementRequest {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  location: string;
  organizationName: string;
  organizationDescription?: string;
  goalAmount: number;
  imageUrl?: string;
  campaignEndDate: Date;
}

export interface UpdateAnnouncementRequest {
  id: number;
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  location?: string;
  organizationName?: string;
  organizationDescription?: string;
  goalAmount?: number;
  imageUrl?: string;
  campaignEndDate?: Date;
}

export interface ListAnnouncementsRequest {
  search?: string;
  category?: string;
  location?: string;
  minGoal?: number;
  maxGoal?: number;
  sortBy?: "newest" | "goal-asc" | "goal-desc" | "progress" | "relevance";
  limit?: number;
  offset?: number;
}

export interface BackAnnouncementRequest {
  announcementId: number;
  amount: number;
}

export interface RemindAnnouncementRequest {
  announcementId: number;
}
