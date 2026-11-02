"use client";

import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button/Button";
import { api } from "@/lib/api";
import type { Herb } from "@/types";

const PAGE_SIZE = 24;
const FETCH_LIMIT = 100;

type HerbApiItem = {
  id: string;
  slug: string;
  name: string;
  sanskrit_name?: string | null;
  description?: string | null;
  benefits?: string[] | null;
  vata_effect?: string | null;
  pitta_effect?: string | null;
  kapha_effect?: string | null;
  image_url?: string | null;
  category?: string | null;
};

type HerbApiResponse =
  | HerbApiItem[]
  | {
      herbs?: HerbApiItem[];
    };

export default function HerbsPage() {
  const [herbs, setHerbs] = React.useState<Herb[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      params.append("limit", String(FETCH_LIMIT));

      api
        .get<HerbApiResponse>(`/herbs?${params.toString()}`)
        .then(({ data }) => {
          const herbList: HerbApiItem[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.herbs)
              ? data.herbs
              : [];

          const mappedHerbs: Herb[] = herbList.map((herb) => ({
            id: herb.id,
            slug: herb.slug,
            name: herb.name,
            sanskritName: herb.sanskrit_name ?? "",
            description: herb.description ?? "",
            benefits: Array.isArray(herb.benefits) ? herb.benefits : [],
            doshaEffect: {
              vata: herb.vata_effect ?? "neutral",
              pitta: herb.pitta_effect ?? "neutral",
              kapha: herb.kapha_effect ?? "neutral",
            },
            imageUrl: herb.image_url ?? undefined,
            category: herb.category ?? "",
          }));

          setHerbs(mappedHerbs);
          setVisibleCount(PAGE_SIZE);
        })
        .catch((err) => {
          console.error("Failed to fetch herbs:", err);
          setHerbs([]);
          setError("Herb information is temporarily unavailable.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const visible = herbs.slice(0, visibleCount);

  return (
    <PageContainer className="py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-h1 font-display font-bold text-text-heading">
          Ayurvedic Herbs
        </h1>

        <p className="mt-1 max-w-3xl text-body text-text-muted">
          Traditional-use education only. This library does not establish clinical
          effectiveness and does not provide prescriptions, dosages, or treatment
          advice.
        </p>

        <div className="mt-6 max-w-lg">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search Ayurvedic herbs…"
            isLoading={loading}
          />
        </div>

        {loading ? (
          <p className="mt-8 text-text-muted">Loading herbs…</p>
        ) : error ? (
          <p className="mt-8 text-status-error">{error}</p>
        ) : herbs.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              variant="no-results"
              title="No herbs found"
              description="Published herb references will appear here when available."
            />
          </div>
        ) : (
          <>
            <p className="mt-6 text-body-sm text-text-muted" role="status">
              Showing {visible.length} of {herbs.length} herbs
            </p>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((herb) => (
                <Link
                  key={herb.id}
                  href={`/herbs/${herb.slug}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card transition hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
                >
                  {herb.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={herb.imageUrl}
                      alt={`${herb.name} reference`}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    {herb.category && (
                      <p className="text-label text-text-muted">{herb.category}</p>
                    )}

                    <h2 className="mt-1 text-h4 font-semibold text-text-heading">
                      {herb.name}
                    </h2>

                    {herb.sanskritName && (
                      <p className="text-label italic text-text-muted">
                        {herb.sanskritName}
                      </p>
                    )}

                    <p className="mt-3 line-clamp-3 text-body-sm text-text-muted">
                      {herb.description}
                    </p>

                    {herb.benefits.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-text-heading">
                          Traditionally described as
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-text-muted">
                          {herb.benefits.slice(0, 2).map((benefit) => (
                            <li key={benefit}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <ul
                      className="mt-4 flex flex-wrap gap-2"
                      aria-label="Traditional dosha notes"
                    >
                      {(["vata", "pitta", "kapha"] as const).map((dosha) => (
                        <li
                          key={dosha}
                          className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-xs capitalize text-text-muted"
                        >
                          {dosha}: {herb.doshaEffect[dosha]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < herbs.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setVisibleCount((count) => count + PAGE_SIZE)
                  }
                >
                  Show more
                </Button>
              </div>
            )}
          </>
        )}

        <p className="mt-10 rounded-2xl border border-brand-gold/40 bg-[#fff9e7] p-4 text-body-sm text-text-body">
          <strong>Please note:</strong> Traditional-use education only. Talk to a
          qualified practitioner or clinician before using any herb, especially
          if you are pregnant, take medicines, or have a health condition.
        </p>
      </div>
    </PageContainer>
  );
}
