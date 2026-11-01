
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   BASE SKELETON
   The shimmer animation is defined in globals.css as
   .skeleton-shimmer — warm amber, never cold gray.
   NEVER use a spinner for full-page or card loading.
───────────────────────────────────────────────────────── */

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md", className)}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────
   VARIANT PROPS
───────────────────────────────────────────────────────── */

export type SkeletonVariant = "text" | "card" | "avatar" | "chart" | "list";

export interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  /** Number of repeated items — used by "list" and "text" variants */
  count?: number;
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   TEXT SKELETON
   Mirrors a block of body text — variable width lines
───────────────────────────────────────────────────────── */

function TextSkeleton({ count = 3 }: { count?: number }) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-full", "w-2/3"];

  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading text">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            widths[i % widths.length],
          )}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CARD SKELETON
   Mirrors the BaseCard shape — image area + text lines + action
───────────────────────────────────────────────────────── */

function CardSkeleton() {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-6",
        "bg-surface-card rounded-lg border border-border-default",
        "shadow-sm",
      )}
      role="status"
      aria-label="Loading card"
    >
      {/* Image placeholder */}
      <Skeleton className="w-full h-40 rounded-md" />

      {/* Title */}
      <Skeleton className="h-5 w-3/4" />

      {/* Body lines */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Action area */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   AVATAR SKELETON
   Mirrors Avatar + name + subtitle layout
───────────────────────────────────────────────────────── */

function AvatarSkeleton() {
  return (
    <div
      className="flex items-center gap-3"
      role="status"
      aria-label="Loading profile"
    >
      {/* Avatar circle */}
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />

      {/* Name + subtitle */}
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CHART SKELETON
   Mirrors ArogyaScoreRing + bar chart layout
───────────────────────────────────────────────────────── */

function ChartSkeleton() {
  const barHeights = ["h-16", "h-24", "h-20", "h-32", "h-12", "h-28", "h-20"];

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-6",
        "bg-surface-card rounded-lg border border-border-default",
      )}
      role="status"
      aria-label="Loading chart"
    >
      {/* Chart title */}
      <Skeleton className="h-5 w-40" />

      {/* Ring chart placeholder */}
      <div className="flex items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />

        {/* Legend lines */}
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-32">
        {barHeights.map((h, i) => (
          <Skeleton key={i} className={cn("flex-1 rounded-t-md", h)} />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LIST SKELETON
   Mirrors a feed of items — avatar + text rows
───────────────────────────────────────────────────────── */

function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="flex flex-col divide-y divide-border-default"
      role="status"
      aria-label="Loading list"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          {/* Icon/avatar */}
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />

          {/* Content */}
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Trailing value */}
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────── */

export function SkeletonLoader({
  variant,
  count,
  className,
}: SkeletonLoaderProps) {
  return (
    <div className={className}>
      {variant === "text" && <TextSkeleton count={count} />}
      {variant === "card" && <CardSkeleton />}
      {variant === "avatar" && <AvatarSkeleton />}
      {variant === "chart" && <ChartSkeleton />}
      {variant === "list" && <ListSkeleton count={count} />}
    </div>
  );
}

SkeletonLoader.displayName = "SkeletonLoader";

/* ─────────────────────────────────────────────────────────
   RAW SKELETON — for building custom skeleton shapes
───────────────────────────────────────────────────────── */

export { Skeleton };