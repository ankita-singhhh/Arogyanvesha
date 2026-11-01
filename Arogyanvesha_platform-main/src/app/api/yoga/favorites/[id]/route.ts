import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  const { error } = await supabase
    .from("yoga_favorites")
    .upsert({ user_id: userId, session_id: id });

  if (error) {
    console.error("Favorite yoga error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to favorite yoga session." }, { status: 500 });
  }

  return NextResponse.json({ message: "Yoga session added to favorites." }, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  const { error } = await supabase
    .from("yoga_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("session_id", id);

  if (error) {
    console.error("Unfavorite yoga error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to remove from favorites." }, { status: 500 });
  }

  return NextResponse.json({ message: "Yoga session removed from favorites." }, { status: 200 });
});
