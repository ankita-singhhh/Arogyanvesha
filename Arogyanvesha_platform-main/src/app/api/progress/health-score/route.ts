import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getSupabaseServerClient } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { logDatabaseFailure } from "@/lib/api/routeDiagnostics";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
  const supabase = getSupabaseServerClient();

  const { data: scores, error } = await supabase
    .from("health_scores")
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false });

  if (error) {
    logDatabaseFailure("/api/progress/health-score", "select health_scores", error, true);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve health scores." }, { status: 500 });
  }

  return NextResponse.json(scores || [], { status: 200 });
}, "/api/progress/health-score");
