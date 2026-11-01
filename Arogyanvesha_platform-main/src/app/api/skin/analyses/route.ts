import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: analyses, error } = await supabase
    .from("skin_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("analyzed_at", { ascending: false });

  if (error) {
    console.error("Fetch skin history error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve skin history." }, { status: 500 });
  }

  return NextResponse.json(analyses, { status: 200 });
});
