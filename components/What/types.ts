// Unified card type used by UI components (cards/detail) as a union
export type WorkCardData =
  | WorkItemData
  | YouTubeContentData
  | TikTokContentData;

// Separate data typing for split datasets
export interface WorkItemData {
  id: string;
  title: string;
  short: string;
  long: string;
  image: string;
  link?: string;
}

export interface YouTubeContentData {
  id: string;
  title: string;
  short: string;
  image: string;
  slug?: string;
  platform: "youtube";
  videoId: string;
}

export interface TikTokContentData {
  id: string;
  title: string;
  short: string;
  image: string;
  slug?: string;
  platform: "tiktok";
  videoId: string;
  authorHandle: string;
}
