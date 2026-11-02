
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getSupabaseServerClient } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import {
  EMERGENCY_KEYWORDS,
  EMERGENCY_RESPONSE,
} from "@/lib/ai/prompts";

const PYTHON_API_URL = process.env.PYTHON_API_URL;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function getUserId(session: Awaited<ReturnType<typeof getSession>>) {
  return (session.user as { id: string }).id;
}

async function getOwnedConversation(
  conversationId: string,
  userId: string
) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id, title, message_count")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

/* GET: retrieve conversation messages */
export const GET = withApiHandler(
  async (_request: NextRequest, context: RouteContext) => {
    const session = await getSession();
    const userId = getUserId(session);
    const { id } = await context.params;
    const supabase = getSupabaseServerClient();

    const conversation = await getOwnedConversation(id, userId);

    if (!conversation) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Conversation not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", id)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch messages database error:", error);

      return NextResponse.json(
        {
          code: "FETCH_FAILED",
          message: "Failed to retrieve messages.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  }
);

/* POST: save user message, generate assistant reply, persist both */
export const POST = withApiHandler(
  async (request: NextRequest, context: RouteContext) => {
    const session = await getSession();
    const user = session.user as { id: string; plan?: string };
    const userId = user.id;
    const userPlan = user.plan || "free";
    const { id } = await context.params;
    const supabase = getSupabaseServerClient();

    const body = await request.json().catch(() => null);
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        {
          code: "BAD_REQUEST",
          message: "Message content is required.",
        },
        { status: 400 }
      );
    }

    const conversation = await getOwnedConversation(id, userId);

    if (!conversation) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Conversation not found." },
        { status: 404 }
      );
    }

    // Daily message limit
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage, error: usageError } = await supabase
      .from("chat_usage")
      .select("message_count")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (usageError) {
      console.error("Daily usage lookup error:", usageError);

      return NextResponse.json(
        {
          code: "USAGE_LOOKUP_FAILED",
          message: "Could not check your daily message usage.",
        },
        { status: 500 }
      );
    }

    const currentCount = usage?.message_count ?? 0;
    const limits: Record<string, number> = {
      free: 20,
      pro: 200,
      elite: 999999,
    };
    const userLimit = limits[userPlan] ?? limits.free;

    if (currentCount >= userLimit) {
      return NextResponse.json(
        {
          code: "LIMIT_EXCEEDED",
          message: `You have reached your daily message limit of ${userLimit} messages for your ${userPlan.toUpperCase()} plan. Please upgrade to continue.`,
        },
        { status: 429 }
      );
    }

    // Emergency response: persist both messages and return without calling AI.
    const isEmergency = EMERGENCY_KEYWORDS.some((keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ));

    if (isEmergency) {
      const { data: userMessage, error: userInsertError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: id,
          user_id: userId,
          role: "user",
          content,
        })
        .select("*")
        .single();

      if (userInsertError || !userMessage) {
        console.error("Could not save emergency user message:", userInsertError);

        return NextResponse.json(
          { code: "SAVE_FAILED", message: "Could not save your message." },
          { status: 500 }
        );
      }

      const { data: assistantMessage, error: assistantInsertError } =
        await supabase
          .from("chat_messages")
          .insert({
            conversation_id: id,
            user_id: userId,
            role: "assistant",
            content: EMERGENCY_RESPONSE,
          })
          .select("*")
          .single();

      if (assistantInsertError || !assistantMessage) {
        console.error(
          "Could not save emergency response:",
          assistantInsertError
        );

        return NextResponse.json(
          {
            code: "SAVE_FAILED",
            message: "Could not save the emergency response.",
          },
          { status: 500 }
        );
      }

      await supabase.from("chat_usage").upsert(
        {
          user_id: userId,
          date: today,
          message_count: currentCount + 1,
        },
        { onConflict: "user_id,date" }
      );

      await supabase
        .from("chat_conversations")
        .update({
          message_count: (conversation.message_count ?? 0) + 2,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId);

      return NextResponse.json(assistantMessage, { status: 200 });
    }

    // Fetch the most recent 9 existing messages, then append this user message.
    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("conversation_id", id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(9);

    if (historyError) {
      console.error("Chat history lookup error:", historyError);

      return NextResponse.json(
        {
          code: "HISTORY_FAILED",
          message: "Failed to retrieve chat history.",
        },
        { status: 500 }
      );
    }

    const formattedMessages: ChatMessage[] = (history ?? [])
      .reverse()
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      }));

    formattedMessages.push({ role: "user", content });

    // Fetch latest Prakriti result for personalization.
    const { data: prakriti, error: prakritiError } = await supabase
      .from("prakriti_results")
      .select("primary_dosha, secondary_dosha")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prakritiError) {
      console.warn("Could not fetch Prakriti context:", prakritiError);
    }

    if (!PYTHON_API_URL) {
      console.error("PYTHON_API_URL environment variable is missing.");

      return NextResponse.json(
        {
          code: "CHAT_UNAVAILABLE",
          message: "AI Vaidya is not configured yet.",
        },
        { status: 503 }
      );
    }

    // Generate the response through FastAPI.
    let assistantText = "";

    try {
      const backendResponse = await fetch(
        `${PYTHON_API_URL.replace(/\/$/, "")}/api/v1/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: formattedMessages,
            user_context: prakriti ?? null,
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!backendResponse.ok) {
        const backendError = await backendResponse.text().catch(() => "");
        console.error(
          "FastAPI chat failed:",
          backendResponse.status,
          backendError
        );

        return NextResponse.json(
          {
            code: "CHAT_UNAVAILABLE",
            message:
              "AI Vaidya is temporarily unavailable. Please try again shortly.",
          },
          { status: backendResponse.status >= 500 ? 503 : backendResponse.status }
        );
      }

      const responseData = await backendResponse.json();

      // Adjust this field if your FastAPI ChatResponse uses another name.
      assistantText =
        typeof responseData.reply === "string"
          ? responseData.reply
          : typeof responseData.response === "string"
            ? responseData.response
            : typeof responseData.answer === "string"
              ? responseData.answer
              : "";

    } catch (error) {
      console.error("FastAPI chat request failed:", error);

      return NextResponse.json(
        {
          code: "CHAT_UNAVAILABLE",
          message:
            "AI Vaidya is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    if (!assistantText.trim()) {
      console.error("FastAPI returned no recognized response text.");

      return NextResponse.json(
        {
          code: "EMPTY_RESPONSE",
          message: "AI Vaidya did not return a response.",
        },
        { status: 503 }
      );
    }

    // Persist messages only after AI generation succeeds.
    const { data: userMessage, error: userInsertError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: id,
        user_id: userId,
        role: "user",
        content,
      })
      .select("*")
      .single();

    if (userInsertError || !userMessage) {
      console.error("Could not save user message:", userInsertError);

      return NextResponse.json(
        { code: "SAVE_FAILED", message: "Could not save your message." },
        { status: 500 }
      );
    }

    const { data: assistantMessage, error: assistantInsertError } =
      await supabase
        .from("chat_messages")
        .insert({
          conversation_id: id,
          user_id: userId,
          role: "assistant",
          content: assistantText.trim(),
        })
        .select("*")
        .single();

    if (assistantInsertError || !assistantMessage) {
      console.error(
        "Could not save assistant response:",
        assistantInsertError
      );

      return NextResponse.json(
        {
          code: "SAVE_FAILED",
          message: "AI Vaidya responded, but the reply could not be saved.",
        },
        { status: 500 }
      );
    }

    await supabase.from("chat_usage").upsert(
      {
        user_id: userId,
        date: today,
        message_count: currentCount + 1,
      },
      { onConflict: "user_id,date" }
    );

    const updates: Record<string, unknown> = {
      message_count: (conversation.message_count ?? 0) + 2,
      last_message_at: new Date().toISOString(),
    };

    if ((conversation.message_count ?? 0) === 0) {
      updates.title =
        content.split(/\s+/).slice(0, 4).join(" ") ||
        "Ayurvedic Consultation";

      await supabase.from("activity_log").insert({
        user_id: userId,
        type: "chat",
        title: "Started AI Vaidya Consultation",
        description: `Initiated conversation: "${content.slice(0, 40)}..."`,
      });
    }

    await supabase
      .from("chat_conversations")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    return NextResponse.json(assistantMessage, { status: 200 });
  }
);
