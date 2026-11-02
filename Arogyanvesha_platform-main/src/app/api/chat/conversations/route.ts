
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getSupabaseServerClient } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { logDatabaseFailure } from "@/lib/api/routeDiagnostics";

export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
  const supabase = getSupabaseServerClient();

  const url = new URL(request.url);
  const page = Math.max(
    1,
    Number.parseInt(url.searchParams.get("page") || "1", 10) || 1
  );
  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(url.searchParams.get("limit") || "10", 10) || 10
    )
  );

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .range(start, end);

  if (error) {
    logDatabaseFailure(
      "/api/chat/conversations",
      "select chat_conversations",
      error,
      true
    );

    return NextResponse.json(
      {
        code: "FETCH_FAILED",
        message: "Failed to retrieve conversations.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? [], { status: 200 });
}, "/api/chat/conversations");

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;
  const supabase = getSupabaseServerClient();

  const body = await request.json().catch(() => null);

  if (body === null) {
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message: "Request body must be valid JSON.",
      },
      { status: 400 }
    );
  }

  const title =
    typeof body?.title === "string" ? body.title.trim().slice(0, 200) : "";

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: userId,
      title: title || "New Conversation",
      last_message_at: new Date().toISOString(),
      message_count: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    logDatabaseFailure(
      "/api/chat/conversations",
      "insert chat_conversations",
      error,
      true
    );

    return NextResponse.json(
      {
        code: "CREATE_FAILED",
        message: "Failed to start new conversation.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}, "/api/chat/conversations");
