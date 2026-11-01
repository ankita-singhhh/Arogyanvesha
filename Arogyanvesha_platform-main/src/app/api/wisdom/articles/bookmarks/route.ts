import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: bookmarks, error } = await supabase
    .from("article_bookmarks")
    .select(`
      article:wisdom_articles (*)
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Fetch article bookmarks error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve bookmarked articles." }, { status: 500 });
  }

  const articles = (bookmarks || []).map((b: any) => b.article).filter(Boolean);
  return NextResponse.json(articles, { status: 200 });
});
