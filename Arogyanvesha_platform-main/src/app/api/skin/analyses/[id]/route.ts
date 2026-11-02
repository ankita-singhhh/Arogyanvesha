import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
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

  // The skin-images bucket must be private. A short-lived signed URL is only
  // created after the record has been scoped to the authenticated owner.
  const { data: signedImage, error: signedUrlError } = await supabase.storage
    .from("skin-images")
    .createSignedUrl(analysis.image_path, 60 * 10);

  if (signedUrlError) {
    console.error("Skin image signed URL error:", signedUrlError);
  }

  return NextResponse.json({
    ...analysis,
    imageUrl: signedImage?.signedUrl ?? null,
  }, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
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
