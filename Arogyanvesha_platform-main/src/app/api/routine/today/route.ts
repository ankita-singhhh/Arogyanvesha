import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const today = new Date().toISOString().split("T")[0] ?? "";

  const { data: logs, error } = await supabase
    .from("routine_logs")
    .select("practice_id")
    .eq("user_id", userId)
    .eq("completed_date", today);

  if (error) {
    console.error("Fetch today routine logs error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to load today's routine logs." }, { status: 500 });
  }

  const completedIds = (logs || []).map((l) => l.practice_id);
  return NextResponse.json({ date: today, completedIds }, { status: 200 });
});
