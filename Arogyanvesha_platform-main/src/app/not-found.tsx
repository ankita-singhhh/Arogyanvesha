import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found — Arogyanvesha" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center text-center px-6">

      {/* Decorative number */}
      <div className="relative mb-8">
        <p className="text-[120px] font-bold text-border-default leading-none select-none font-display">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none">
            <circle cx="60" cy="60" r="40" stroke="var(--color-brand-gold)" strokeWidth="1" opacity="0.3" strokeDasharray="4 4"/>
            <circle cx="60" cy="60" r="20" fill="var(--color-brand-gold)" opacity="0.08"/>
            <path d="M60 40 C60 40 48 52 48 60 C48 68 60 80 60 80 C60 80 72 68 72 60 C72 52 60 40 60 40Z"
              fill="var(--color-brand-gold)" opacity="0.2"/>
            <circle cx="60" cy="60" r="6" fill="var(--color-brand-gold)" opacity="0.5"/>
          </svg>
        </div>
      </div>

      <h1 className="text-h1 font-display font-bold text-text-heading mb-3">
        Page not found
      </h1>
      <p className="text-body-lg text-text-muted max-w-md leading-relaxed mb-8">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on your wellness journey.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-gradient-burgundy text-text-inverted font-semibold text-body shadow-burgundy hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
          Go to dashboard
        </Link>
        <Link href="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-surface-card text-text-heading font-semibold text-body border border-border-default hover:border-brand-burgundy/40 hover:shadow-md transition-all duration-200">
          Back to home
        </Link>
      </div>

      {/* Suggested links */}
      <div className="mt-12 flex flex-wrap gap-3 justify-center">
        {[
          { label: "Prakriti Quiz", href: "/prakriti" },
          { label: "AI Vaidya", href: "/chat" },
          { label: "Yoga", href: "/yoga" },
          { label: "Herb Encyclopedia", href: "/herbs" },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="px-4 py-2 rounded-pill text-body-sm font-medium bg-surface-card border border-border-default text-text-muted hover:border-brand-burgundy/40 hover:text-brand-burgundy transition-all duration-150">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}