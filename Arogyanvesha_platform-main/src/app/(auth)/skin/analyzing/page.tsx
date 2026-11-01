"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { generateId } from "@/lib/utils";

const STEPS = ["Detecting facial features…", "Analysing skin texture…", "Matching to Ayurvedic skin types…", "Generating recommendations…"];

export default function SkinAnalyzingPage() {
  const router = useRouter();
  const [visibleSteps, setVisibleSteps] = React.useState<number[]>([]);

  React.useEffect(() => {
    STEPS.forEach((_, i) => setTimeout(() => setVisibleSteps((p) => [...p, i]), i * 900));
    const t = setTimeout(() => router.push(`/skin/result/${generateId()}`), 4200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center max-w-sm px-6">

        {/* Scanning face icon */}
        <div className="relative w-40 h-40 mx-auto mb-10">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <ellipse cx="80" cy="80" rx="50" ry="65" stroke="var(--color-border-default)" strokeWidth="2" fill="var(--color-bg-subtle)"/>
            <motion.line x1="30" y1="20" x2="130" y2="20" stroke="var(--color-brand-gold)" strokeWidth="2"
              animate={{ y1: [20, 140, 20], y2: [20, 140, 20] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}/>
            <circle cx="62" cy="65" r="4" fill="var(--color-text-muted)" opacity="0.4"/>
            <circle cx="98" cy="65" r="4" fill="var(--color-text-muted)" opacity="0.4"/>
            <path d="M65 100 Q80 110 95 100" stroke="var(--color-text-muted)" strokeWidth="2" fill="none" opacity="0.4"/>
          </svg>
        </div>

        <h2 className="text-h2 font-display font-bold text-text-heading mb-3">Analysing Your Skin</h2>
        <p className="text-body text-text-muted mb-8">Our AI is matching your features to Ayurvedic skin profiles</p>

        <div className="flex flex-col gap-3 text-left">
          {STEPS.map((step, i) => (
            <motion.div key={i} className="flex items-center gap-3"
              initial={{ opacity: 0, x: -16 }}
              animate={visibleSteps.includes(i) ? { opacity: 1, x: 0 } : {}}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${visibleSteps.includes(i) ? "bg-brand-gold" : "bg-border-default"}`}>
                {visibleSteps.includes(i) && <div className="w-2 h-2 rounded-full bg-text-inverted"/>}
              </div>
              <p className="text-body-sm text-text-body">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}