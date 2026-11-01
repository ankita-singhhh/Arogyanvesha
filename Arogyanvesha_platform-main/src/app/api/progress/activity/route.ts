import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getSupabaseServerClient } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { logDatabaseFailure } from "@/lib/api/routeDiagnostics";

export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
  const supabase = getSupabaseServerClient();

  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "10", 10) || 10));

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data: logs, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    logDatabaseFailure("/api/progress/activity", "select activity_log", error, true);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve activity feed." }, { status: 500 });
  }

  return NextResponse.json(logs || [], { status: 200 });
}, "/api/progress/activity");
