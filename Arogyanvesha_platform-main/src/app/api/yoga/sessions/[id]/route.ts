import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const { id } = await context.params;

  const { data: session, error } = await supabase
    .from("yoga_sessions")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !session) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Yoga session not found." }, { status: 404 });
  }

  return NextResponse.json(session, { status: 200 });
});
