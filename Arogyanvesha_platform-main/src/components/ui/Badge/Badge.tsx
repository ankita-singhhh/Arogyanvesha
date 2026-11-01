import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   BADGE
   Static label — no interaction. Used for:
   - Confidence levels on AI responses ("High", "Medium", "Low")
   - Subscription plan labels ("Pro", "Elite")
   - Status indicators ("Active", "Completed")
   - Dosha labels ("Vata", "Pitta", "Kapha")
───────────────────────────────────────────────────────── */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1",
    "font-body font-semibold",
    "rounded-pill",
    "border",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        /** Default — neutral gray */
        default: "bg-bg-subtle text-text-muted border-border-default",
        /** Brand — burgundy, used for primary labels */
        brand: "bg-brand-burgundy text-text-inverted border-brand-burgundy",
        /** Gold — premium plan labels */
        gold: "bg-brand-gold text-[#1A1208] border-brand-gold",
        /** Gold outline — on dark backgrounds */
        "gold-outline": "bg-transparent text-brand-gold border-brand-gold",
        /** Success */
        success: "bg-status-success-bg text-status-success border-status-success/20",
        /** Warning */
        warning: "bg-status-warning-bg text-status-warning border-status-warning/20",
        /** Error */
        error: "bg-status-error-bg text-status-error border-status-error/20",
        /** Info */
        info: "bg-status-info-bg text-status-info border-status-info/20",
        /** Vata — only used in Dosha contexts */
        vata: "bg-dosha-vata-bg text-dosha-vata border-dosha-vata/20",
        /** Pitta — only used in Dosha contexts */
        pitta: "bg-dosha-pitta-bg text-dosha-pitta border-dosha-pitta/20",
        /** Kapha — only used in Dosha contexts */
        kapha: "bg-dosha-kapha-bg text-dosha-kapha border-dosha-kapha/20",
        /** Outline — transparent background */
        outline: "bg-transparent text-text-body border-border-strong",
      },
      size: {
        sm: "px-2 py-0.5 text-micro",
        md: "px-2.5 py-0.5 text-label",
        lg: "px-3 py-1 text-body-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional dot indicator before label */
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "success" && "bg-status-success",
            variant === "warning" && "bg-status-warning",
            variant === "error" && "bg-status-error",
            variant === "info" && "bg-status-info",
            variant === "vata" && "bg-dosha-vata",
            variant === "pitta" && "bg-dosha-pitta",
            variant === "kapha" && "bg-dosha-kapha",
            variant === "brand" && "bg-text-inverted",
            variant === "gold" && "bg-text-primary",
            (!variant ||
              variant === "default" ||
              variant === "outline" ||
              variant === "gold-outline") &&
              "bg-text-muted",
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

Badge.displayName = "Badge";

/* ─────────────────────────────────────────────────────────
   CHIP
   Interactive — used for filters, tags, selections.
   Can be toggled (selected/unselected) or dismissible (with X).
───────────────────────────────────────────────────────── */

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this chip is currently selected */
  selected?: boolean;
  /** Shows an X button to remove/dismiss the chip */
  onDismiss?: () => void;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Chip size */
  size?: "sm" | "md";
}

export function Chip({
  className,
  selected = false,
  onDismiss,
  leftIcon,
  size = "md",
  children,
  disabled,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        // Base
        "inline-flex items-center gap-1.5",
        "font-body font-medium",
        "rounded-pill border",
        "transition-all duration-150",
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-border-gold focus-visible:ring-offset-1",
        "disabled:opacity-45 disabled:cursor-not-allowed",
        // Size
        size === "sm" ? "h-7 px-3 text-label gap-1" : "h-8 px-3.5 text-body-sm",
        // Unselected state
        !selected && [
          "bg-surface-card text-text-body border-border-default",
          "hover:border-brand-burgundy hover:text-brand-burgundy",
        ],
        // Selected state
        selected && [
          "bg-brand-burgundy/10 text-brand-burgundy border-brand-burgundy",
          "hover:bg-brand-burgundy/15",
        ],
        className,
      )}
      aria-pressed={selected}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0 w-3.5 h-3.5" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      <span>{children}</span>

      {/* Dismiss button — rendered inside the chip */}
      {onDismiss && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Remove ${children}`}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }
          }}
          className={cn(
            "shrink-0 rounded-full p-0.5 -mr-1",
            "hover:bg-brand-burgundy/10",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-gold",
            "transition-colors duration-150",
          )}
        >
          <svg
            className="w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </span>
      )}
    </button>
  );
}

Chip.displayName = "Chip";

export { badgeVariants };