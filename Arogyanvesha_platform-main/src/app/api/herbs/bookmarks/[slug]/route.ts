import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { slug } = await context.params;

  // 1. Look up herb ID by slug
  const { data: herb, error: lookupError } = await supabase
    .from("herbs")
    .select("id")
    .eq("slug", slug)
    .single();

  if (lookupError || !herb) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Herb not found." }, { status: 404 });
  }

  // 2. Insert into herb_bookmarks
  const { error } = await supabase
    .from("herb_bookmarks")
    .upsert({ user_id: userId, herb_id: herb.id });

  if (error) {
    console.error("Bookmark herb error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to bookmark herb." }, { status: 500 });
  }

  return NextResponse.json({ message: "Herb bookmarked successfully." }, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { slug } = await context.params;

  // 1. Look up herb ID by slug
  const { data: herb, error: lookupError } = await supabase
    .from("herbs")
    .select("id")
    .eq("slug", slug)
    .single();

  if (lookupError || !herb) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Herb not found." }, { status: 404 });
  }

  // 2. Delete from herb_bookmarks
  const { error } = await supabase
    .from("herb_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("herb_id", herb.id);

  if (error) {
    console.error("Remove herb bookmark error:", error);
    return NextResponse.json({ code: "ACTION_FAILED", message: "Failed to remove herb bookmark." }, { status: 500 });
  }

  return NextResponse.json({ message: "Herb bookmark removed successfully." }, { status: 200 });
});
