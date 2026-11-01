import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const category = url.searchParams.get("category");
  const tag = url.searchParams.get("tag");
  const search = url.searchParams.get("search");

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from("wisdom_articles")
    .select("*")
    .eq("is_published", true);

  if (category) query = query.eq("category", category);
  
  if (tag) {
    // tag filtering using JSONB path or array search
    query = query.filter("tags", "cs", `["${tag}"]`);
  }

  if (search) {
    query = query.textSearch("fts", search, {
      config: "english",
      type: "websearch",
    });
  }

  const { data: articles, error } = await query
    .order("published_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Fetch wisdom articles database error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve articles." }, { status: 500 });
  }

  return NextResponse.json(articles, { status: 200 });
});
