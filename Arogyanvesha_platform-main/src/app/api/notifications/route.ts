import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve notifications." }, { status: 500 });
  }

  return NextResponse.json(notifications || [], { status: 200 });
});

export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "An array of notification IDs is required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .in("id", ids);

  if (error) {
    console.error("Update notifications read status error:", error);
    return NextResponse.json({ code: "UPDATE_FAILED", message: "Failed to update notification status." }, { status: 500 });
  }

  return NextResponse.json({ message: "Notifications marked as read." }, { status: 200 });
});

export const POST = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Read all notifications error:", error);
    return NextResponse.json({ code: "UPDATE_FAILED", message: "Failed to clear notifications." }, { status: 500 });
  }

  return NextResponse.json({ message: "All notifications marked as read." }, { status: 200 });
});
