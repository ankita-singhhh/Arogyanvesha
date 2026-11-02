"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { usePrakritiStore } from "@/stores";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { RouteLoading } from "@/components/ui/RouteLoading";
import type { Dosha } from "@/types";

type DoshaBalance = {
  vata: number;
  pitta: number;
  kapha: number;
};

type PrakritiResult = {
  primaryDosha: Dosha;
  secondaryDosha: Dosha;
  balance: DoshaBalance;
  completedAt: string;
};

type BackendPrakritiResult = {
  primary_dosha?: Dosha;
  secondary_dosha?: Dosha | null;
  primaryDosha?: Dosha;
  secondaryDosha?: Dosha | null;
  scores?: Partial<DoshaBalance>;
  balance?: Partial<DoshaBalance>;
  completedAt?: string;
};

const DOSHA_CONTENT: Record<
  Dosha,
  {
    element: string;
    description: string;
    qualities: string[];
    strengths: string[];
    challenges: string[];
    diet: string[];
    yoga: string[];
    herbs: string[];
    season: string;
    color: string;
    bg: string;
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
      "Ghee and sesame oil",
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

function normalizeResult(data: BackendPrakritiResult): PrakritiResult | null {
  const primaryDosha = data.primaryDosha ?? data.primary_dosha;
  const secondaryDosha =
    data.secondaryDosha ?? data.secondary_dosha ?? primaryDosha;

  if (
    !primaryDosha ||
    !secondaryDosha ||
    !(primaryDosha in DOSHA_CONTENT) ||
    !(secondaryDosha in DOSHA_CONTENT)
  ) {
    return null;
  }

  const scores = data.scores ?? data.balance ?? {};
  const vata = Number(scores.vata ?? 0);
  const pitta = Number(scores.pitta ?? 0);
  const kapha = Number(scores.kapha ?? 0);
  const total = vata + pitta + kapha;

  return {
    primaryDosha,
    secondaryDosha,
    balance: {
      vata: total > 0 ? Math.round((vata / total) * 100) : 0,
      pitta: total > 0 ? Math.round((pitta / total) * 100) : 0,
      kapha: total > 0 ? Math.round((kapha / total) * 100) : 0,
    },
    completedAt: data.completedAt ?? new Date().toISOString(),
  };
}

function DoshaBalanceChart({ balance }: { balance: DoshaBalance }) {
  const items: { dosha: Dosha; value: number }[] = [
    { dosha: "vata", value: balance.vata },
    { dosha: "pitta", value: balance.pitta },
    { dosha: "kapha", value: balance.kapha },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-muted">
        {items.map(({ dosha, value }) => (
          <div
            key={dosha}
            style={{
              width: `${value}%`,
              background: DOSHA_CONTENT[dosha].color,
            }}
            title={`${dosha}: ${value}%`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map(({ dosha, value }) => (
          <div key={dosha} className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: DOSHA_CONTENT[dosha].color }}
              />
              <span className="capitalize text-body-sm text-text-muted">
                {dosha}
              </span>
            </div>
            <p className="text-h4 font-bold text-text-heading">{value}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrakritiResultPage() {
  const { result, setResult } = usePrakritiStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      try {
        const response = await api.get("/prakriti/result");
        if (cancelled) return;

        const normalized = normalizeResult(response.data);

        if (normalized) {
          setResult(normalized);
        } else {
          setResult(null);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load Prakriti result:", error);
        setResult(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [setResult]);

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

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const sections = [
    {
      title: "Diet & Nutrition",
      items: primaryContent.diet,
      icon: "🥗",
    },
    {
      title: "Yoga Practice",
      items: primaryContent.yoga,
      icon: "🧘",
    },
    {
      title: "Recommended Herbs",
      items: primaryContent.herbs,
      icon: "🌿",
    },
  ];

  return (
    <PageContainer className="py-10">
      <motion.div
        className="flex flex-col gap-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.section
          variants={fadeUp}
          className="rounded-2xl border border-border-default p-8 lg:p-10"
          style={{
            background: `linear-gradient(135deg, ${primaryContent.bg} 0%, var(--color-surface-card) 100%)`,
          }}
        >
          <Badge variant="gold" size="md" className="mb-4">
            Your Prakriti Result
          </Badge>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h1 className="mb-3 text-h1 font-display font-bold text-text-heading">
                <span style={{ color: primaryContent.color }}>
                  {result.primaryDosha.charAt(0).toUpperCase() +
                    result.primaryDosha.slice(1)}
                </span>
                {result.secondaryDosha !== result.primaryDosha && (
                  <>
                    {" - "}
                    <span style={{ color: secondaryContent.color }}>
                      {result.secondaryDosha.charAt(0).toUpperCase() +
                        result.secondaryDosha.slice(1)}
                    </span>
                  </>
                )}
              </h1>

              <p className="mb-4 text-label font-semibold uppercase tracking-wider text-text-muted">
                {primaryContent.element}
                {result.secondaryDosha !== result.primaryDosha &&
                  ` · ${secondaryContent.element}`}
              </p>

              <p className="max-w-lg text-body-lg leading-relaxed text-text-body">
                {primaryContent.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {primaryContent.qualities.map((quality) => (
                  <span
                    key={quality}
                    className="rounded-pill border px-3 py-1 text-body-sm font-medium"
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

            <div className="self-center">
              <DoshaBalanceChart balance={result.balance} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border-default pt-6">
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
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <ContentList
            title="Your Strengths"
            items={primaryContent.strengths}
            color={primaryContent.color}
          />
          <ContentList
            title="Areas to Balance"
            items={primaryContent.challenges}
            color="var(--color-status-warning)"
          />
        </motion.section>

        <motion.section variants={fadeUp}>
          <h2 className="mb-6 text-h2 font-display font-bold text-text-heading">
            Your Personalised Recommendations
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-border-default bg-surface-card p-6 shadow-sm"
              >
                <h3 className="mb-4 text-h4 font-semibold text-text-heading">
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-body-sm text-text-body"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="rounded-xl border border-border-gold/30 p-6"
          style={{ background: "var(--color-brand-gold-pale)" }}
        >
          <h3 className="mb-3 text-h4 font-semibold text-text-heading">
            Seasonal Awareness
          </h3>
          <p className="text-body text-text-body">
            Your {result.primaryDosha} constitution is most active during{" "}
            <strong>{primaryContent.season}</strong>. During this time, pay
            extra attention to balancing routines, diet adjustments, and
            lifestyle practices to maintain wellbeing.
          </p>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="flex flex-col justify-center gap-4 pt-4 sm:flex-row"
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
        </motion.section>
      </motion.div>
    </PageContainer>
  );
}

function ContentList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 shadow-sm">
      <h3 className="mb-5 text-h4 font-semibold text-text-heading">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 text-body-sm text-text-body"
          >
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full")}
              style={{ background: color }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
