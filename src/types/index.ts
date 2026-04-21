export type Platform =
  | "instagram_post"
  | "instagram_story"
  | "instagram_reel"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "email"
  | "ad_copy";

export type Language =
  | "English"
  | "Italian"
  | "French"
  | "German"
  | "Spanish"
  | "Portuguese";

export type CopyLength = "Short" | "Medium" | "Long";

export type Tone =
  | "Luxury & Refined"
  | "Playful & Fun"
  | "Bold & Edgy"
  | "Warm & Friendly"
  | "Professional"
  | "Minimalist";

export interface Brand {
  id: string;
  name: string;
  industry: string | null;
  tone: string;
  voice: string | null;
  keywords: string | null;
  colors: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Asset {
  id: string;
  type: "COPY" | "IMAGE_PROMPT" | "IMAGE";
  content: string;
  platform: string | null;
  language: string | null;
  style: string | null;
  brief: string | null;
  label: string | null;
  tags: string[];
  brandId: string | null;
  createdAt: Date;
}

export interface ScheduledPost {
  id: string;
  label: string;
  platform: string;
  scheduledAt: Date;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  brandId: string | null;
}

export interface GenerateCopyRequest {
  brandId?: string;
  platform: Platform;
  language: Language;
  length: CopyLength;
  brief: string;
}

export interface GenerateImagePromptRequest {
  brandId?: string;
  style: string;
  brief: string;
  references: string[];
}
