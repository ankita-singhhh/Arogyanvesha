import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { practiceId } = await request.json();

  if (!practiceId) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Practice ID is required." }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0] ?? "";

  const { data: log, error } = await supabase
    .from("routine_logs")
    .upsert({
      user_id: userId,
      practice_id: practiceId,
      completed_date: today,
    }, { onConflict: "user_id,practice_id,completed_date" })
    .select("*")
    .single();

  if (error) {
    console.error("Log routine practice error:", error);
    return NextResponse.json({ code: "LOG_FAILED", message: "Failed to record practice completion." }, { status: 500 });
  }

  // Record an entry in the activity log
  const { data: practice } = await supabase
    .from("routine_practices")
    .select("name")
    .eq("id", practiceId)
    .single();

  await supabase.from("activity_log").insert({
    user_id: userId,
    type: "routine",
    title: `Completed practice: ${practice?.name || practiceId}`,
    description: `Logged daily routine practice on ${today}.`,
  });

  return NextResponse.json(log, { status: 200 });
});

export const DELETE = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { practiceId } = await request.json();

  if (!practiceId) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Practice ID is required." }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0] ?? "";

  const { error } = await supabase
    .from("routine_logs")
    .delete()
    .eq("user_id", userId)
    .eq("practice_id", practiceId)
    .eq("completed_date", today);

  if (error) {
    console.error("Delete routine log error:", error);
    return NextResponse.json({ code: "LOG_DELETE_FAILED", message: "Failed to remove completion log." }, { status: 500 });
  }

  return NextResponse.json({ message: "Practice completion removed." }, { status: 200 });
});
