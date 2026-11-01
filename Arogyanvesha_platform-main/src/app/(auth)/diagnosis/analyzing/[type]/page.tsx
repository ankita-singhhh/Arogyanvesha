"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const STEPS_MAP = {
  tongue: [
    "Detecting tongue surface…",
    "Analysing coating color and thickness…",
    "Reading Ayurvedic Jihva markers…",
    "Assessing Agni (digestive fire) state…",
    "Generating dosha recommendations…",
  ],
  eye: [
    "Detecting eye structure…",
    "Analysing sclera and iris coloring…",
    "Reading Ayurvedic Netra markers…",
    "Assessing Pitta and Kapha signals…",
    "Generating dosha recommendations…",
  ],
  skin: [
    "Detecting face and skin area…",
    "Analysing tone, texture and oiliness…",
    "Reading Ayurvedic Twak markers…",
    "Assessing Vata, Pitta and Kapha signals…",
    "Generating dosha recommendations…",
  ],
};

const COPY = {
  tongue: { noun: "Tongue", reading: "Jihva (tongue)" },
  eye: { noun: "Eye", reading: "Netra (eye)" },
  skin: { noun: "Skin", reading: "Twak (skin)" },
} as const;

type DiagType = keyof typeof STEPS_MAP;

function isDiagType(value: string): value is DiagType {
  return value in STEPS_MAP;
}

const SCAN_TRANSITION = {
  duration: 2.2,
  repeat: Infinity,
  ease: "easeInOut",
} as const;

export default function DiagnosisAnalyzingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawType = params.type as string;
  const diagType: DiagType = isDiagType(rawType) ? rawType : "tongue";
  const resultId = searchParams.get("id") ?? "";

  const steps = STEPS_MAP[diagType];
  const copy = COPY[diagType];

  const [visibleSteps, setVisibleSteps] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!resultId) {
      setError("Missing diagnosis result ID. Please try the analysis again.");
      return;
    }

    const timers = steps.map((_, i) =>
      window.setTimeout(() => {
        setVisibleSteps((previous) =>
          previous.includes(i) ? previous : [...previous, i],
        );
      }, i * 800),
    );

    const done = window.setTimeout(() => {
      const storedResult = sessionStorage.getItem(
        `diagnosis_${diagType}_${resultId}`,
      );

      if (!storedResult) {
        setError("The analysis result could not be found. Please try again.");
        return;
      }

      try {
        JSON.parse(storedResult);
        router.replace(`/diagnosis/result/${diagType}?id=${resultId}`);
      } catch {
        setError("The analysis result is invalid. Please try again.");
      }
    }, steps.length * 800 + 600);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [router, diagType, resultId, steps]);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <div className="relative w-36 h-36 mx-auto mb-10">
          {diagType === "tongue" && (
            <svg viewBox="0 0 160 160" className="w-full h-full">
              <ellipse
                cx="80"
                cy="100"
                rx="40"
                ry="35"
                stroke="var(--color-border-default)"
                strokeWidth="2"
                fill="var(--color-bg-subtle)"
              />
              <path
                d="M50 80 Q80 60 110 80"
                stroke="var(--color-border-default)"
                strokeWidth="2"
                fill="none"
              />
              <motion.line
                x1="40"
                y1="55"
                x2="120"
                y2="55"
                stroke="var(--color-brand-gold)"
                strokeWidth="2"
                animate={{ y1: [55, 135, 55], y2: [55, 135, 55] }}
                transition={SCAN_TRANSITION}
              />
            </svg>
          )}

          {diagType === "eye" && (
            <svg viewBox="0 0 160 160" className="w-full h-full">
              <ellipse
                cx="80"
                cy="80"
                rx="60"
                ry="38"
                stroke="var(--color-border-default)"
                strokeWidth="2"
                fill="var(--color-bg-subtle)"
              />
              <circle
                cx="80"
                cy="80"
                r="18"
                stroke="var(--color-border-default)"
                strokeWidth="2"
                fill="var(--color-bg-subtle)"
              />
              <circle
                cx="80"
                cy="80"
                r="7"
                fill="var(--color-text-muted)"
                opacity="0.4"
              />
              <motion.line
                x1="20"
                y1="42"
                x2="140"
                y2="42"
                stroke="var(--color-brand-gold)"
                strokeWidth="2"
                animate={{ y1: [42, 118, 42], y2: [42, 118, 42] }}
                transition={SCAN_TRANSITION}
              />
            </svg>
          )}

          {diagType === "skin" && (
            <svg viewBox="0 0 160 160" className="w-full h-full">
              <ellipse
                cx="80"
                cy="80"
                rx="46"
                ry="62"
                stroke="var(--color-border-default)"
                strokeWidth="2"
                fill="var(--color-bg-subtle)"
              />
              <circle
                cx="63"
                cy="70"
                r="4"
                fill="var(--color-text-muted)"
                opacity="0.4"
              />
              <circle
                cx="97"
                cy="70"
                r="4"
                fill="var(--color-text-muted)"
                opacity="0.4"
              />
              <path
                d="M66 102 Q80 112 94 102"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              <motion.line
                x1="26"
                y1="30"
                x2="134"
                y2="30"
                stroke="var(--color-brand-gold)"
                strokeWidth="2"
                animate={{ y1: [30, 130, 30], y2: [30, 130, 30] }}
                transition={SCAN_TRANSITION}
              />
            </svg>
          )}
        </div>

        <h2 className="text-h2 font-display font-bold text-text-heading mb-2">
          Analysing Your {copy.noun}
        </h2>

        <p className="text-body text-text-muted mb-8">
          AI Vaidya is reading your {copy.reading} markers
        </p>

        <div className="flex flex-col gap-3 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -16 }}
              animate={
                visibleSteps.includes(i)
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -16 }
              }
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  visibleSteps.includes(i)
                    ? "bg-brand-gold"
                    : "bg-border-default"
                }`}
              >
                {visibleSteps.includes(i) && (
                  <div className="w-2 h-2 rounded-full bg-text-inverted" />
                )}
              </div>
              <p className="text-body-sm text-text-body">{step}</p>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-6">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => router.replace(`/diagnosis/capture/${diagType}`)}
              className="px-4 py-2 rounded-lg bg-brand-gold text-white font-semibold"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
