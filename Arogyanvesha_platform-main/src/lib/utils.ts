import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — Class Name utility
 *
 * Merges Tailwind classes safely, resolving conflicts correctly.
 * Every component in the codebase uses this — never raw string concatenation.
 *
 * Examples:
 *   cn("px-4 py-2", "px-8")           → "py-2 px-8"  (conflict resolved)
 *   cn("text-red-500", isActive && "text-brand-burgundy") → conditional classes
 *   cn(variants({ size: "md" }), className) → CVA variant merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * formatDate() — Consistent date formatting across the app
 * Used in: activity feeds, wisdom articles, progress history
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/**
 * formatRelativeTime() — "2 hours ago", "yesterday", "3 days ago"
 * Used in: notifications, chat timestamps, activity feed
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

/**
 * capitalize() — Capitalizes first letter of a string
 * Used in: Dosha names, herb names, category labels
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * slugify() — Converts a string to a URL-safe slug
 * Used in: wisdom article slugs, herb slugs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * clampNumber() — Clamps a number between min and max
 * Used in: Arogya score, progress percentages, dosha balance
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * getDoshaColor() — Returns the CSS variable name for a given Dosha
 * Used in: DoshaCard, TypingIndicator, DoshaBalanceMeter
 */
export type Dosha = "vata" | "pitta" | "kapha";

export function getDoshaColor(dosha: Dosha): string {
  const map: Record<Dosha, string> = {
    vata:  "var(--color-dosha-vata)",
    pitta: "var(--color-dosha-pitta)",
    kapha: "var(--color-dosha-kapha)",
  };
  return map[dosha];
}

export function getDoshaBgColor(dosha: Dosha): string {
  const map: Record<Dosha, string> = {
    vata:  "var(--color-dosha-vata-bg)",
    pitta: "var(--color-dosha-pitta-bg)",
    kapha: "var(--color-dosha-kapha-bg)",
  };
  return map[dosha];
}

/**
 * truncateText() — Truncates text to a max length with ellipsis
 * Used in: card previews, notification text, search results
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * generateId() — Generates a lightweight unique ID
 * Used in: toast IDs, optimistic update keys, conversation IDs
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}