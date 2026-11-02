"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { usePrakritiStore } from "@/stores";
import { webApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { RouteLoading } from "@/components/ui/RouteLoading";
import type { Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   DOSHA CONTENT MAP
───────────────────────────────────────────────────────── */

const DOSHA_CONTENT: Record<
  Dosha,
  {
    element: string;
    qualities: string[];
    strengths: string[];
    challenges: string[];
    diet: string[];
    yoga: string[];
    herbs: string[];
    season: string;
    color: string;
    bg: string;
    description: string;
  }
> = {
  vata: {
    element: "Air & Space",
    description:
      "Vata types are creative, quick-thinking, and energetic when in balance. You thrive on change and new experiences, with a natural gift for communication and artistry.",
    qualities: ["Light", "Dry", "Cold", "Mobile", "Subtle"],
    strengths: [
      "Creative thinking",
      "Adaptability",
      "Quick learning",
      "Enthusiasm",
      "Spiritual sensitivity",
    ],
    challenges: [
      "Anxiety and worry",
      "Irregular digestion",
      "Cold sensitivity",
      "Difficulty with routine",
      "Sleep disturbances",
    ],
    diet: [
      "Warm, moist, oily foods",
      "Sweet, sour, and salty tastes",
      "Ghee, sesame oil",
      "Root vegetables",
      "Warm herbal teas",
    ],
    yoga: [
      "Gentle Hatha yoga",
      "Restorative poses",
      "Slow Vinyasa",
      "Pranayama breathing",
      "Yoga Nidra",
    ],
    herbs: ["Ashwagandha", "Shatavari", "Triphala", "Brahmi", "Bala"],
    season: "Autumn & Early Winter",
    color: "var(--color-dosha-vata)",
    bg: "var(--color-dosha-vata-bg)",
  },
  pitta: {
    element: "Fire & Water",
    description:
      "Pitta types are driven, focused, and transformative. You have natural leadership qualities, strong digestion, and an analytical mind that excels at problem-solving.",
    qualities: ["Hot", "Sharp", "Light", "Oily", "Intense"],
    strengths: [
      "Leadership",
      "Focus and determination",
      "Strong digestion",
      "Intelligence",
      "Courage",
    ],
    challenges: [
      "Anger and irritability",
      "Inflammation",
      "Overheating",
      "Perfectionism",
      "Competitive excess",
    ],
    diet: [
      "Cool, sweet, bitter foods",
      "Coconut, cucumber, leafy greens",
      "Avoid spicy and fried foods",
      "Fresh fruits",
      "Cooling spices like coriander",
    ],
    yoga: [
      "Moon salutations",
      "Forward bends",
      "Cooling Pranayama",
      "Sitali breath",
      "Twists and releases",
    ],
    herbs: ["Amalaki", "Shatavari", "Guduchi", "Neem", "Coriander"],
    season: "Summer & Late Spring",
    color: "var(--color-dosha-pitta)",
    bg: "var(--color-dosha-pitta-bg)",
  },
  kapha: {
    element: "Earth & Water",
    description:
      "Kapha types are stable, nurturing, and deeply caring. You possess natural endurance, excellent memory, and a calm presence that brings comfort to those around you.",
    qualities: ["Heavy", "Slow", "Cool", "Oily", "Stable"],
    strengths: [
      "Endurance and stamina",
      "Compassion and loyalty",
      "Excellent memory",
      "Stability",
      "Patience",
    ],
    challenges: [
      "Weight management",
      "Sluggish metabolism",
      "Attachment",
      "Lethargy",
      "Depression tendency",
    ],
    diet: [
      "Light, dry, spicy foods",
      "Pungent, bitter, astringent tastes",
      "Avoid heavy dairy and sweets",
      "Legumes and vegetables",
      "Ginger and black pepper",
    ],
    yoga: [
      "Dynamic Vinyasa",
      "Sun salutations",
      "Backbends",
      "Kapalabhati breathing",
      "Vigorous Ashtanga",
    ],
    herbs: ["Trikatu", "Guggulu", "Tulsi", "Punarnava", "Ginger"],
    season: "Late Winter & Spring",
    color: "var(--color-dosha-kapha)",
    bg: "var(--color-dosha-kapha-bg)",
  },
};

/* ─────────────────────────────────────────────────────────
   DOSHA BALANCE PIE CHART
───────────────────────────────────────────────────────── */

function DoshaBalanceChart({
  balance,
}: {
  balance: { vata: number; pitta: number; kapha: number };
}) {
  const total = balance.vata + balance.pitta + balance.kapha;

  const safeTotal = total > 0 ? total : 1;
  const vataAngle = (balance.vata / safeTotal) * 360;
  const pittaAngle = (balance.pitta / safeTotal) * 360;
  const kaphaAngle = (balance.kapha / safeTotal) * 360;

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angle: number
  ) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    if (endAngle - startAngle >= 359.999) {
      return [
        `M ${cx} ${cy - r}`,
        `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
        `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`,
        "Z",
      ].join(" ");
    }

    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const segments = [
    {
      dosha: "vata" as Dosha,
      angle: vataAngle,
      start: 0,
      color: "var(--color-dosha-vata)",
      value: balance.vata,
    },
    {
      dosha: "pitta" as Dosha,
      angle: pittaAngle,
      start: vataAngle,
      color: "var(--color-dosha-pitta)",
      value: balance.pitta,
    },
    {
      dosha: "kapha" as Dosha,
      angle: kaphaAngle,
      start: vataAngle + pittaAngle,
      color: "var(--color-dosha-kapha)",
      value: balance.kapha,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {segments.map((seg, i) => (
            <motion.path
              key={seg.dosha}
              d={describeArc(100, 100, 85, seg.start, seg.start + seg.angle)}
              fill={seg.color}
              opacity="0.85"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{
                duration: 0.6,
                delay: i * 0.2,
                type: "spring",
              }}
              style={{ transformOrigin: "100px 100px" }}
            />
          ))}

          <circle
            cx="100"
            cy="100"
            r="45"
            fill="var(--color-surface-card)"
          />

          <text
            x="100"
            y="96"
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="8"
            fontFamily="var(--font-body)"
            fontWeight="500"
          >
            YOUR
          </text>

          <text
            x="100"
            y="108"
            textAnchor="middle"
            fill="var(--color-text-heading)"
            fontSize="10"
            fontFamily="var(--font-display)"
            fontWeight="700"
          >
            PRAKRITI
          </text>
        </svg>
      </div>

      <div className="flex gap-6">
        {segments.map((seg) => (
          <div
            key={seg.dosha}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: seg.color }}
              />
              <span className="text-label font-semibold text-text-muted capitalize">
                {seg.dosha}
              </span>
            </div>
            <span className="text-h4 font-bold text-text-heading">
              {seg.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function PrakritiResultPage() {
  const { result, setResult } = usePrakritiStore();
  const [isLoading, setIsLoading] = React.useState(!result);

  React.useEffect(() => {
    let cancelled = false;

    if (!result) {
      webApi
        .get("/api/prakriti/result")
        .then((res) => {
          if (cancelled) return;

          if (res.data) {
            setResult(res.data);
          }

          setIsLoading(false);
        })
        .catch((error) => {
          if (cancelled) return;

          console.error("Failed to load Prakriti result:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [result, setResult]);

  if (isLoading) {
    return <RouteLoading />;
  }

  if (!result) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          variant="no-prakriti"
          title="No Prakriti result found"
          description="Complete the assessment to discover your unique constitution."
          action={
            <Link href="/prakriti/quiz">
              <Button variant="primary">Take the assessment</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const primaryContent = DOSHA_CONTENT[result.primaryDosha];
  const secondaryContent = DOSHA_CONTENT[result.secondaryDosha];

  if (!primaryContent || !secondaryContent) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          variant="no-prakriti"
          title="Invalid Prakriti result"
          description="Your stored result could not be displayed. Please retake the assessment."
          action={
            <Link href="/prakriti/quiz">
              <Button variant="primary">Retake assessment</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <PageContainer className="py-10">
      <motion.div
        className="flex flex-col gap-10"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Hero result card */}
        <motion.div
          variants={fadeUp}
          className="relative rounded-2xl overflow-hidden p-8 lg:p-10"
          style={{
            background: `linear-gradient(135deg, ${primaryContent.bg} 0%, var(--color-surface-card) 100%)`,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <Badge variant="gold" size="md" className="mb-4">
                Your Prakriti Result
              </Badge>

              <h1 className="text-h1 font-display font-bold text-text-heading mb-2">
                <span style={{ color: primaryContent.color }}>
                  {result.primaryDosha.charAt(0).toUpperCase() +
                    result.primaryDosha.slice(1)}
                </span>
                {" - "}
                <span style={{ color: secondaryContent.color }}>
                  {result.secondaryDosha.charAt(0).toUpperCase() +
                    result.secondaryDosha.slice(1)}
                </span>
              </h1>

              <p className="text-label font-semibold text-text-muted mb-4 uppercase tracking-wider">
                {primaryContent.element} · {secondaryContent.element}
              </p>

              <p className="text-body-lg text-text-body leading-relaxed max-w-lg">
                {primaryContent.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {primaryContent.qualities.map((quality) => (
                  <span
                    key={quality}
                    className="px-3 py-1 rounded-pill text-body-sm font-medium border"
                    style={{
                      background: primaryContent.bg,
                      color: primaryContent.color,
                      borderColor: `${primaryContent.color}33`,
                    }}
                  >
                    {quality}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <DoshaBalanceChart balance={result.balance} />
            </div>
          </div>

          {/* Completed date */}
          <div className="mt-6 pt-6 border-t border-border-default flex items-center justify-between gap-4 flex-wrap">
            <p className="text-body-sm text-text-muted">
              Assessment completed{" "}
              {new Date(result.completedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="flex gap-3">
              <Link href="/prakriti/history">
                <Button variant="ghost" size="sm">
                  View history
                </Button>
              </Link>

              <Link href="/chat">
                <Button variant="primary" size="sm">
                  Chat with AI Vaidya
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Strengths & Challenges */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Strengths */}
          <div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-status-success"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-h4 font-semibold text-text-heading">
                Your Strengths
              </h3>
            </div>

            <ul className="flex flex-col gap-3">
              {primaryContent.strengths.map((strength) => (
                <li
                  key={strength}
                  className="flex items-center gap-2.5 text-body-sm text-text-body"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: primaryContent.color }}
                  />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-status-warning-bg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-status-warning"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-h4 font-semibold text-text-heading">
                Areas to Balance
              </h3>
            </div>

            <ul className="flex flex-col gap-3">
              {primaryContent.challenges.map((challenge) => (
                <li
                  key={challenge}
                  className="flex items-center gap-2.5 text-body-sm text-text-body"
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-status-warning" />
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={fadeUp}>
          <h2 className="text-h2 font-display font-bold text-text-heading mb-6">
            Your Personalised Recommendations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Diet & Nutrition",
                items: primaryContent.diet,
                icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
                color: "text-brand-gold",
                bg: "bg-brand-gold-pale",
              },
              {
                title: "Yoga Practice",
                items: primaryContent.yoga,
                icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
                color: "text-sage",
                bg: "bg-sage-bg",
              },
              {
                title: "Recommended Herbs",
                items: primaryContent.herbs,
                icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
                color: "text-dosha-kapha",
                bg: "bg-dosha-kapha-bg",
              },
            ].map((section) => (
              <div
                key={section.title}
                className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      section.bg
                    )}
                  >
                    <svg
                      className={cn("w-5 h-5", section.color)}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={section.icon}
                      />
                    </svg>
                  </div>

                  <h3 className="text-h4 font-semibold text-text-heading">
                    {section.title}
                  </h3>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-body-sm text-text-body"
                    >
                      <svg
                        className="w-4 h-4 text-status-success shrink-0 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Seasonal guide */}
        <motion.div
          variants={fadeUp}
          className="p-6 rounded-xl border border-border-gold/30"
          style={{ background: "var(--color-brand-gold-pale)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <svg
              className="w-5 h-5 text-brand-gold"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>

            <h3 className="text-h4 font-semibold text-text-heading">
              Seasonal Awareness
            </h3>
          </div>

          <p className="text-body text-text-body">
            Your {result.primaryDosha} constitution is most active during{" "}
            <strong>{primaryContent.season}</strong>. During this time, pay extra
            attention to balancing routines, diet adjustments, and lifestyle
            practices to maintain optimal wellbeing.
          </p>
        </motion.div>

        {/* CTA row */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Link href="/chat">
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-burgundy border-0 shadow-burgundy"
            >
              Ask AI Vaidya about my Prakriti
            </Button>
          </Link>

          <Link href="/routine">
            <Button variant="secondary" size="lg">
              Build my Dinacharya routine
            </Button>
          </Link>

          <Link href="/yoga">
            <Button variant="ghost" size="lg">
              View my yoga plan
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
