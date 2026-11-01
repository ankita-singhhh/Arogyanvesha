import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  await getSession();
  // Query all questions with nested options
  const { data: questions, error } = await supabase
    .from("prakriti_questions")
    .select(`
      id,
      text,
      category,
      order_index,
      options:prakriti_options (
        id,
        text,
        dosha
      )
    `)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Fetch questions database error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve assessment questions." }, { status: 500 });
  }

  return NextResponse.json(questions, { status: 200 });
});
