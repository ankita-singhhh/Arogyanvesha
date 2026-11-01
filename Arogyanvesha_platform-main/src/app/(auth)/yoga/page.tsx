"use client";
import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { YogaPoseCoach } from "@/components/yoga/YogaPoseCoach";
import { api } from "@/lib/api";
import type { YogaSession } from "@/types";

export default function YogaPage() {
  const [sessions, setSessions] = React.useState<YogaSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => { let cancelled = false; api.get<any[]>("/yoga/sessions").then(({ data }) => { if (!cancelled) setSessions((data ?? []).map((s) => ({ id:s.id,title:s.title,description:s.description ?? "",durationMinutes:s.duration_minutes,level:s.level,category:s.category,thumbnailUrl:s.thumbnail_url,videoUrl:s.video_url,doshaTarget:s.dosha_target }))); }).catch(() => !cancelled && setError("Yoga sessions are temporarily unavailable.")).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true; }; }, []);
  return <PageContainer className="py-8"><div className="mx-auto max-w-6xl"><h1 className="text-h1 font-display font-bold text-text-heading">Yoga & Wellness</h1><p className="mt-1 text-body text-text-muted">Explore published yoga sessions. Practice within your comfort and seek qualified guidance for injuries or health concerns.</p>{loading ? <p className="mt-8 text-text-muted">Loading sessions…</p> : error ? <p className="mt-8 text-status-error">{error}</p> : sessions.length === 0 ? <div className="mt-8"><EmptyState variant="no-results" title="No yoga sessions available" description="Published yoga sessions will appear here when available." /></div> : <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{sessions.map((session) => <Link key={session.id} href={`/yoga/${session.id}`} className="rounded-2xl border border-border-default bg-surface-card p-5 transition hover:border-brand-gold"><p className="text-label capitalize text-text-muted">{session.category} · {session.level}</p><h2 className="mt-2 text-h4 font-semibold text-text-heading">{session.title}</h2><p className="mt-2 line-clamp-3 text-body-sm text-text-muted">{session.description}</p><p className="mt-4 text-label font-medium text-brand-burgundy">{session.durationMinutes} min · Open session →</p></Link>)}</div>}<YogaPoseCoach /></div></PageContainer>;
}
