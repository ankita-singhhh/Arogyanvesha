import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   BUILT-IN ILLUSTRATIONS
   Inline SVGs per context — no external image dependency.
   Each matches the Arogyanvesha warm cream + burgundy palette.
───────────────────────────────────────────────────────── */

function NoResultsIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="48" fill="var(--color-bg-subtle)" />
      <circle cx="52" cy="52" r="20" stroke="var(--color-border-strong)" strokeWidth="3" fill="none" />
      <line x1="67" y1="67" x2="82" y2="82" stroke="var(--color-border-strong)" strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="52" x2="60" y2="52" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="44" x2="52" y2="60" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function NoChatIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="48" fill="var(--color-bg-subtle)" />
      <rect x="28" y="35" width="52" height="36" rx="8" fill="var(--color-surface-card)" stroke="var(--color-border-default)" strokeWidth="2" />
      <rect x="36" y="44" width="24" height="3" rx="1.5" fill="var(--color-border-strong)" />
      <rect x="36" y="52" width="36" height="3" rx="1.5" fill="var(--color-border-default)" />
      <rect x="36" y="60" width="18" height="3" rx="1.5" fill="var(--color-border-default)" />
      <path d="M40 71 L34 80" stroke="var(--color-border-default)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="86" cy="76" r="10" fill="var(--color-brand-gold-pale)" stroke="var(--color-brand-gold)" strokeWidth="2" />
      <path d="M82 76 L85 79 L90 73" stroke="var(--color-brand-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoDataIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="48" fill="var(--color-bg-subtle)" />
      <rect x="32" y="72" width="12" height="20" rx="2" fill="var(--color-border-default)" />
      <rect x="50" y="58" width="12" height="34" rx="2" fill="var(--color-brand-gold)" opacity="0.6" />
      <rect x="68" y="48" width="12" height="44" rx="2" fill="var(--color-brand-burgundy)" opacity="0.4" />
      <line x1="28" y1="92" x2="88" y2="92" stroke="var(--color-border-strong)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="82" cy="38" r="12" fill="var(--color-status-info-bg)" stroke="var(--color-status-info)" strokeWidth="2" />
      <line x1="82" y1="33" x2="82" y2="39" stroke="var(--color-status-info)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="82" cy="43" r="1.5" fill="var(--color-status-info)" />
    </svg>
  );
}

function NoPrakritiIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="48" fill="var(--color-bg-subtle)" />
      {/* Dosha triangle */}
      <polygon
        points="60,28 88,76 32,76"
        stroke="var(--color-border-default)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 3"
      />
      <circle cx="60" cy="28" r="6" fill="var(--color-dosha-vata-bg)" stroke="var(--color-dosha-vata)" strokeWidth="2" />
      <circle cx="88" cy="76" r="6" fill="var(--color-dosha-pitta-bg)" stroke="var(--color-dosha-pitta)" strokeWidth="2" />
      <circle cx="32" cy="76" r="6" fill="var(--color-dosha-kapha-bg)" stroke="var(--color-dosha-kapha)" strokeWidth="2" />
      <circle cx="60" cy="60" r="8" fill="var(--color-brand-gold-pale)" stroke="var(--color-brand-gold)" strokeWidth="2" />
    </svg>
  );
}

function NoYogaIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="48" fill="var(--color-bg-subtle)" />
      {/* Simple figure in tree pose */}
      <circle cx="60" cy="34" r="7" fill="var(--color-brand-burgundy)" opacity="0.3" />
      <line x1="60" y1="41" x2="60" y2="70" stroke="var(--color-brand-burgundy)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <line x1="60" y1="52" x2="45" y2="62" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="52" x2="75" y2="62" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="70" x2="60" y2="88" stroke="var(--color-brand-burgundy)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <line x1="60" y1="78" x2="50" y2="70" stroke="var(--color-border-strong)" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="88" x2="60" y2="92" stroke="var(--color-brand-burgundy)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function GenericEmptyIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="48" fill="var(--color-bg-subtle)" />
      <rect x="36" y="36" width="48" height="48" rx="8" fill="var(--color-surface-card)" stroke="var(--color-border-default)" strokeWidth="2" />
      <line x1="48" y1="54" x2="72" y2="54" stroke="var(--color-border-default)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="62" x2="66" y2="62" stroke="var(--color-border-default)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="70" x2="60" y2="70" stroke="var(--color-border-default)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   ILLUSTRATION MAP
───────────────────────────────────────────────────────── */

export type EmptyStateVariant =
  | "no-results"
  | "no-chat"
  | "no-data"
  | "no-prakriti"
  | "no-yoga"
  | "generic";

const illustrationMap: Record<EmptyStateVariant, React.ReactNode> = {
  "no-results":  <NoResultsIllustration />,
  "no-chat":     <NoChatIllustration />,
  "no-data":     <NoDataIllustration />,
  "no-prakriti": <NoPrakritiIllustration />,
  "no-yoga":     <NoYogaIllustration />,
  "generic":     <GenericEmptyIllustration />,
};

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  /** Custom illustration — overrides variant illustration */
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary CTA button */
  action?: React.ReactNode;
  /** Secondary text link or button */
  secondaryAction?: React.ReactNode;
  /** "page" — full vertical centering. "inline" — compact, fits inside a card */
  size?: "page" | "inline";
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function EmptyState({
  variant = "generic",
  illustration,
  title,
  description,
  action,
  secondaryAction,
  size = "inline",
  className,
}: EmptyStateProps) {
  const resolvedIllustration = illustration ?? illustrationMap[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "page" && "min-h-[60vh] py-20",
        size === "inline" && "py-12 px-6",
        className,
      )}
      role="status"
      aria-label={title}
    >
      {/* Illustration */}
      {resolvedIllustration && (
        <div className="mb-6 opacity-90">
          {resolvedIllustration}
        </div>
      )}

      {/* Title */}
      <h3 className="text-h4 font-semibold text-text-heading mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-body text-text-muted max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col items-center gap-3 mt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

EmptyState.displayName = "EmptyState";