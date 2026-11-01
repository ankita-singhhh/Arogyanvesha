import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { slug } = await context.params;
  const { readPct } = await request.json();

  // 1. Look up article ID by slug
  const { data: article, error: lookupError } = await supabase
    .from("wisdom_articles")
    .select("id, title")
    .eq("slug", slug)
    .single();

  if (lookupError || !article) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Article not found." }, { status: 404 });
  }

  // 2. Log read status
  const { error } = await supabase
    .from("article_reads")
    .upsert({
      user_id: userId,
      article_id: article.id,
      read_pct: readPct || 100,
      read_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Record article read error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to record article read status." }, { status: 500 });
  }

  // 3. Log in activity_log if read completes
  if (readPct === 100 || !readPct) {
    await supabase.from("activity_log").insert({
      user_id: userId,
      type: "wisdom",
      title: `Read Article: ${article.title}`,
      description: `Completed reading the educational article: "${article.title}".`,
    });
  }

  return NextResponse.json({ message: "Article read recorded successfully." }, { status: 200 });
});
