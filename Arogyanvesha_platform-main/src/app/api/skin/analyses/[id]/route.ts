import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  const { data: analysis, error } = await supabase
    .from("skin_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !analysis) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Skin analysis not found." }, { status: 404 });
  }

  // Generate public storage URL for display
  const { data: { publicUrl } } = supabase.storage.from("skin-images").getPublicUrl(analysis.image_path);

  return NextResponse.json({
    ...analysis,
    imageUrl: publicUrl,
  }, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  // Find image path first
  const { data: analysis } = await supabase
    .from("skin_analyses")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (analysis) {
    // Delete from Supabase Storage
    await supabase.storage.from("skin-images").remove([analysis.image_path]);
  }

  const { error } = await supabase
    .from("skin_analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ code: "DELETE_FAILED", message: "Failed to delete record." }, { status: 500 });
  }

  return NextResponse.json({ message: "Skin analysis record deleted." }, { status: 200 });
});
