const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
}

const API_BASE = `${BACKEND_URL.replace(/\/$/, "")}/api/v1`;

export interface Conversation {
  id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.detail || `Request failed: ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return data as T;
}

export function createConversation(): Promise<Conversation> {
  return request<Conversation>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ title: "New consultation" }),
  });
}

export function getMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  return request<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  );
}

export function sendMessage(
  conversationId: string,
  content: string,
): Promise<ChatMessage> {
  return request<ChatMessage>(
    `/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
  );
}
