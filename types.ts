
export enum ToolCategory {
  LLM = "LLM",
  IMAGE_GEN = "Image Generation",
  VIDEO_GEN = "Video Generation",
  PRODUCTIVITY = "Productivity",
  DEV_TOOLS = "Developer Tools",
  AGENT = "Agents",
  AUDIO = "Audio & Speech",
  PROMPT_ENGINEERING = "Prompt Engineering"
}

export type ToolStatus = "Active" | "Watch" | "Deprecated";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  pricing: "Free" | "Freemium" | "Paid" | "Enterprise";
  rating: number; // 0-5
  reviews: number;
  tags: string[];
  websiteUrl: string;
  status?: ToolStatus; // Active | Watch | Deprecated
  lastVerified?: string; // e.g. "October 2026"
  deprecatedReason?: string;
  specs: {
    easeOfUse: number; // 0-100
    power: number; // 0-100
    community: number; // 0-100
    costEfficiency: number; // 0-100
    integration: number; // 0-100
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
  savedToolIds: string[];
  masteryLevel: number;
  stacksCreated: number;
}

export interface ToolStack {
  id: string;
  name: string;
  author: string;
  role: string;
  tools: string[]; // List of Tool IDs
  description: string;
  likes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface ToolSubmission {
  id?: string;
  name: string;
  category: ToolCategory;
  pricing: "Free" | "Freemium" | "Paid" | "Enterprise";
  description: string;
  websiteUrl: string;
  tags: string[];
  submittedBy?: string;
  createdAt?: string;
  status?: "PENDING_REVIEW" | "APPROVED";
}

export interface PlatformStats {
  totalTools: number;
  totalCategories: number;
  categoryBreakdown: Record<string, number>;
  avgRating: number;
  totalStacks: number;
  uptime: number;
  lastUpdated: string;
}

export interface ToolsApiResponse {
  status: string;
  data: Tool[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
