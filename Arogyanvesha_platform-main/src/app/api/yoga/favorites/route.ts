import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: favorites, error } = await supabase
    .from("yoga_favorites")
    .select(`
      session:yoga_sessions (*)
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Fetch yoga favorites error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to fetch favorited yoga sessions." }, { status: 500 });
  }

  const sessions = (favorites || []).map((fav: any) => fav.session).filter(Boolean);
  return NextResponse.json(sessions, { status: 200 });
});
