import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { EMERGENCY_KEYWORDS, EMERGENCY_RESPONSE } from "@/lib/ai/prompts";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  // 1. Verify conversation belongs to user
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 });
  }

  // 2. Fetch messages ordered by created_at ASC
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Fetch messages database error:", messagesError);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve messages." }, { status: 500 });
  }

  return NextResponse.json(messages, { status: 200 });
});

export const POST = withApiHandler(async (request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const userPlan = (session.user as any).plan || "free";
  const { id } = await context.params;
  const { content } = await request.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Message content is required." }, { status: 400 });
  }

  // 1. Verify conversation ownership
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .select("id, title, message_count")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 });
  }

  // 2. Check Daily Message Limits
  const today = new Date().toISOString().split("T")[0] ?? "";
  const { data: usage, error: usageError } = await supabase
    .from("chat_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (usageError) {
    console.error("Daily usage lookup error:", usageError);
  }

  const currentCount = usage?.message_count || 0;
  const limits: Record<string, number> = { free: 20, pro: 200, elite: 999999 };
  const userLimit = limits[userPlan] || 20;

  if (currentCount >= userLimit) {
    return NextResponse.json(
      { code: "LIMIT_EXCEEDED", message: `You have reached your daily message limit of ${userLimit} messages for your ${userPlan.toUpperCase()} plan. Please upgrade to continue.` },
      { status: 429 }
    );
  }

  // 3. Emergency Keyword Check (Local Guardrail)
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => content.toLowerCase().includes(kw));
  if (isEmergency) {
    await supabase.from("chat_messages").insert({
      conversation_id: id,
      user_id: userId,
      role: "user",
      content: content.trim(),
    });

    const { data: newAssistantMsg } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: id,
        user_id: userId,
        role: "assistant",
        content: EMERGENCY_RESPONSE,
      })
      .select("*")
      .single();

    await supabase.from("chat_usage").upsert({
      user_id: userId,
      date: today,
      message_count: currentCount + 1,
    }, { onConflict: "user_id,date" });

    await supabase
      .from("chat_conversations")
      .update({
        message_count: (conversation.message_count || 0) + 2,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json(newAssistantMsg, { status: 200 });
  }

  // 4. Save User Message to Database
  await supabase.from("chat_messages").insert({
    conversation_id: id,
    user_id: userId,
    role: "user",
    content: content.trim(),
  });

  // 5. Fetch previous message context (last 10 messages for context)
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(10);

  const formattedMessages = (history || []).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }));

  // Append latest user message if not already present
  if (!formattedMessages.some(m => m.content === content.trim())) {
    formattedMessages.push({ role: "user", content: content.trim() });
  }

  // 6. Build personalized context
  let userPrakritiContext = null;
  try {
    const { data: prakriti } = await supabase
      .from("prakriti_results")
      .select("primary_dosha, secondary_dosha")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    userPrakritiContext = prakriti;
  } catch (prakritiErr) {
    console.warn("Could not fetch prakriti context:", prakritiErr);
  }

  // 7. Call FastAPI Backend Chat Endpoint
  let assistantText = "";
  try {
    const backendRes = await fetch(`${PYTHON_API_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        user_context: userPrakritiContext,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      assistantText = data.reply || "";
    } else {
      console.warn("FastAPI chat returned status:", backendRes.status);
      return NextResponse.json(
        { code: "CHAT_UNAVAILABLE", message: "AI Vaidya is temporarily unavailable. Please try again shortly." },
        { status: backendRes.status >= 500 ? 503 : backendRes.status },
      );
    }
  } catch {
    console.warn("FastAPI chat call failed");
    return NextResponse.json(
      { code: "CHAT_UNAVAILABLE", message: "AI Vaidya is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  if (!assistantText) {
    return NextResponse.json(
      { code: "CHAT_UNAVAILABLE", message: "AI Vaidya did not return a response. Please try again shortly." },
      { status: 503 },
    );
  }

  // 8. Persist the real backend response before returning it. This avoids a
  // synthetic word-by-word stream that could look like a provider stream.
  const { data: assistantMessage, error: messageError } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: id, user_id: userId, role: "assistant", content: assistantText.trim() })
    .select("*")
    .single();
  if (messageError || !assistantMessage) {
    console.error("Could not save AI Vaidya response:", messageError);
    return NextResponse.json({ code: "SAVE_FAILED", message: "AI Vaidya responded, but the message could not be saved. Please try again." }, { status: 500 });
  }

  await supabase.from("chat_usage").upsert({ user_id: userId, date: today, message_count: currentCount + 1 }, { onConflict: "user_id,date" });
  const updates: Record<string, unknown> = {
    message_count: (conversation.message_count || 0) + 2,
    last_message_at: new Date().toISOString(),
  };
  if ((conversation.message_count || 0) === 0) {
    updates.title = content.trim().split(" ").slice(0, 4).join(" ") || "Ayurvedic Consultation";
    await supabase.from("activity_log").insert({ user_id: userId, type: "chat", title: "Started AI Vaidya Consultation", description: `Initiated conversation: "${content.substring(0, 40)}..."` });
  }
  await supabase.from("chat_conversations").update(updates).eq("id", id).eq("user_id", userId);
  return NextResponse.json(assistantMessage, { status: 200 });
});
