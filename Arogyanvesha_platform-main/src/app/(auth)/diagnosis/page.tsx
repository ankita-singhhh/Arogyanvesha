"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";

const DIAGNOSIS_TYPES = [
  {
    type: "tongue",
    title: "Tongue Diagnosis",
    sanskrit: "Jihva Pariksha",
    description:
      "Examine your tongue coating, color, and texture to detect Ama (toxin) accumulation and dosha imbalances affecting your digestive fire (Agni).",
    tips: ["Stick out your tongue fully", "Use natural or bright light", "Take photo immediately after waking — before eating or drinking"],
    icon: (
      <svg className="w-10 h-10 text-brand-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-1.5 0-5.5 1-5.5 5 0 2.5.5 4.5 1.5 6C9 17.5 10.5 19.5 12 19.5s3-2 4-4c1-1.5 1.5-3.5 1.5-6 0-4-4-5-5.5-5z" />
      </svg>
    ),
    color: "bg-rose-50 border-rose-200",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    type: "eye",
    title: "Eye Diagnosis",
    sanskrit: "Netra Pariksha",
    description:
      "Analyze your sclera, iris clarity, puffiness, and under-eye coloring to reveal liver health, sleep quality, and Pitta or Kapha imbalances.",
    tips: ["Look directly into the camera", "Ensure bright, even lighting", "Remove contact lenses before capture"],
    icon: (
      <svg className="w-10 h-10 text-brand-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
  },
];

export default function DiagnosisHubPage() {
  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">AI Body Diagnosis</h1>
          <p className="text-body text-text-muted">
            Traditional Ayurvedic inspection (Pariksha) powered by Claude Vision AI
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-status-warning-bg border border-status-warning/20">
          <p className="text-body-sm text-text-body">
            ⚕️ These tools provide Ayurvedic educational insights only — not medical diagnosis. Consult a licensed practitioner for health concerns.
          </p>
        </div>

        {/* Diagnosis cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {DIAGNOSIS_TYPES.map((d) => (
            <motion.div
              key={d.type}
              className={`flex flex-col gap-5 p-6 rounded-2xl border-2 ${d.color}`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Icon + title */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  {d.icon}
                </div>
                <div>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1 ${d.badgeColor}`}>
                    {d.sanskrit}
                  </span>
                  <h2 className="text-h3 font-bold text-text-heading">{d.title}</h2>
                </div>
              </div>

              <p className="text-body-sm text-text-muted leading-relaxed">{d.description}</p>

              {/* Tips */}
              <ul className="flex flex-col gap-1.5">
                {d.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-label text-text-body">
                    <svg className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>

              <Link href={`/diagnosis/capture/${d.type}`} className="mt-auto">
                <Button variant="primary" className="w-full bg-gradient-burgundy border-0 shadow-burgundy">
                  Start {d.title}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <div className="p-6 rounded-2xl bg-surface-card border border-border-default">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">How it works</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: "1", label: "Capture", desc: "Take a close-up photo or upload from gallery" },
              { step: "2", label: "AI Analysis", desc: "Claude Vision reads Ayurvedic diagnostic markers" },
              { step: "3", label: "Results", desc: "Get dosha insights, herbs & diet recommendations" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-2">
                <div className="w-9 h-9 rounded-full bg-brand-burgundy text-white flex items-center justify-center text-sm font-bold">
                  {s.step}
                </div>
                <p className="text-body-sm font-semibold text-text-heading">{s.label}</p>
                <p className="text-label text-text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </PageContainer>
  );
}
