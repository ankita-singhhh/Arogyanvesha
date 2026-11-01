import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: bookmarks, error } = await supabase
    .from("herb_bookmarks")
    .select(`
      herb:herbs (*)
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Fetch herb bookmarks error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve bookmarked herbs." }, { status: 500 });
  }

  const herbs = (bookmarks || []).map((b: any) => b.herb).filter(Boolean);
  return NextResponse.json(herbs, { status: 200 });
});
