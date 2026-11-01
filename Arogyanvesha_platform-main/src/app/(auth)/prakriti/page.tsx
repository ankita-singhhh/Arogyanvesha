"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks";
import { usePrakritiStore } from "@/stores";
import { api } from "@/lib/api";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/* ─────────────────────────────────────────────────────────
   DOSHA WHEEL SVG
───────────────────────────────────────────────────────── */

function DoshaWheel({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <div className="relative w-72 h-72 mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
        {/* Outer ring */}
        <motion.circle
          cx="150" cy="150" r="130"
          stroke="var(--color-border-default)"
          strokeWidth="1.5"
          animate={shouldReduce ? {} : { rotate: 360 }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
          style={{ transformOrigin: "150px 150px" }}
        />

        {/* Vata segment — top */}
        <motion.path
          d="M150 150 L150 30 A120 120 0 0 1 253.9 90 Z"
          fill="var(--color-dosha-vata)"
          opacity="0.15"
          whileHover={{ opacity: 0.3 }}
        />
        <motion.path
          d="M150 150 L150 30 A120 120 0 0 1 253.9 90 Z"
          stroke="var(--color-dosha-vata)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        />

        {/* Pitta segment — bottom right */}
        <motion.path
          d="M150 150 L253.9 90 A120 120 0 0 1 253.9 210 Z"
          fill="var(--color-dosha-pitta)"
          opacity="0.15"
          whileHover={{ opacity: 0.3 }}
        />
        <motion.path
          d="M150 150 L253.9 90 A120 120 0 0 1 253.9 210 Z"
          stroke="var(--color-dosha-pitta)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Kapha segment — bottom left */}
        <motion.path
          d="M150 150 L253.9 210 A120 120 0 0 1 46.1 210 Z"
          fill="var(--color-dosha-kapha)"
          opacity="0.15"
          whileHover={{ opacity: 0.3 }}
        />
        <motion.path
          d="M150 150 L253.9 210 A120 120 0 0 1 46.1 210 Z"
          stroke="var(--color-dosha-kapha)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />

        {/* Remaining Vata segment */}
        <motion.path
          d="M150 150 L46.1 210 A120 120 0 0 1 150 30 Z"
          fill="var(--color-dosha-vata)"
          opacity="0.08"
        />

        {/* Center circle */}
        <motion.circle
          cx="150" cy="150" r="50"
          fill="var(--color-surface-card)"
          stroke="var(--color-border-gold)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2, type: "spring" }}
          style={{ transformOrigin: "150px 150px" }}
        />
        <motion.text
          x="150" y="145"
          textAnchor="middle"
          fill="var(--color-brand-gold)"
          fontSize="11"
          fontWeight="600"
          fontFamily="var(--font-body)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          YOUR
        </motion.text>
        <motion.text
          x="150" y="162"
          textAnchor="middle"
          fill="var(--color-text-heading)"
          fontSize="13"
          fontWeight="700"
          fontFamily="var(--font-display)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          PRAKRITI
        </motion.text>

        {/* Dosha labels */}
        <motion.text x="150" y="18" textAnchor="middle" fill="var(--color-dosha-vata)"
          fontSize="13" fontWeight="700" fontFamily="var(--font-body)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          VATA
        </motion.text>
        <motion.text x="268" y="155" textAnchor="start" fill="var(--color-dosha-pitta)"
          fontSize="13" fontWeight="700" fontFamily="var(--font-body)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
          PITTA
        </motion.text>
        <motion.text x="150" y="290" textAnchor="middle" fill="var(--color-dosha-kapha)"
          fontSize="13" fontWeight="700" fontFamily="var(--font-body)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>
          KAPHA
        </motion.text>

        {/* Pulse rings */}
        {!shouldReduce && (
          <>
            <motion.circle cx="150" cy="150" r="50" stroke="var(--color-brand-gold)"
              strokeWidth="1" fill="none"
              animate={{ r: [50, 90], opacity: [0.5, 0] }}
              transition={{ duration: 3, ease: "easeOut", repeat: Infinity }}
            />
            <motion.circle cx="150" cy="150" r="50" stroke="var(--color-brand-gold)"
              strokeWidth="0.5" fill="none"
              animate={{ r: [50, 110], opacity: [0.3, 0] }}
              transition={{ duration: 3, ease: "easeOut", repeat: Infinity, delay: 1.5 }}
            />
          </>
        )}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

const BENEFITS = [
  { icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", label: "Personalized AI recommendations" },
  { icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25", label: "Tailored diet and lifestyle guidance" },
  { icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z", label: "Custom yoga and meditation plan" },
  { icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18", label: "Herb recommendations for your type" },
  { icon: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z", label: "Skin analysis aligned to your Dosha" },
];

const DOSHA_INFO = [
  { name: "Vata", element: "Air & Space", traits: "Creative, energetic, quick-thinking", color: "var(--color-dosha-vata)", bg: "var(--color-dosha-vata-bg)" },
  { name: "Pitta", element: "Fire & Water", traits: "Driven, focused, transformative", color: "var(--color-dosha-pitta)", bg: "var(--color-dosha-pitta-bg)" },
  { name: "Kapha", element: "Earth & Water", traits: "Calm, stable, nurturing", color: "var(--color-dosha-kapha)", bg: "var(--color-dosha-kapha-bg)" },
];

export default function PrakritiIntroPage() {
  const shouldReduce = useReducedMotion();
  const { result, status, setResult } = usePrakritiStore();

  React.useEffect(() => {
    let cancelled = false;
    if (!result) {
      api.get("/prakriti/result")
        .then((res) => {
          if (!cancelled && res.data) {
            setResult(res.data);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [result, setResult]);

  const hasResult = !!result;
  const inProgress = status === "in-progress";

  return (
    <PageContainer className="py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <Badge variant="gold" size="md" className="mb-4">
            Ayurvedic Assessment
          </Badge>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-4">
            Discover Your Prakriti
          </h1>
          <p className="text-body-lg text-text-muted max-w-xl mx-auto leading-relaxed">
            Your Prakriti is your unique mind-body constitution — the blueprint of
            who you are. Understanding it unlocks truly personalized Ayurvedic guidance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          {/* Dosha Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            <DoshaWheel shouldReduce={shouldReduce} />
          </motion.div>

          {/* Benefits */}
          <motion.div className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            <h2 className="text-h3 font-semibold text-text-heading mb-2">
              What you&apos;ll discover
            </h2>
            {BENEFITS.map((benefit, i) => (
              <motion.div key={benefit.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}>
                <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-4.5 h-4.5 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon}/>
                  </svg>
                </div>
                <span className="text-body text-text-body font-medium">{benefit.label}</span>
              </motion.div>
            ))}

            <div className="mt-6 p-4 rounded-xl bg-brand-gold-pale border border-brand-gold/20">
              <p className="text-body-sm text-text-muted">
                <span className="font-semibold text-text-heading">Takes 5–8 minutes</span> · 20 questions ·
                Validated by Ayurvedic practitioners · Based on Charaka Samhita
              </p>
            </div>
          </motion.div>
        </div>

        {/* Dosha cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}>
          {DOSHA_INFO.map((dosha) => (
            <div key={dosha.name}
              className="p-5 rounded-xl border border-border-default bg-surface-card hover:shadow-md transition-shadow"
              style={{ borderTopWidth: "3px", borderTopColor: dosha.color }}>
              <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                style={{ background: dosha.bg }}>
                <span className="font-bold text-body-sm" style={{ color: dosha.color }}>
                  {dosha.name[0]}
                </span>
              </div>
              <h3 className="text-h4 font-bold text-text-heading mb-1">{dosha.name}</h3>
              <p className="text-label font-medium mb-2" style={{ color: dosha.color }}>{dosha.element}</p>
              <p className="text-body-sm text-text-muted">{dosha.traits}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}>
          {hasResult ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/prakriti/result">
                <Button variant="primary" size="lg">View my Prakriti result</Button>
              </Link>
              <Link href="/prakriti/history">
                <Button variant="secondary" size="lg">Assessment history</Button>
              </Link>
            </div>
          ) : inProgress ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/prakriti/quiz">
                <Button variant="primary" size="lg">Continue assessment</Button>
              </Link>
              <p className="text-body-sm text-text-muted self-center">
                Your progress has been saved
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Link href="/prakriti/quiz">
                <Button variant="primary" size="xl"
                  className="bg-gradient-burgundy border-0 shadow-burgundy hover:shadow-xl hover:-translate-y-1 transition-all duration-250">
                  Begin Prakriti Assessment
                </Button>
              </Link>
              <p className="text-body-sm text-text-muted">Free · No credit card · Takes 5 minutes</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}