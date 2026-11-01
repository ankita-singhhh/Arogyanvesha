"use client";

import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

type ScoreRow = { overall: number; physical: number; mental: number; digestive: number; sleep: number; computed_at: string };

export default function ProgressPage() {
  const [scores, setScores] = React.useState<ScoreRow[]>([]);
  const [activity, setActivity] = React.useState<ActivityItem[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([api.get<ScoreRow[]>("/progress/health-score"), api.get<any[]>("/progress/activity"), api.get<{ currentStreak: number }>("/progress/streak")])
      .then(([scoreResponse, activityResponse, streakResponse]) => {
        if (cancelled) return;
        setScores(scoreResponse.data ?? []);
        setActivity((activityResponse.data ?? []).map((entry: any) => ({ id: entry.id, type: entry.type, title: entry.title, description: entry.description, completedAt: entry.created_at })));
        setStreak(streakResponse.data?.currentStreak ?? 0);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const latest = scores[0];
  const dimensions = latest ? [["Physical", latest.physical], ["Mental", latest.mental], ["Digestive", latest.digestive], ["Sleep", latest.sleep]] as const : [];

  return <PageContainer className="py-8"><div className="mx-auto max-w-4xl space-y-6">
    <header className="flex items-start justify-between gap-4"><div><h1 className="text-h1 font-display font-bold text-text-heading">My Progress</h1><p className="text-body text-text-muted">Your real wellness activity and saved assessments.</p></div><div className="rounded-xl border border-brand-gold/20 bg-brand-gold-pale px-4 py-2 text-body-sm font-semibold text-brand-gold">{streak} day streak</div></header>
    {loading ? <p className="text-body text-text-muted">Loading your progress…</p> : latest ? <section className="grid grid-cols-1 gap-6 rounded-2xl border border-border-default bg-surface-card p-6 md:grid-cols-[auto_1fr]"><ProgressRing value={latest.overall} variant="arogya" size={140} strokeWidth={12} sublabel="Overall wellness" animate /><div className="space-y-4"><h2 className="text-h4 font-semibold text-text-heading">Latest health dimensions</h2>{dimensions.map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between text-body-sm"><span>{label}</span><span className="font-semibold">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-border-default"><div className="h-full rounded-full bg-brand-burgundy" style={{ width: `${value}%` }} /></div></div>)}</div></section> : <section className="rounded-2xl border border-border-default bg-surface-card p-6"><h2 className="text-h4 font-semibold text-text-heading">No health score available yet</h2><p className="mt-2 text-body-sm text-text-muted">Complete an assessment to start tracking your progress.</p><Link href="/prakriti/quiz" className="mt-4 inline-block text-body-sm font-semibold text-brand-burgundy hover:underline">Complete Prakriti assessment →</Link></section>}
    <section className="rounded-2xl border border-border-default bg-surface-card p-6"><h2 className="text-h4 font-semibold text-text-heading">Recent Activity</h2>{activity.length === 0 ? <p className="mt-3 text-body-sm text-text-muted">Your recent activity will appear here as you use Arogyanvesha.</p> : <div className="mt-3 divide-y divide-border-default">{activity.map((entry) => <div key={entry.id} className="flex items-start justify-between gap-4 py-3"><div><p className="text-body-sm font-semibold text-text-heading">{entry.title}</p>{entry.description && <p className="text-label text-text-muted">{entry.description}</p>}</div><time className="shrink-0 text-label text-text-disabled">{formatRelativeTime(entry.completedAt)}</time></div>)}</div>}</section>
  </div></PageContainer>;
}
