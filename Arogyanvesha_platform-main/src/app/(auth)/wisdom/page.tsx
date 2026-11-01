"use client";

import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button/Button";
import { api } from "@/lib/api";
import type { WisdomArticle } from "@/types";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Ayurveda Fundamentals", label: "Ayurveda Fundamentals" },
  { value: "Herbs & Botanicals", label: "Herbs & Botanicals" },
  { value: "Dinacharya (Daily Routines)", label: "Dinacharya (Daily Routines)" },
  { value: "Ritucharya (Seasonal Routines)", label: "Ritucharya (Seasonal Routines)" },
  { value: "Food & Nutrition", label: "Food & Nutrition" },
  { value: "Yoga & Pranayama", label: "Yoga & Pranayama" },
  { value: "Traditional Wellness Practices", label: "Traditional Wellness Practices" },
];

const PAGE_SIZE = 24; // cards shown at first, and added by each "Show more"
const FETCH_LIMIT = 100; // most articles requested from the API at once

export default function WisdomPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [articles, setArticles] = React.useState<WisdomArticle[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      // Ask for up to 100. Change "limit" if your backend names it differently
      // (for example per_page or page_size).
      params.append("limit", String(FETCH_LIMIT));
      const endpoint = `/wisdom/articles?${params.toString()}`;

      api
        .get<any[]>(endpoint)
        .then(({ data }) => {
          setArticles(
            (data ?? []).map((a) => ({
              id: a.id,
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt ?? "",
              content: a.content ?? "",
              category: a.category ?? "",
              tags: Array.isArray(a.tags) ? a.tags : [],
              readTimeMinutes: a.read_time_minutes ?? 0,
              imageUrl: a.image_url,
              publishedAt: a.published_at ?? a.created_at,
            })),
          );
          setVisibleCount(PAGE_SIZE);
        })
        .catch(() => setError("Wisdom articles are temporarily unavailable."))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const visible = articles.slice(0, visibleCount);

  return (
    <PageContainer className="py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-h1 font-display font-bold text-text-heading">Ayurvedic Wisdom</h1>
        <p className="mt-1 text-body text-text-muted">
          Published educational articles from the Arogyanvesha knowledge library.
        </p>

        <div className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search articles…"
            isLoading={loading}
          />
          <Select
            options={CATEGORIES}
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="sm:w-64"
          />
        </div>

        {loading ? (
          <p className="mt-8 text-text-muted">Loading articles…</p>
        ) : error ? (
          <p className="mt-8 text-status-error">{error}</p>
        ) : articles.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              variant="no-results"
              title="No articles found"
              description="Published knowledge articles will appear here when available."
            />
          </div>
        ) : (
          <>
            <p className="mt-6 text-body-sm text-text-muted" role="status">
              Showing {visible.length} of {articles.length} articles
            </p>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((article) => (
                <Link
                  key={article.id}
                  href={`/wisdom/${article.slug}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card transition hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
                >
                  {article.imageUrl && (
                    // Plain <img> so any image host works without extra Next.js config.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-label text-text-muted">
                      {article.category} · {article.readTimeMinutes} min read
                    </p>
                    <h2 className="mt-2 text-h4 font-semibold text-text-heading">{article.title}</h2>
                    <p className="mt-3 line-clamp-3 text-body-sm text-text-muted">{article.excerpt}</p>
                    {article.tags.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-xs text-text-muted"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < articles.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Show more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}