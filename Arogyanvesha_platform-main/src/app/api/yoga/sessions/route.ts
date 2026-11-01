import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const level = url.searchParams.get("level");
  const category = url.searchParams.get("category");
  const dosha = url.searchParams.get("dosha");

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from("yoga_sessions")
    .select("*")
    .eq("is_published", true);

  if (level) query = query.eq("level", level);
  if (category) query = query.eq("category", category);
  if (dosha) query = query.eq("dosha_target", dosha);

  const { data: sessions, error } = await query
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Fetch yoga sessions database error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve yoga sessions." }, { status: 500 });
  }

  return NextResponse.json(sessions, { status: 200 });
});
