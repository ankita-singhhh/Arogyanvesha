"use client";
import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/lib/api";

export default function WisdomArticlePage() {
 const { slug } = useParams<{slug:string}>(); const [article, setArticle] = React.useState<any>(null); const [status, setStatus] = React.useState("Loading article…");
 React.useEffect(() => { if (!slug) return; api.get(`/wisdom/articles/${slug}`).then(({data}) => setArticle(data)).catch((error) => setStatus(error?.response?.status === 404 ? "This article is not available." : "This article is temporarily unavailable.")); }, [slug]);
 if (!article) return <PageContainer narrow className="py-10"><p className="text-body text-text-muted">{status}</p><Link href="/wisdom" className="mt-4 inline-block text-body-sm font-semibold text-brand-burgundy">Back to library →</Link></PageContainer>;
 return <PageContainer narrow className="py-10"><article><Link href="/wisdom" className="text-body-sm font-semibold text-brand-burgundy">← Back to library</Link><p className="mt-8 text-label text-text-muted">{article.category} · {article.read_time_minutes ?? 0} min read</p><h1 className="mt-2 text-h1 font-display font-bold text-text-heading">{article.title}</h1><div className="prose prose-lg mt-8 max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown></div></article></PageContainer>;
}
