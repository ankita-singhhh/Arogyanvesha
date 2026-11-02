"use client";
import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { YogaPoseLibrary } from "@/components/yoga/YogaPoseLibrary";
import { YogaPracticeStudio } from "@/components/yoga/YogaPracticeStudio";
import { api } from "@/lib/api";
import { YOGA_POSES } from "@/lib/yogaPoses";
import type { YogaSession } from "@/types";

type YogaSessionResponse = {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes: number;
  level: YogaSession["level"];
  category: YogaSession["category"];
  thumbnail_url?: string | null;
  video_url?: string | null;
  dosha_target?: YogaSession["doshaTarget"];
};

export default function YogaPage() {
  const [sessions, setSessions] = React.useState<YogaSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    api
      .get<YogaSessionResponse[]>("/yoga/sessions")
      .then(({ data }) => {
        if (cancelled) return;
        setSessions(
          (data ?? []).map((session) => ({
            id: session.id,
            title: session.title,
            description: session.description ?? "",
            durationMinutes: session.duration_minutes,
            level: session.level,
            category: session.category,
            thumbnailUrl: session.thumbnail_url,
            videoUrl: session.video_url,
            doshaTarget: session.dosha_target,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setError("Yoga sessions are temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer className="py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-h1 font-display font-bold text-text-heading">
          Yoga & Wellness
        </h1>
        <p className="mt-1 max-w-3xl text-body text-text-muted">
          Explore pose-by-pose guidance or published sessions. Practise within
          your comfort and seek qualified guidance for injuries or health concerns.
        </p>

        <YogaPoseLibrary />

        <section aria-labelledby="published-sessions-heading" className="mt-12">
          <h2
            id="published-sessions-heading"
            className="text-h2 font-display font-bold text-text-heading"
          >
            Guided sessions
          </h2>
          {loading ? (
            <p role="status" className="mt-5 text-body-sm text-text-muted">
              Loading published sessions…
            </p>
          ) : error ? (
            <p role="alert" className="mt-5 text-body-sm text-status-error">
              {error}
            </p>
          ) : sessions.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                variant="no-results"
                title="No guided sessions available"
                description="Published yoga sessions will appear here when available."
              />
            </div>
          ) : (
            <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/yoga/${session.id}`}
                    className="block h-full rounded-2xl border border-border-default bg-surface-card p-5 transition hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
                  >
                    <p className="text-label capitalize text-text-muted">
                      {session.category} · {session.level}
                    </p>
                    <h3 className="mt-2 text-h4 font-semibold text-text-heading">
                      {session.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-body-sm text-text-muted">
                      {session.description}
                    </p>
                    <p className="mt-4 text-label font-medium text-brand-burgundy">
                      {session.durationMinutes} min · Open session{" "}
                      <span aria-hidden="true">→</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <YogaPracticeStudio poses={YOGA_POSES.slice(0, 3)} />
      </div>
    </PageContainer>
  );
}
