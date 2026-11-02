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

const PAGE_SIZE = 24;
const FETCH_LIMIT = 100;

type WisdomApiArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: string[] | null;
  read_time_minutes?: number | null;
  image_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

type WisdomApiResponse =
  | WisdomApiArticle[]
  | {
      articles?: WisdomApiArticle[];
    };

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

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      params.append("limit", String(FETCH_LIMIT));

      const endpoint = `/wisdom/articles?${params.toString()}`;

      api
        .get<WisdomApiResponse>(endpoint)
        .then(({ data }) => {
          const articleList: WisdomApiArticle[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.articles)
              ? data.articles
              : [];

          const mappedArticles: WisdomArticle[] = articleList.map((article) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt ?? "",
            content: article.content ?? "",
            category: article.category ?? "",
            tags: Array.isArray(article.tags) ? article.tags : [],
            readTimeMinutes: article.read_time_minutes ?? 0,
            imageUrl: article.image_url ?? undefined,
            publishedAt: article.published_at ?? article.created_at ?? "",
          }));

          setArticles(mappedArticles);
          setVisibleCount(PAGE_SIZE);
        })
        .catch((err) => {
          console.error("Failed to fetch Wisdom articles:", err);
          setArticles([]);
          setError("Wisdom articles are temporarily unavailable.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const visible = articles.slice(0, visibleCount);

  return (
    <PageContainer className="py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-h1 font-display font-bold text-text-heading">
          Ayurvedic Wisdom
        </h1>

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

                    <h2 className="mt-2 text-h4 font-semibold text-text-heading">
                      {article.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-body-sm text-text-muted">
                      {article.excerpt}
                    </p>

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
