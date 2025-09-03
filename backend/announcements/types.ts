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
  defaultLanguage: string;
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
  defaultLanguage: string;
}

export interface AnnouncementTranslation {
  id: number;
  announcementId: number;
  language: string;
  title: string;
  description: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
  defaultLanguage?: string;
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
  defaultLanguage?: string;
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
  language?: string;
}

export interface BackAnnouncementRequest {
  announcementId: number;
  amount: number;
}

export interface RemindAnnouncementRequest {
  announcementId: number;
}

export interface CreateTranslationRequest {
  announcementId: number;
  language: string;
  title: string;
  description: string;
  content: string;
}

export interface UpdateTranslationRequest {
  announcementId: number;
  language: string;
  title?: string;
  description?: string;
  content?: string;
}
