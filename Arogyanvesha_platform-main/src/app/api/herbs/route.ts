import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const dosha = url.searchParams.get("dosha"); // vata, pitta, kapha

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from("herbs")
    .select("*")
    .eq("is_published", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (dosha) {
    // Return herbs that decrease (balance) the specified dosha
    const column = `${dosha}_effect`;
    query = query.eq(column, "decreases");
  }

  if (search) {
    // Utilize the FTS index configured in our migrations
    query = query.textSearch("fts", search, {
      config: "english",
      type: "websearch",
    });
  }

  const { data: herbs, error } = await query
    .order("name", { ascending: true })
    .range(start, end);

  if (error) {
    console.error("Fetch herbs database error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve herbs." }, { status: 500 });
  }

  return NextResponse.json(herbs, { status: 200 });
});
