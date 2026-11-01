import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  
  // Resolve params
  const { id } = await context.params;

  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !conversation) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json(conversation, { status: 200 });
});

export const PATCH = withApiHandler(async (request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;
  const { title } = await request.json();

  if (!title) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Title is required." }, { status: 400 });
  }

  const { data: updatedConv, error } = await supabase
    .from("chat_conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !updatedConv) {
    return NextResponse.json({ code: "UPDATE_FAILED", message: "Failed to update conversation title." }, { status: 500 });
  }

  return NextResponse.json(updatedConv, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  const { error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ code: "DELETE_FAILED", message: "Failed to delete conversation." }, { status: 500 });
  }

  return NextResponse.json({ message: "Conversation deleted successfully." }, { status: 200 });
});
