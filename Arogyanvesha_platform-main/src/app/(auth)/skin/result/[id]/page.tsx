"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";

const ATTRIBUTES = [
  { label: "Hydration", score: 68, color: "var(--color-status-info)" },
  { label: "Oil Balance", score: 45, color: "var(--color-dosha-pitta)" },
  { label: "Elasticity", score: 80, color: "var(--color-status-success)" },
  { label: "Sensitivity", score: 60, color: "var(--color-dosha-vata)" },
];

const CONDITIONS = [
  { name: "Mild dryness", severity: "mild" as const, confidence: 0.84, description: "Slight dehydration in T-zone, common in Pitta-Vata types" },
  { name: "Sensitivity",  severity: "mild" as const, confidence: 0.71, description: "Mild reactivity to environmental factors" },
];

export default function SkinResultPage() {

  const router = useRouter();

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

        <button type="button" onClick={() => router.push("/skin")} className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
          </svg>
          Back
        </button>

        {/* Skin type hero */}
        <div className="p-7 rounded-2xl border border-status-info/20" style={{ background: "linear-gradient(135deg, var(--color-status-info-bg) 0%, var(--color-surface-card) 100%)" }}>
          <Badge variant="info" size="md" className="mb-3">Your Skin Type</Badge>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-2">Pitta-Vata Skin</h1>
          <p className="text-body text-text-muted leading-relaxed max-w-xl">
            Your skin shows characteristics of both Pitta (sensitivity, occasional redness) and Vata (dryness, fine texture).
            This combination needs both cooling and moisturising care.
          </p>
        </div>

        {/* Attribute grid */}
        <div className="grid grid-cols-2 gap-4">
          {ATTRIBUTES.map((attr, i) => (
            <div key={attr.label} className="p-5 rounded-xl bg-surface-card border border-border-default">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-medium text-text-heading">{attr.label}</span>
                <span className="text-body-sm font-bold" style={{ color: attr.color }}>{attr.score}%</span>
              </div>
              <div className="h-2 bg-border-default rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: attr.color }}
                  initial={{ width: 0 }} animate={{ width: `${attr.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <div className="p-6 rounded-xl bg-surface-card border border-border-default">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Detected Conditions</h3>
          <div className="flex flex-col gap-3">
            {CONDITIONS.map((c) => (
              <div key={c.name} className="flex items-start gap-3 p-3 rounded-lg bg-bg-subtle">
                <Badge variant="warning" size="sm" className="capitalize shrink-0">{c.severity}</Badge>
                <div className="flex-1">
                  <p className="text-body-sm font-semibold text-text-heading">{c.name}</p>
                  <p className="text-label text-text-muted">{c.description}</p>
                </div>
                <span className="text-micro text-text-disabled shrink-0">{Math.round(c.confidence*100)}% confidence</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-6 rounded-xl bg-brand-gold-pale border border-brand-gold/20">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Recommended Routine</h3>
          <ul className="flex flex-col gap-2.5">
            {["Use a gentle, sulfate-free cleanser morning and night", "Apply rosewater toner to cool and balance Pitta", "Moisturise with sesame or almond oil to combat Vata dryness", "Use SPF 30+ daily to protect sensitive Pitta skin", "Avoid hot showers — use lukewarm water instead"].map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-body-sm text-text-body">
                <svg className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                </svg>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" onClick={() => router.push("/chat")} className="bg-gradient-burgundy border-0 shadow-burgundy">
            Ask AI Vaidya about my skin
          </Button>
          <Button variant="ghost" onClick={() => router.push("/skin/history")}>View history</Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}