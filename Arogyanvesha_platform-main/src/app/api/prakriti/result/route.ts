import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getSupabaseServerClient } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { logDatabaseFailure } from "@/lib/api/routeDiagnostics";

function parseRecommendations(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // A malformed legacy value must not turn a valid saved assessment into 500.
    return [];
  }
}

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("prakriti_results")
    .select("*")
    .eq("user_id", userId)
    // The deployed table uses created_at; the alignment migration backfills
    // completed_at for newer deployments, but this query remains compatible.
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logDatabaseFailure("/api/prakriti/result", "select latest prakriti_results", error, true);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve your result." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json({
    id: data.id,
    userId: data.user_id,
    primaryDosha: data.primary_dosha,
    secondaryDosha: data.secondary_dosha,
    balance: {
      vata: data.vata_pct,
      pitta: data.pitta_pct,
      kapha: data.kapha_pct,
    },
    completedAt: data.completed_at ?? data.created_at,
    recommendations: parseRecommendations(data.recommendations),
  }, { status: 200 });
}, "/api/prakriti/result");
