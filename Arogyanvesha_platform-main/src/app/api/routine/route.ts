import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const filterByDosha = url.searchParams.get("filterByDosha") === "true";

  let dominantDosha = "all";

  if (filterByDosha) {
    try {
      const session = await getSession();
      const userId = (session.user as any).id;

      const { data: result } = await supabase
        .from("prakriti_results")
        .select("primary_dosha")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (result?.primary_dosha) {
        dominantDosha = result.primary_dosha;
      }
    } catch {
      // Ignored for unauthenticated users / preview modes
    }
  }

  let query = supabase
    .from("routine_practices")
    .select("*")
    .eq("is_active", true);

  if (filterByDosha && dominantDosha !== "all") {
    // Return practices recommended for this dosha OR general practices ('all')
    query = query.in("dosha_recommended", [dominantDosha, "all"]);
  }

  const { data: practices, error } = await query.order("order_index", { ascending: true });

  if (error) {
    console.error("Fetch practices error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve routine library." }, { status: 500 });
  }

  return NextResponse.json(practices, { status: 200 });
});
