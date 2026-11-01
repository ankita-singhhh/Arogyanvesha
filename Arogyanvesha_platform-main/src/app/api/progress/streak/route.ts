import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: logs, error } = await supabase
    .from("routine_logs")
    .select("completed_date")
    .eq("user_id", userId)
    .order("completed_date", { ascending: false });

  if (error) {
    console.error("Streak logs query error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to calculate streak metrics." }, { status: 500 });
  }

  const dates = Array.from(new Set((logs || []).map((row) => row.completed_date)));

  if (dates.length === 0) {
    return NextResponse.json({ currentStreak: 0, longestStreak: 0 }, { status: 200 });
  }

  const todayStr = new Date().toISOString().split("T")[0] ?? "";
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "";

  // 1. Calculate Active Streak
  let currentStreak = 0;
  let expectedDate = dates[0] === todayStr ? todayStr : dates[0] === yesterdayStr ? yesterdayStr : null;

  if (expectedDate !== null) {
    let checkDateStr = expectedDate;
    while (dates.includes(checkDateStr)) {
      currentStreak++;
      const d = new Date(checkDateStr);
      d.setDate(d.getDate() - 1);
      checkDateStr = d.toISOString().split("T")[0] ?? "";
    }
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let localStreak = 0;
  let prevDate: Date | null = null;

  // Sort chronologically (oldest to newest)
  const sortedDates = [...dates].reverse().map((d) => new Date(d));

  for (const d of sortedDates) {
    if (prevDate === null) {
      localStreak = 1;
    } else {
      const diffTime = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        localStreak++;
      } else if (diffDays > 1) {
        if (localStreak > longestStreak) {
          longestStreak = localStreak;
        }
        localStreak = 1;
      }
    }
    prevDate = d;
  }

  if (localStreak > longestStreak) {
    longestStreak = localStreak;
  }

  // 3. Cache streaks in users table
  await supabase
    .from("users")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: todayStr,
    })
    .eq("id", userId);

  return NextResponse.json({ currentStreak, longestStreak }, { status: 200 });
});
