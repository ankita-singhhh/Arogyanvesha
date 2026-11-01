import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { slug } = await context.params;

  // 1. Look up article ID by slug
  const { data: article, error: lookupError } = await supabase
    .from("wisdom_articles")
    .select("id")
    .eq("slug", slug)
    .single();

  if (lookupError || !article) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Article not found." }, { status: 404 });
  }

  // 2. Insert bookmark
  const { error } = await supabase
    .from("article_bookmarks")
    .upsert({ user_id: userId, article_id: article.id });

  if (error) {
    console.error("Bookmark article error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to bookmark article." }, { status: 500 });
  }

  return NextResponse.json({ message: "Article bookmarked successfully." }, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { slug } = await context.params;

  // 1. Look up article ID by slug
  const { data: article, error: lookupError } = await supabase
    .from("wisdom_articles")
    .select("id")
    .eq("slug", slug)
    .single();

  if (lookupError || !article) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Article not found." }, { status: 404 });
  }

  // 2. Delete bookmark
  const { error } = await supabase
    .from("article_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", article.id);

  if (error) {
    console.error("Remove article bookmark error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to remove article bookmark." }, { status: 500 });
  }

  return NextResponse.json({ message: "Article bookmark removed successfully." }, { status: 200 });
});
