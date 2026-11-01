import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const { slug } = await context.params;

  const { data: herb, error } = await supabase
    .from("herbs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !herb) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Herb not found." }, { status: 404 });
  }

  return NextResponse.json(herb, { status: 200 });
});
