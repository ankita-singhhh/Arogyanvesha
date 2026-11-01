
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useSymptomStore } from "@/stores";

export default function SymptomResultPage() {
  const router = useRouter();
  const { result, reset } = useSymptomStore();

  if (!result) {
    return (
      <PageContainer className="py-12 max-w-2xl mx-auto text-center">
        <div className="p-8 rounded-2xl bg-surface-card border border-border-default flex flex-col items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            🔍
          </span>
          <h2 className="text-h2 font-display font-bold text-text-heading">
            No Analysis Results Found
          </h2>
          <p className="text-body text-text-muted max-w-md">
            Please describe your symptoms first so our clinical Random Forest
            model and Ayurvedic knowledge base can provide insights.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/symptoms")}
            className="bg-gradient-burgundy border-0 shadow-burgundy mt-2"
          >
            Start Symptom Check
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isEmergency =
    result.is_emergency || result.urgency === "emergency";
  const cards = result.wellness_cards ?? [];
  const hasFiveCards = cards.length === 5;
  const isGeneralGuidance = result.analysis_source === "fallback";

  // Use the original input first, then fall back to the generated summary
  // or recognized symptoms if the user submitted symptom chips only.
 const analyzedDescription =
  result.original_symptom_text?.trim() ||
  result.recognized_symptoms?.join(", ") ||
  "No symptom description provided.";
  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">
      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Emergency Alert */}
        {isEmergency && (
          <div
            role="alert"
            className="p-5 rounded-2xl bg-status-error-bg border-2 border-status-error flex flex-col gap-3 shadow-lg motion-safe:animate-pulse"
          >
            <div className="flex items-center gap-2 text-status-error font-bold">
              <span className="text-2xl" aria-hidden="true">
                🚨
              </span>
              <h2 className="text-h3 font-bold">
                CRITICAL MEDICAL WARNING
              </h2>
            </div>
            <p className="text-body text-text-body font-medium leading-relaxed">
              {result.emergency_message ||
                "Your symptoms may indicate an urgent medical emergency. Please seek immediate hospital or emergency evaluation (Call 112 / 102 / 911)."}
            </p>
            <div className="p-3 bg-white/80 dark:bg-black/40 rounded-xl text-body-sm font-semibold text-status-error">
              Do not attempt home remedies or Ayurvedic self-treatment for
              acute emergencies.
            </div>
          </div>
        )}

        {/* Persistent Medical Disclaimer */}
        <div className="p-4 rounded-xl bg-status-warning-bg border border-status-warning/30 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
            ⚕️
          </span>
          <p className="text-body-sm text-text-body leading-relaxed">
            <strong>Important Health Notice:</strong> {result.disclaimer}
          </p>
        </div>

        {/* Input Summary */}
        <div className="p-5 rounded-2xl bg-surface-card border border-border-default flex flex-col gap-3">
          <p className="text-label uppercase tracking-wider text-text-muted font-bold">
            Analyzed Description
          </p>

          <p className="text-body italic text-text-heading wrap-break-word">
            &ldquo;{analyzedDescription}&rdquo;
          </p>

          {result.recognized_symptoms &&
            result.recognized_symptoms.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-default">
                <span className="text-label text-text-muted">
                  Normalized Features:
                </span>
                {result.recognized_symptoms.map((sym) => (
                  <Badge key={sym} variant="outline" size="sm">
                    {sym}
                  </Badge>
                ))}
              </div>
            )}
        </div>

        {/* Candidate Conditions from Random Forest ML */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-h3 font-display font-bold text-text-heading">
              Ranked Model Candidates
            </h2>
            <span className="text-micro text-text-muted">
              Random Forest ranking
            </span>
          </div>

          <p className="text-body-sm text-text-muted mb-4">
            These are uncalibrated Random Forest ranking scores, not
            likelihoods or diagnoses. They are shown in rank order without
            percentages.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {result.candidate_conditions &&
            result.candidate_conditions.length > 0 ? (
              result.candidate_conditions.map((cand) => (
                <div
                  key={cand.condition}
                  className="p-4 rounded-xl bg-surface-card border border-border-default flex items-center justify-between hover:border-brand-burgundy/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-burgundy/10 text-brand-burgundy font-bold text-sm flex items-center justify-center shrink-0">
                      {cand.rank}
                    </span>
                    <div>
                      <h3 className="text-body font-semibold text-text-heading capitalize">
                        {cand.condition}
                      </h3>
                      <p className="text-micro text-text-muted">
                        Model rank {cand.rank} •{" "}
                        {cand.score_type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-text-muted italic">
                No model candidates are available for this symptom combination.
              </p>
            )}
          </div>
        </div>

        {/* Ayurvedic Dosha Imbalance Section */}
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-burgundy/20 bg-brand-burgundy/5 p-6">
          <Badge
            variant="outline"
            size="md"
            className="mb-3 max-w-full whitespace-normal wrap-break-word uppercase font-bold"
          >
            {result.dosha_imbalance || "Not assessed"}
          </Badge>

          <h2 className="mb-2 max-w-full wrap-break-word text-h2 font-display font-bold text-text-heading">
            Traditional Ayurvedic Perspective
          </h2>

          <p className="max-w-full whitespace-normal wrap-break-word wrap-anywhere text-body leading-relaxed text-text-body">
            {result.traditional_perspective ||
              result.ayurvedic_explanation ||
              "No traditional perspective is available for this analysis."}
          </p>

          {result.ayurvedic_citations &&
            result.ayurvedic_citations.length > 0 && (
              <p className="mt-3 max-w-full wrap-break-word wrap-anywhere text-micro text-text-muted">
                Traditional sources:{" "}
                {result.ayurvedic_citations.join(", ")}
              </p>
            )}

          {result.ayurvedic_citation_urls &&
            result.ayurvedic_citation_urls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block max-w-full break-all text-micro text-brand-burgundy hover:underline"
              >
                View traditional source ↗
              </a>
            ))}
        </div>

        {/* Evidence Retrieval Details */}
        {result.retrieved_evidence &&
          result.retrieved_evidence.length > 0 && (
            <details className="rounded-2xl bg-surface-card border border-border-default p-5">
              <summary className="cursor-pointer text-body-sm font-semibold text-text-heading">
                Evidence retrieval details
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                {result.retrieved_evidence.map((p, idx) => (
                  <div
                    key={`${p.document_id}-${idx}`}
                    className="text-body-sm text-text-muted"
                  >
                    <span className="font-semibold text-brand-burgundy">
                      {p.source_name || "Official Source"}
                    </span>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-brand-burgundy hover:underline"
                      >
                        View reference ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}

        {/* Five Traditional Wellness Cards */}
        {!isEmergency && (
          <section
            aria-labelledby="wellness-heading"
            className="flex flex-col gap-4"
          >
            <div>
              <h2
                id="wellness-heading"
                className="text-h3 font-display font-bold text-text-heading"
              >
                Five traditional wellness suggestions
              </h2>
              <p className="mt-1 text-body-sm text-text-muted">
                Traditional Ayurvedic wellness education based on what you
                described. These are not a diagnosis or a treatment, and they
                do not replace medical care.
              </p>
            </div>

            {isGeneralGuidance && hasFiveCards && (
              <div
                role="status"
                className="p-4 rounded-xl bg-status-warning-bg border border-status-warning/30 text-body-sm text-text-body"
              >
                Personalised suggestions are unavailable right now, so these
                are general, low-risk practices. Start a new symptom check
                to try again.
              </div>
            )}

            {hasFiveCards ? (
              <ul
                role="list"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0"
              >
                {cards.map((card) => (
                  <li key={card.id} className="md:last:col-span-2">
                    <article
                      aria-labelledby={`${card.id}-title`}
                      className="h-full p-5 rounded-xl bg-surface-card border border-border-default flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">
                          {card.icon}
                        </span>
                        <Badge variant="outline" size="sm">
                          {card.category}
                        </Badge>
                      </div>

                      <h3
                        id={`${card.id}-title`}
                        className="text-body font-semibold text-text-heading"
                      >
                        {card.title}
                      </h3>

                      <p className="text-body-sm text-text-body leading-relaxed">
                        {card.recommendation}
                      </p>

                      <div>
                        <h4 className="text-body-sm font-semibold text-text-heading">
                          Traditional context
                        </h4>
                        <p className="mt-1 text-body-sm text-text-muted leading-relaxed">
                          {card.ayurvedic_context || card.details}
                        </p>
                      </div>

                      <div className="mt-auto p-3 rounded-lg bg-status-warning-bg/50 border border-status-warning/30">
                        <h4 className="text-body-sm font-semibold text-text-heading">
                          Safety and who should avoid it
                        </h4>
                        <p className="mt-1 text-body-sm text-text-body leading-relaxed">
                          {card.safety_precautions}
                        </p>
                      </div>

                      <p className="text-micro text-text-muted">
                        {card.citations && card.citations.length > 0
                          ? `Source: ${card.citations.join(", ")}`
                          : "General traditional guidance"}
                      </p>

                      {card.citation_urls &&
                        card.citation_urls.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {card.citation_urls.map((url) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-micro text-brand-burgundy hover:underline"
                              >
                                View source ↗
                              </a>
                            ))}
                          </div>
                        )}
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 rounded-xl bg-surface-card border border-border-default flex flex-col items-start gap-3">
                <p className="text-body-sm text-text-body">
                  Wellness suggestions are not available for this result.
                  Start a new symptom check to try again.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    reset();
                    router.push("/symptoms");
                  }}
                >
                  New Symptom Check
                </Button>
              </div>
            )}

            <p className="text-body-sm text-text-body p-4 rounded-xl border border-border-default bg-surface-card">
              Talk to a doctor or qualified Ayurvedic practitioner before
              trying any new practice if you are pregnant or breastfeeding,
              if it is for a child, if you have a long-term health condition,
              or if you take regular medicines. Never stop or change
              prescribed medication because of anything shown here.
            </p>
          </section>
        )}

        {/* Warning Signs & When to Seek Care */}
        <div className="p-5 rounded-xl bg-status-warning-bg/40 border border-status-warning/30 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 font-bold text-text-heading text-body-sm">
            <span aria-hidden="true">⚠️</span>
            <span>Warning Signs & When to See a Doctor</span>
          </div>
          <ul className="flex flex-col gap-1.5 pl-5 list-disc text-body-sm text-text-body">
            {result.warning_signs &&
              result.warning_signs.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
          </ul>
          {result.when_to_seek_care && (
            <p className="text-body-sm font-semibold text-brand-burgundy mt-1">
              {result.when_to_seek_care}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Button
            variant="primary"
            onClick={() => router.push("/chat")}
            className="bg-gradient-burgundy border-0 shadow-burgundy flex-1 min-w-50"
          >
            Discuss with AI Vaidya in Chat
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              router.push("/symptoms");
            }}
            className="flex-1 min-w-40"
          >
            New Symptom Check
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
