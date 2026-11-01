"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   CVA VARIANTS
   Premium healthcare design system — all variants and sizes.

   Design tokens referenced (must exist in tailwind.config):
     bg-brand-burgundy        → #7A1F3D
     bg-brand-burgundy-light  → #8F2748
     bg-brand-gold            → #D4AF37
     bg-brand-gold-light      → #E6C24A
     text-text-inverted        → #FFFFFF
     text-text-primary         → #1A1A1A (gray-900)
     text-text-body            → #374151 (gray-700)
     text-text-heading         → #111827 (gray-900)
     bg-bg-subtle              → #F9FAFB (gray-50)
     bg-surface-sage           → #E8F5E9
     text-status-success       → #2E7D32
     border-border-sage        → #A5D6A7
     bg-status-success         → #4CAF50
     bg-status-error           → #D32F2F
     border-brand-burgundy     → #7A1F3D
     border-brand-gold         → #D4AF37
     border-border-gold        → #D4AF37  (for focus rings)
     shadow-burgundy           → custom shadow in tailwind config
     shadow-gold               → custom shadow in tailwind config
───────────────────────────────────────────────────────── */

const buttonVariants = cva(
  // ── Base styles applied to every variant ──────────────────
  [
    // Layout
    "inline-flex items-center justify-center gap-2",
    // Typography
    "font-body font-semibold tracking-wide",
    // Shape
    "rounded-lg border",
    // Interaction
    "cursor-pointer select-none",
    // Smooth transitions for color, shadow, transform
    "transition-all duration-200 ease-out",
    // Focus ring — AA-accessible gold outline
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    // Disabled state — readable gray, no pointer, no hover
    "disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100",
  ],
  {
    variants: {
      variant: {
        /* ── Primary — rich burgundy, main CTA ───────────────── */
        primary: [
          "bg-brand-burgundy text-white border-brand-burgundy",
          "shadow-sm",
          // Hover: lift + deeper shadow + lighter burgundy
          "hover:bg-[#8F2748] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(122,31,61,0.35)]",
          // Active: press down
          "active:translate-y-0 active:shadow-sm active:bg-[#6B1A34]",
        ],

        /* ── Primary Gold — premium/upgrade CTA ──────────────── */
        "primary-gold": [
          // Gradient for premium feel: left-to-right gold sweep
          "bg-gradient-to-r from-[#C9A227] via-[#D4AF37] to-[#E6C24A]",
          "text-gray-900 border-[#C9A227]",
          "shadow-sm font-bold",
          // Hover: glow + lift
          "hover:from-[#D4AF37] hover:via-[#E6C24A] hover:to-[#F0D060]",
          "hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(212,175,55,0.45)]",
          // Active: press
          "active:translate-y-0 active:shadow-sm",
        ],

        /* ── Secondary — outlined burgundy, fills on hover ───── */
        secondary: [
          "bg-white text-brand-burgundy border-brand-burgundy",
          "shadow-sm",
          // Hover: fill with burgundy, white text
          "hover:bg-brand-burgundy hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(122,31,61,0.25)]",
          // Active
          "active:translate-y-0 active:shadow-sm active:bg-[#6B1A34]",
        ],

        /* ── Ghost — transparent, subtle hover bg ────────────── */
        ghost: [
          "bg-transparent text-gray-600 border-transparent",
          // Hover: light gray wash, darker text
          "hover:bg-gray-100 hover:text-gray-900",
          // Active
          "active:bg-gray-200 active:text-gray-900",
          // Override disabled so ghost disabled stays legible
          "disabled:bg-transparent disabled:text-gray-300 disabled:border-transparent",
        ],

        /* ── Sage — green, positive/completed actions ─────────── */
        sage: [
          "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]",
          // Hover: fill with success green
          "hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(76,175,80,0.3)]",
          // Active
          "active:translate-y-0 active:bg-[#388E3C] active:border-[#388E3C]",
        ],

        /* ── Danger — destructive actions ─────────────────────── */
        danger: [
          "bg-[#D32F2F] text-white border-[#D32F2F]",
          "shadow-sm",
          // Hover: slightly brighter, lift
          "hover:bg-[#B71C1C] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(211,47,47,0.35)]",
          // Active
          "active:translate-y-0 active:shadow-sm active:bg-[#C62828]",
        ],

        /* ── Link — text link style, no background ────────────── */
        link: [
          "bg-transparent text-brand-burgundy border-transparent",
          "underline-offset-4 decoration-brand-burgundy/40",
          // Hover: full underline + richer color
          "hover:underline hover:text-[#8F2748] hover:decoration-[#8F2748]/70",
          // Override size to collapse layout to inline
          "!h-auto !px-0 !py-0 !rounded-none",
          // Override disabled
          "disabled:bg-transparent disabled:text-gray-400 disabled:border-transparent",
        ],
      },

      size: {
        // Height / horizontal padding / font / icon gap
        xs: "h-7  px-3   text-xs   rounded-md gap-1",
        sm: "h-9  px-4   text-sm",
        md: "h-11 px-5   text-sm",
        lg: "h-12 px-6   text-base",
        xl: "h-14 px-8   text-base",
      },

      /* ── Icon-only square sizing ──────────────────────────── */
      iconOnly: {
        true: "px-0",   // horizontal padding collapsed; width = height via w-* below
      },
    },

    // Compound variants: when iconOnly is true, fix width = height per size
    compoundVariants: [
      { iconOnly: true, size: "xs", class: "w-7"  },
      { iconOnly: true, size: "sm", class: "w-9"  },
      { iconOnly: true, size: "md", class: "w-11" },
      { iconOnly: true, size: "lg", class: "w-12" },
      { iconOnly: true, size: "xl", class: "w-14" },
    ],

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

/* ─────────────────────────────────────────────────────────
   SPINNER
   Inherits currentColor so it always matches the button text.
───────────────────────────────────────────────────────── */

const spinnerSizeMap: Record<string, string> = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4.5 h-4.5",
  xl: "w-5 h-5",
};

function Spinner({ sizeClass }: { sizeClass: string }) {
  return (
    <svg
      className={cn("animate-spin shrink-0", sizeClass)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   BUTTON PROPS — unchanged public API
───────────────────────────────────────────────────────── */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and locks interactivity; label is sr-only for a11y */
  isLoading?: boolean;
  /** Icon rendered before the label */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label */
  rightIcon?: React.ReactNode;
  /** Icon-only mode — button collapses to a square; pass aria-label! */
  iconOnly?: boolean;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const shouldReduce = useReducedMotion();
    const resolvedSize = size ?? "md";

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, iconOnly: iconOnly || undefined }),
          className,
        )}
        // aria-disabled surfaces loading state to screen readers without
        // removing the element from the tab order (useful for tooltips).
        aria-disabled={isLoading || disabled || undefined}
        disabled={disabled ?? isLoading}
        // Framer Motion press animation respects prefers-reduced-motion.
        whileHover={
          shouldReduce
            ? undefined
            : { scale: variant === "link" || variant === "ghost" ? 1 : 1.015 }
        }
        whileTap={shouldReduce ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <>
            {/* Spinner inherits text color → matches every variant */}
            <Spinner sizeClass={spinnerSizeMap[resolvedSize]??"w-4 h-4"} />
            {/* Hidden label keeps button width stable and aids SR */}
            <span className="sr-only">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0 inline-flex items-center" aria-hidden="true">
                {leftIcon}
              </span>
            )}

            {/* iconOnly: hide from AT since aria-label on button covers it */}
            {iconOnly ? (
              <span className="inline-flex items-center justify-center" aria-hidden="true">
                {children}
              </span>
            ) : (
              <span className="truncate">{children}</span>
            )}

            {rightIcon && (
              <span className="shrink-0 inline-flex items-center" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };