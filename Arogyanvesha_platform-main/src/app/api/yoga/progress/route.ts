import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: completions, error } = await supabase
    .from("yoga_completions")
    .select("duration_actual_minutes, completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Fetch yoga progress error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to fetch yoga progress." }, { status: 500 });
  }

  const totalSessions = completions?.length || 0;
  const totalMinutes = (completions || []).reduce((acc, row) => acc + (row.duration_actual_minutes || 0), 0);

  return NextResponse.json({
    totalSessions,
    totalMinutes,
    completions: completions || [],
  }, { status: 200 });
});
