"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrakritiStore } from "@/stores";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Dosha } from "@/types";

const DOSHA_COLORS: Record<Dosha, { color: string; bg: string }> = {
  vata:  { color: "var(--color-dosha-vata)",  bg: "var(--color-dosha-vata-bg)"  },
  pitta: { color: "var(--color-dosha-pitta)", bg: "var(--color-dosha-pitta-bg)" },
  kapha: { color: "var(--color-dosha-kapha)", bg: "var(--color-dosha-kapha-bg)" },
};

export default function PrakritiHistoryPage() {
  const { history, result } = usePrakritiStore();

  if (history.length === 0) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          variant="no-prakriti"
          title="No assessment history yet"
          description="Complete your first Prakriti assessment to start building your wellness timeline."
          action={
            <Link href="/prakriti/quiz">
              <Button variant="primary">Take the assessment</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <Badge variant="gold" size="md" className="mb-3">Assessment Timeline</Badge>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-2">
            Prakriti History
          </h1>
          <p className="text-body text-text-muted">
            Track how your constitution has been assessed over time.
            Prakriti reassessments are available every 90 days.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-6">
          {/* Vertical line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-border-default"/>

          {history.map((item, i) => {
        
            const isCurrent = item.id === result?.id;

            return (
              <motion.div key={item.id}
                className="relative flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}>

                {/* Timeline dot */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                  isCurrent
                    ? "bg-brand-burgundy border-brand-burgundy"
                    : "bg-surface-card border-border-default",
                )}>
                  <span className={cn(
                    "text-label font-bold",
                    isCurrent ? "text-text-inverted" : "text-text-muted",
                  )}>
                    {i + 1}
                  </span>
                </div>

                {/* Card */}
                <div className={cn(
                  "flex-1 p-5 rounded-xl border shadow-sm transition-all duration-200",
                  isCurrent
                    ? "border-brand-burgundy/30 bg-brand-burgundy/3"
                    : "border-border-default bg-surface-card hover:shadow-md",
                )}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-h4 font-bold text-text-heading capitalize">
                          {item.primaryDosha} - {item.secondaryDosha}
                        </h3>
                        {isCurrent && (
                          <Badge variant="brand" size="sm">Current</Badge>
                        )}
                      </div>
                      <p className="text-body-sm text-text-muted">
                        {new Date(item.completedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Mini balance bars */}
                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                      {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
                        <div key={d} className="flex items-center gap-2">
                          <span className="text-micro font-medium text-text-muted w-8 capitalize">{d}</span>
                          <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${item.balance[d]}%`,
                                background: DOSHA_COLORS[d].color,
                              }}
                            />
                          </div>
                          <span className="text-micro text-text-muted w-6 text-right">
                            {item.balance[d]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="flex gap-3 mt-3 pt-3 border-t border-border-default">
                      <Link href="/prakriti/result">
                        <Button variant="primary" size="sm">View full result</Button>
                      </Link>
                      <Link href="/chat">
                        <Button variant="ghost" size="sm">Ask AI Vaidya</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Retake notice */}
        <motion.div
          className="mt-10 p-5 rounded-xl bg-bg-subtle border border-border-default text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-body-sm text-text-muted mb-3">
            Prakriti can shift subtly with age, seasons, and lifestyle. Reassessment is recommended every 90 days.
          </p>
          <Link href="/prakriti/quiz">
            <Button variant="secondary" size="sm">Retake assessment</Button>
          </Link>
        </motion.div>
      </div>
    </PageContainer>
  );
}