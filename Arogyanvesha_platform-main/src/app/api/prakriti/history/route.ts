import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error } = await supabase
    .from("prakriti_results")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Fetch Prakriti history error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve history." }, { status: 500 });
  }

  const mappedHistory = (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    primaryDosha: row.primary_dosha,
    secondaryDosha: row.secondary_dosha,
    balance: {
      vata: row.vata_pct,
      pitta: row.pitta_pct,
      kapha: row.kapha_pct,
    },
    completedAt: row.completed_at,
    recommendations: typeof row.recommendations === "string" ? JSON.parse(row.recommendations) : (row.recommendations || []),
  }));

  return NextResponse.json(mappedHistory, { status: 200 });
});
