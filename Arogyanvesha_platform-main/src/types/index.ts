/**
 * Arogyanvesha — Shared TypeScript Types
 * All types used across more than one file live here.
 * Feature-specific types live colocated with their feature.
 */

/* ─────────────────────────────────────────────────────────
   PRIMITIVE TYPES
───────────────────────────────────────────────────────── */

export type Dosha = "vata" | "pitta" | "kapha";

export type Theme = "light" | "dark" | "system";

export type SubscriptionPlan = "free" | "pro" | "elite";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

/* ─────────────────────────────────────────────────────────
   USER & AUTH TYPES
───────────────────────────────────────────────────────── */

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  plan: SubscriptionPlan;
  prakritiCompleted: boolean;
  primaryDosha?: Dosha | null;
  secondaryDosha?: Dosha | null;
  arogyaScore?: number | null;       // 0–100
  currentStreak?: number;            // days
  createdAt: string;
}

export interface AuthSession {
  user: AppUser;
  accessToken: string;
  expiresAt: string;
}

/* ─────────────────────────────────────────────────────────
   PRAKRITI TYPES
───────────────────────────────────────────────────────── */

export interface DoshaBalance {
  vata: number;    // percentage 0–100, three must sum to 100
  pitta: number;
  kapha: number;
}

export interface PrakritiResult {
  id: string;
  userId: string;
  primaryDosha: Dosha;
  secondaryDosha: Dosha;
  balance: DoshaBalance;
  completedAt: string;
  recommendations: string[];
}

export interface PrakritiQuestion {
  id: number;           // 0–19
  text: string;
  options: PrakritiOption[];
  category: "physical" | "mental" | "digestive" | "emotional" | "sleep";
}

export interface PrakritiOption {
  id: string;
  text: string;
  dosha: Dosha;
}

/* ─────────────────────────────────────────────────────────
   AI CHAT TYPES
───────────────────────────────────────────────────────── */

export type MessageRole = "user" | "assistant" | "system";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  confidence?: ConfidenceLevel | null;
  sources?: string[];
  isStreaming?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage?: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────────────────
   HEALTH & PROGRESS TYPES
───────────────────────────────────────────────────────── */

export interface HealthScore {
  overall: number;         // 0–100 Arogya Score
  physical: number;
  mental: number;
  digestive: number;
  sleep: number;
  updatedAt: string;
}

export interface StreakData {
  current: number;         // days
  longest: number;
  lastLogDate: string | null;
}

export interface ActivityItem {
  id: string;
  type: "prakriti" | "yoga" | "chat" | "skin" | "routine" | "wisdom";
  title: string;
  description?: string;
  completedAt: string;
}

/* ─────────────────────────────────────────────────────────
   YOGA TYPES
───────────────────────────────────────────────────────── */

export type YogaLevel = "beginner" | "intermediate" | "advanced";

export type YogaCategory =
  | "morning"
  | "evening"
  | "stress-relief"
  | "strength"
  | "flexibility"
  | "meditation"
  | "pranayama";

export interface YogaSession {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  level: YogaLevel;
  category: YogaCategory;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  doshaTarget?: Dosha | null;
  isFavorited?: boolean;
  completionCount?: number;
}

/* ─────────────────────────────────────────────────────────
   HERB TYPES
───────────────────────────────────────────────────────── */

export interface Herb {
  id: string;
  slug: string;
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  doshaEffect: {
    vata: "increases" | "decreases" | "neutral";
    pitta: "increases" | "decreases" | "neutral";
    kapha: "increases" | "decreases" | "neutral";
  };
  imageUrl?: string | null;
  category: string;
}

/* ─────────────────────────────────────────────────────────
   WISDOM / ARTICLE TYPES
───────────────────────────────────────────────────────── */

export interface WisdomArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;             // Markdown
  category: string;
  tags: string[];
  readTimeMinutes: number;
  imageUrl?: string | null;
  publishedAt: string;
}

/* ─────────────────────────────────────────────────────────
   NOTIFICATION TYPES
───────────────────────────────────────────────────────── */

export type NotificationType =
  | "reminder"
  | "achievement"
  | "insight"
  | "system"
  | "streak";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

/* ─────────────────────────────────────────────────────────
   API TYPES
───────────────────────────────────────────────────────── */

export interface AppError {
  code: string;
  message: string;
  field?: string | null;      // for form field errors
  statusCode?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT PROP TYPES
   Shared prop shapes used across multiple components.
───────────────────────────────────────────────────────── */

/** Any component that accepts additional className */
export interface WithClassName {
  className?: string;
}

/** Any component that accepts children */
export interface WithChildren {
  children: React.ReactNode;
}

/** Standard size scale used across Button, Avatar, ProgressRing etc. */
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Toast notification shape used by useToast hook */
export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;           // ms, default 4000
}

/** Skin analysis result */
export interface SkinAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  conditions: SkinCondition[];
  recommendations: string[];
  analyzedAt: string;
}

export interface SkinCondition {
  name: string;
  severity: "mild" | "moderate" | "severe";
  confidence: number;          // 0–1
  description: string;
}

/** Routine / Dinacharya practice */
export interface RoutinePractice {
  id: string;
  name: string;
  description: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  durationMinutes: number;
  doshaRecommended?: Dosha | null;
  isCompleted?: boolean;
}