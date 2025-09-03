export interface OrganizationInfo {
  name: string;
  logoUrl?: string;
  summary?: string;
}

export interface Announcement {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  contentMd: string;
  coverImageUrl?: string;
  goalAmount: number; // in cents
  pledgedAmount: number; // in cents
  backersCount: number;
  published: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organization: OrganizationInfo;
}

export interface AnnouncementSummary {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  goalAmount: number;
  pledgedAmount: number;
  backersCount: number;
  organization: Pick<OrganizationInfo, "name" | "logoUrl">;
  publishedAt?: Date | null;
}

export interface CreateAnnouncementRequest {
  slug: string;
  title: string;
  excerpt?: string;
  contentMd: string;
  coverImageUrl?: string;
  goalAmount: number; // cents
  organization: OrganizationInfo;
}

export interface UpdateAnnouncementRequest {
  id: number;
  title?: string;
  excerpt?: string;
  contentMd?: string;
  coverImageUrl?: string;
  goalAmount?: number;
  organization?: OrganizationInfo;
}

export interface PublishAnnouncementRequest {
  id: number;
  published: boolean;
}

export interface ListPublishedResponse {
  announcements: AnnouncementSummary[];
}

export interface GetAnnouncementRequest {
  slug: string;
}

export interface GetAnnouncementResponse {
  announcement: Announcement;
}

export interface RemindRequest {
  slug: string;
}

export interface RemindResponse {
  reminded: boolean;
}

export interface BackRequest {
  slug: string;
  amount: number; // cents
}

export interface BackResponse {
  pledgedAmount: number;
  backersCount: number;
}
