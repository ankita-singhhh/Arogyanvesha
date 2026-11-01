/**
 * Arogyanvesha — Chat Store
 * Manages AI chat conversation state.
 * Handles streaming messages, conversation list, optimistic updates.
 */

import { create } from "zustand";
import type { Message, Conversation } from "@/types";
import { generateId } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   STATE & ACTIONS
───────────────────────────────────────────────────────── */

interface ChatState {
  // Conversation list
  conversations: Conversation[];
  activeConversationId: string | null;

  // Messages for active conversation
  messages: Message[];

  // Streaming state
  isStreaming: boolean;
  streamingMessageId: string | null;

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  // Actions — conversations
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, partial: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;

  // Actions — messages
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;

  // Actions — streaming
  startStreaming: () => string;
  appendStreamChunk: (messageId: string, chunk: string) => void;
  stopStreaming: (messageId: string) => void;

  // Loading
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;

  // Reset
  clearChat: () => void;
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,

  // Conversations
  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) =>
    set({ activeConversationId: id, messages: [] }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, partial) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...partial } : c,
      ),
    })),

  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
      messages:
        state.activeConversationId === id ? [] : state.messages,
    })),

  // Messages
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, partial) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...partial } : m,
      ),
    })),

  // Streaming
  startStreaming: () => {
    const { activeConversationId } = get();
    const messageId = generateId();

    const streamingMessage: Message = {
      id: messageId,
      conversationId: activeConversationId ?? "",
      role: "assistant",
      content: "",
      isStreaming: true,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, streamingMessage],
      isStreaming: true,
      streamingMessageId: messageId,
    }));

    return messageId;
  },

  appendStreamChunk: (messageId, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? { ...m, content: m.content + chunk }
          : m,
      ),
    })),

  stopStreaming: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isStreaming: false } : m,
      ),
      isStreaming: false,
      streamingMessageId: null,
    })),

  // Loading
  setLoadingConversations: (loading) =>
    set({ isLoadingConversations: loading }),

  setLoadingMessages: (loading) =>
    set({ isLoadingMessages: loading }),

  // Reset
  clearChat: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: [],
      isStreaming: false,
      streamingMessageId: null,
    }),
}));