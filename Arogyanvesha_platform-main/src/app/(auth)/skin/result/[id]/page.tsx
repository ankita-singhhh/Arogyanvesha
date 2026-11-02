"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/lib/api";

type Condition = { name?: string; severity?: "mild" | "moderate" | "high"; confidence?: number; description?: string };
type Analysis = { id: string; skin_type?: string | null; dominant_dosha?: string | null; score?: number | null; conditions?: Condition[]; recommendations?: string[]; analyzed_at?: string | null };

export default function SkinResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    api.get<Analysis>(`/skin/analyses/${id}`).then(({ data }) => setAnalysis(data)).catch((cause) => {
      setError(cause?.response?.status === 404 ? "This skin analysis was not found or is not available to your account." : "Unable to load this analysis. Please retry.");
    });
  }, [id]);

  if (error) return <PageContainer className="py-10 max-w-3xl mx-auto"><div className="rounded-2xl border border-status-error/20 bg-status-error-bg p-6"><h1 className="text-h3 font-semibold text-text-heading">Analysis unavailable</h1><p className="mt-2 text-body-sm text-status-error">{error}</p><Link className="mt-4 inline-block text-body-sm font-semibold text-brand-burgundy hover:underline" href="/skin">Back to skin analyses</Link></div></PageContainer>;
  if (!analysis) return <PageContainer className="py-10 max-w-3xl mx-auto"><p className="text-body text-text-muted">Loading your saved analysis…</p></PageContainer>;

  const conditions = Array.isArray(analysis.conditions) ? analysis.conditions : [];
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  return <PageContainer className="py-8 max-w-3xl mx-auto"><div className="space-y-6">
    <button type="button" onClick={() => router.push("/skin")} className="text-body-sm text-text-muted hover:text-text-body">← Back to history</button>
    <section className="rounded-2xl border border-status-info/20 bg-status-info-bg p-7"><Badge variant="info" size="md">Saved wellness observation</Badge><h1 className="mt-3 text-h1 font-display font-bold text-text-heading">{analysis.skin_type ?? "Skin analysis"}</h1><p className="mt-2 text-body text-text-muted">{analysis.dominant_dosha ? `Dominant dosha observation: ${analysis.dominant_dosha}. ` : ""}AI-generated observations are not a medical diagnosis.</p>{typeof analysis.score === "number" && <p className="mt-4 text-body-sm font-semibold text-text-heading">Wellness score: {analysis.score}/100</p>}</section>
    <section className="rounded-2xl border border-border-default bg-surface-card p-6"><h2 className="text-h4 font-semibold text-text-heading">Observed conditions</h2>{conditions.length ? <div className="mt-4 space-y-3">{conditions.map((condition, index) => <div key={`${condition.name ?? "condition"}-${index}`} className="rounded-xl bg-bg-subtle p-4"><div className="flex items-center gap-2"><p className="text-body-sm font-semibold text-text-heading">{condition.name ?? "Observation"}</p>{condition.severity && <Badge variant="warning" size="sm">{condition.severity}</Badge>}</div>{condition.description && <p className="mt-1 text-label text-text-muted">{condition.description}</p>}{typeof condition.confidence === "number" && <p className="mt-2 text-micro text-text-disabled">{Math.round(condition.confidence * 100)}% confidence</p>}</div>)}</div> : <p className="mt-3 text-body-sm text-text-muted">No specific conditions were returned by the analysis.</p>}</section>
    <section className="rounded-2xl border border-brand-gold/20 bg-brand-gold-pale p-6"><h2 className="text-h4 font-semibold text-text-heading">Recommendations</h2>{recommendations.length ? <ul className="mt-4 space-y-2">{recommendations.map((recommendation, index) => <li key={`${recommendation}-${index}`} className="text-body-sm text-text-body">• {recommendation}</li>)}</ul> : <p className="mt-3 text-body-sm text-text-muted">No recommendations were returned by the analysis.</p>}</section>
    <Button variant="primary" onClick={() => router.push("/chat")} className="bg-gradient-burgundy border-0 shadow-burgundy">Ask AI Vaidya about my skin</Button>
  </div></PageContainer>;
}
