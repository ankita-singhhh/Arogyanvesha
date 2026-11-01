import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  // 1. Get base user subscription tier
  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  // 2. Fetch latest active or trialing record
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve billing status." }, { status: 500 });
  }

  return NextResponse.json({
    plan: user?.plan || "free",
    subscription: subscription || null,
  }, { status: 200 });
});
