import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "";

  const { data: logs, error } = await supabase
    .from("routine_logs")
    .select("completed_date, practice_id")
    .eq("user_id", userId)
    .gte("completed_date", thirtyDaysAgo)
    .order("completed_date", { ascending: false });

  if (error) {
    console.error("Fetch routine history error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve history logs." }, { status: 500 });
  }

  // Aggregate logs by date
  const historyMap: Record<string, string[]> = {};
  (logs || []).forEach((log) => {
    const date = log.completed_date;
    if (!historyMap[date]) {
      historyMap[date] = [];
    }
    historyMap[date]?.push(log.practice_id);
  });

  const historyList = Object.entries(historyMap).map(([date, completedIds]) => ({
    date,
    completedIds,
  }));

  return NextResponse.json(historyList, { status: 200 });
});
