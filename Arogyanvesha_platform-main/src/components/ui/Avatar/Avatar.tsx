import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   CVA VARIANTS
───────────────────────────────────────────────────────── */

const avatarVariants = cva(
  [
    "relative inline-flex items-center justify-center shrink-0",
    "rounded-full overflow-hidden",
    "font-body font-semibold",
    "select-none",
  ],
  {
    variants: {
      size: {
        xs:  "w-6 h-6 text-micro",
        sm:  "w-8 h-8 text-label",
        md:  "w-10 h-10 text-body-sm",
        lg:  "w-12 h-12 text-body",
        xl:  "w-16 h-16 text-body-lg",
        "2xl": "w-20 h-20 text-h4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

/** Extracts up to 2 initials from a display name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/** Returns a deterministic background color based on name */
function getAvatarColor(name: string): string {
  const colors = [
    "bg-brand-burgundy text-text-inverted",
    "bg-dosha-vata text-text-inverted",
    "bg-dosha-pitta text-text-inverted",
    "bg-dosha-kapha text-text-inverted",
    "bg-status-info text-text-inverted",
    "bg-brand-gold text-text-primary",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

/* ─────────────────────────────────────────────────────────
   ONLINE INDICATOR
───────────────────────────────────────────────────────── */

type IndicatorPosition = "top-right" | "bottom-right";

interface OnlineIndicatorProps {
  position?: IndicatorPosition;
}

function OnlineIndicator({ position = "bottom-right" }: OnlineIndicatorProps) {
  return (
    <span
      aria-label="Online"
      className={cn(
        "absolute w-2.5 h-2.5 rounded-full",
        "bg-status-success border-2 border-surface-card",
        position === "bottom-right" && "bottom-0 right-0",
        position === "top-right" && "top-0 right-0",
      )}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   DOSHA RING
   Colored ring around avatar indicating user's primary Dosha
───────────────────────────────────────────────────────── */

function getDoshaRingColor(dosha: Dosha): string {
  const map: Record<Dosha, string> = {
    vata:  "ring-dosha-vata",
    pitta: "ring-dosha-pitta",
    kapha: "ring-dosha-kapha",
  };
  return map[dosha];
}

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** Image URL — falls back to initials if undefined or fails to load */
  src?: string | null;
  /** Used for initials fallback and alt text */
  name: string;
  /** Shows green online dot */
  showOnlineIndicator?: boolean;
  /** Position of online indicator */
  indicatorPosition?: IndicatorPosition;
  /** Applies colored ring for user's primary Dosha */
  dosha?: Dosha | null;
  className?: string;
  /** Image loading priority — set true for above-fold avatars */
  priority?: boolean;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function Avatar({
  src,
  name,
  size = "md",
  showOnlineIndicator = false,
  indicatorPosition = "bottom-right",
  dosha,
  className,
  priority = false,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showImage = !!src && !imgError;
  const initials = getInitials(name);
  const colorClasses = getAvatarColor(name);

  return (
    <span
      className={cn(
        avatarVariants({ size }),
        // Dosha ring
        dosha && [
          "ring-2 ring-offset-1",
          getDoshaRingColor(dosha),
        ],
        className,
      )}
      title={name}
      aria-label={name}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
          priority={priority}
          sizes="(max-width: 768px) 48px, 64px"
        />
      ) : (
        <span
          className={cn(
            "w-full h-full flex items-center justify-center",
            colorClasses,
          )}
          aria-hidden="true"
        >
          {initials}
        </span>
      )}

      {showOnlineIndicator && (
        <OnlineIndicator position={indicatorPosition} />
      )}
    </span>
  );
}

Avatar.displayName = "Avatar";

/* ─────────────────────────────────────────────────────────
   AVATAR GROUP
   Stacked avatars with overflow count — used in team/member lists
───────────────────────────────────────────────────────── */

export interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name: string }>;
  /** Max avatars shown before "+N" overflow */
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
    xs:    "w-6 h-6 text-micro -ml-1.5",
    sm:    "w-8 h-8 text-label -ml-2",
    md:    "w-10 h-10 text-body-sm -ml-2.5",
    lg:    "w-12 h-12 text-body -ml-3",
    xl:    "w-16 h-16 text-body-lg -ml-4",
    "2xl": "w-20 h-20 text-h4 -ml-5",
  };

  const resolvedSize = size ?? "sm";

  return (
    <div
      className={cn("flex items-center", className)}
      aria-label={`${avatars.length} members`}
    >
      {visible.map((avatar, index) => (
        <span
          key={index}
          className={cn(
            "ring-2 ring-surface-card rounded-full",
            index !== 0 && sizeMap[resolvedSize].split(" ").pop(),
          )}
        >
          <Avatar src={avatar.src} name={avatar.name} size={resolvedSize} />
        </span>
      ))}

      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full",
            "bg-bg-subtle text-text-muted font-semibold font-body",
            "ring-2 ring-surface-card",
            sizeMap[resolvedSize],
          )}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

AvatarGroup.displayName = "AvatarGroup";