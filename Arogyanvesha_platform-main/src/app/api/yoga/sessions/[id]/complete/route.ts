import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;
  const { durationActualMinutes } = await request.json();

  // 1. Verify yoga session exists
  const { data: yogaSession, error: checkError } = await supabase
    .from("yoga_sessions")
    .select("title, duration_minutes")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (checkError || !yogaSession) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Yoga session not found." }, { status: 404 });
  }

  // 2. Insert into yoga_completions
  const { data: completion, error: completeError } = await supabase
    .from("yoga_completions")
    .insert({
      user_id: userId,
      session_id: id,
      duration_actual_minutes: durationActualMinutes || yogaSession.duration_minutes,
    })
    .select("*")
    .single();

  if (completeError) {
    console.error("Yoga completion error:", completeError);
    return NextResponse.json({ code: "LOG_FAILED", message: "Failed to record session completion." }, { status: 500 });
  }

  // 3. Log in activity_log
  await supabase
    .from("activity_log")
    .insert({
      user_id: userId,
      type: "yoga",
      title: `Completed Yoga: ${yogaSession.title}`,
      description: `Practiced yoga for ${durationActualMinutes || yogaSession.duration_minutes} minutes.`,
    });

  return NextResponse.json(completion, { status: 201 });
});
