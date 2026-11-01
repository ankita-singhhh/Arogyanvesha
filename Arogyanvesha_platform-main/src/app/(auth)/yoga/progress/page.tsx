"use client";
import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
type Completion = { duration_actual_minutes?: number | null; completed_at: string };
type YogaProgress = { totalSessions: number; totalMinutes: number; completions: Completion[] };
export default function YogaProgressPage() {
 const [progress,setProgress]=React.useState<YogaProgress|null>(null); const [error,setError]=React.useState<string|null>(null);
 React.useEffect(()=>{let cancelled=false;api.get<YogaProgress>("/yoga/progress").then(({data})=>!cancelled&&setProgress(data)).catch(()=>!cancelled&&setError("Your yoga progress is temporarily unavailable."));return()=>{cancelled=true};},[]);
 return <PageContainer className="py-8"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><h1 className="text-h1 font-display font-bold text-text-heading">Yoga Progress</h1><Link href="/yoga" className="text-body-sm font-semibold text-brand-burgundy">Browse sessions →</Link></div>{!progress&&!error?<p className="mt-8 text-text-muted">Loading your yoga progress…</p>:error?<p className="mt-8 text-status-error">{error}</p>:progress?.totalSessions===0?<div className="mt-8"><EmptyState variant="generic" title="No completed sessions yet" description="Sessions you mark complete will appear here."/></div>:<><div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-xl border border-border-default bg-surface-card p-5"><p className="text-label text-text-muted">Completed sessions</p><p className="mt-1 text-h2 font-bold text-text-heading">{progress?.totalSessions}</p></div><div className="rounded-xl border border-border-default bg-surface-card p-5"><p className="text-label text-text-muted">Recorded minutes</p><p className="mt-1 text-h2 font-bold text-text-heading">{progress?.totalMinutes}</p></div></div><section className="mt-8"><h2 className="text-h4 font-semibold text-text-heading">Recent sessions</h2><div className="mt-3 space-y-3">{progress?.completions.slice(0,10).map((completion,index)=><div key={`${completion.completed_at}-${index}`} className="rounded-xl border border-border-default bg-surface-card p-4"><p className="font-semibold text-text-heading">Completed {formatDate(completion.completed_at)}</p>{typeof completion.duration_actual_minutes==="number"&&<p className="mt-1 text-body-sm text-text-muted">{completion.duration_actual_minutes} recorded minutes</p>}</div>)}</div></section></>}</div></PageContainer>;
}
