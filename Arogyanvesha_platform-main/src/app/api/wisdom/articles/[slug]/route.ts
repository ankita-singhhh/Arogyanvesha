import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const { slug } = await context.params;

  const { data: article, error } = await supabase
    .from("wisdom_articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !article) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Article not found." }, { status: 404 });
  }

  return NextResponse.json(article, { status: 200 });
});
