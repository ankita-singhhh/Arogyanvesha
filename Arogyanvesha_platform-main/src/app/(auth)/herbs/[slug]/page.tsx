"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/lib/api";

type HerbDetail = {
  name: string;
  sanskrit_name?: string | null;
  botanical_name?: string | null;
  category?: string | null;
  description?: string | null;
  benefits?: string[];
  vata_effect?: string | null;
  pitta_effect?: string | null;
  kapha_effect?: string | null;
  classical_reference?: string | null;
  contraindications?: string[];
};

const effectLabel = (effect?: string | null) => {
  if (effect === "decreases") return "Traditionally described as decreasing";
  if (effect === "increases") return "Traditionally described as increasing";
  return "No traditional effect recorded";
};

export default function HerbDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [herb, setHerb] = React.useState<HerbDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Herb reference not found.");
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setHerb(null);

    api
      .get<HerbDetail>(`/herbs/${encodeURIComponent(slug)}`, {
        signal: controller.signal,
      })
      .then(({ data }) => setHerb(data))
      .catch((err) => {
        if (controller.signal.aborted) return;

        setError(
          err?.response?.status === 404
            ? "This herb reference is not available."
            : "This herb reference is temporarily unavailable.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading || (!herb && !error)) {
    return (
      <PageContainer narrow className="py-10">
        <p className="text-body text-text-muted">Loading herb reference…</p>
        <Link
          href="/herbs"
          className="mt-4 inline-block text-body-sm font-semibold text-brand-burgundy"
        >
          ← Back to encyclopedia
        </Link>
      </PageContainer>
    );
  }

  if (error || !herb) {
    return (
      <PageContainer narrow className="py-10">
        <p className="text-body text-text-muted">
          {error ?? "This herb reference is unavailable."}
        </p>
        <Link
          href="/herbs"
          className="mt-4 inline-block text-body-sm font-semibold text-brand-burgundy"
        >
          ← Back to encyclopedia
        </Link>
      </PageContainer>
    );
  }

  const benefits = Array.isArray(herb.benefits) ? herb.benefits : [];
  const contraindications = Array.isArray(herb.contraindications)
    ? herb.contraindications
    : [];

  const doshas = [
    ["Vata", herb.vata_effect],
    ["Pitta", herb.pitta_effect],
    ["Kapha", herb.kapha_effect],
  ] as const;

  return (
    <PageContainer narrow className="py-10">
      <article className="rounded-2xl border border-border-default bg-surface-card p-6 sm:p-8">
        <Link
          href="/herbs"
          className="text-body-sm font-semibold text-brand-burgundy"
        >
          ← Back to encyclopedia
        </Link>

        <p className="mt-6 text-label text-text-muted">
          {herb.category || "Herb reference"}
        </p>

        <h1 className="mt-2 text-h1 font-display font-bold text-text-heading">
          {herb.name}
        </h1>

        {herb.sanskrit_name && (
          <p className="mt-1 text-body-sm italic text-text-muted">
            {herb.sanskrit_name}
          </p>
        )}

        {herb.botanical_name && (
          <p className="mt-1 text-body-sm text-text-muted">
            Botanical name: {herb.botanical_name}
          </p>
        )}

        <p className="mt-6 whitespace-pre-line text-body leading-relaxed text-text-body">
          {herb.description ||
            "No description has been published for this reference."}
        </p>

        <section className="mt-8 rounded-xl border border-brand-gold/30 bg-brand-gold-pale p-5">
          <h2 className="text-h4 font-semibold text-text-heading">
            Educational safety note
          </h2>
          <p className="mt-2 text-body-sm text-text-body">
            This information records traditional Ayurvedic use. It does not
            establish clinical effectiveness and is not a prescription, dosage,
            or individualized treatment plan. Consult a qualified clinician or
            pharmacist about safety, interactions, pregnancy, or ongoing
            treatment.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-h4 font-semibold text-text-heading">
            Traditional dosha descriptions
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            {doshas.map(([dosha, effect]) => (
              <div
                key={dosha}
                className="rounded-xl border border-border-default p-4"
              >
                <dt className="font-semibold text-text-heading">{dosha}</dt>
                <dd className="mt-1 text-body-sm text-text-muted">
                  {effectLabel(effect)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {benefits.length > 0 && (
          <section className="mt-8">
            <h2 className="text-h4 font-semibold text-text-heading">
              Traditional uses described by this source
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-text-body">
              {benefits.map((benefit, index) => (
                <li key={`${index}-${benefit}`}>{benefit}</li>
              ))}
            </ul>
          </section>
        )}

        {contraindications.length > 0 && (
          <section className="mt-8 rounded-xl border border-status-warning/30 bg-status-warning-bg p-5">
            <h2 className="text-h4 font-semibold text-text-heading">
              Safety information recorded by this source
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-text-body">
              {contraindications.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {herb.classical_reference && (
          <p className="mt-8 border-t border-border-default pt-4 text-body-sm text-text-muted">
            Source reference supplied with this entry: {herb.classical_reference}
          </p>
        )}
      </article>
    </PageContainer>
  );
}
