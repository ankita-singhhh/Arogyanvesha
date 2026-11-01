"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useChatStore, usePrakritiStore } from "@/stores";
import { api } from "@/lib/api";
import type { WellnessCard } from "@/lib/prakritiWellness";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Conversation } from "@/types";

type DisplayError = { message: string };
type ConversationResponse = {
  id: string;
  user_id: string;
  title: string | null;
  last_message?: string | null;
  message_count?: number | null;
  created_at: string;
  last_message_at?: string | null;
};

function toDisplayError(error: unknown): DisplayError {
  if (typeof error === "object" && error !== null) {
    const candidate = error as { statusCode?: unknown; message?: unknown; code?: unknown };
    const status = candidate.statusCode;
    if (status === 401) return { message: "Your session has expired. Please sign in again." };
    if (status === 403) return { message: "You do not have permission to access this conversation." };
    if (status === 500 || status === 503) return { message: "Chat is temporarily unavailable. Please try again shortly." };
    if (typeof candidate.message === "string" && candidate.message.trim()) return { message: candidate.message };
  }
  if (error instanceof Error) {
    if (error.name === "SyntaxError") return { message: "Chat returned an invalid response. Please try again." };
    if (/network|timeout/i.test(error.message)) return { message: "Unable to reach chat. Check your connection and try again." };
  }
  return { message: "Unable to complete the chat request. Please try again." };
}

/* ─────────────────────────────────────────────────────────
   CONVERSATION CARD
───────────────────────────────────────────────────────── */

function ConversationCard({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        isActive
          ? "bg-brand-burgundy/8 border-brand-burgundy/30 shadow-sm"
          : "bg-surface-card border-border-default hover:shadow-md hover:-translate-y-0.5",
      )}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          isActive ? "bg-brand-burgundy" : "bg-brand-burgundy/10",
        )}>
          <svg className={cn("w-4 h-4", isActive ? "text-text-inverted" : "text-brand-burgundy")}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={cn(
              "text-body-sm font-semibold truncate",
              isActive ? "text-brand-burgundy" : "text-text-heading",
            )}>
              {conversation.title}
            </p>
            <span className="text-micro text-text-muted shrink-0">
              {formatRelativeTime(conversation.updatedAt)}
            </span>
          </div>
          {conversation.lastMessage && (
            <p className="text-label text-text-muted truncate-2 leading-snug">
              {conversation.lastMessage}
            </p>
          )}
          <p className="text-micro text-text-disabled mt-1">
            {conversation.messageCount} messages
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   SUGGESTED QUESTIONS
───────────────────────────────────────────────────────── */

const SUGGESTED_QUESTIONS = [
  "What foods should I eat for my Prakriti?",
  "How do I balance my Vata dosha?",
  "What yoga is best for Pitta types?",
  "Which herbs help with digestion?",
  "How can I improve my sleep naturally?",
  "What is Dinacharya and how do I start?",
];

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function ChatListPage() {
  const router = useRouter();

  const { result: prakritiResult, setResult } = usePrakritiStore();
  const {
    conversations,
    activeConversationId,
    setConversations,
    setActiveConversation,
    addConversation,
  } = useChatStore();

  const [search, setSearch] = React.useState("");
  const [selectedCard, setSelectedCard] = React.useState<WellnessCard | null>(null);
  const [error, setError] = React.useState<DisplayError | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([api.get<ConversationResponse[]>("/chat/conversations"), api.get("/prakriti/result")])
      .then(([conversationsResponse, prakritiResponse]) => {
        if (cancelled) return;
        if (conversationsResponse.data) {
          setConversations(conversationsResponse.data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            title: typeof item.title === "string" && item.title.trim() ? item.title : "Untitled conversation",
            lastMessage: item.last_message ?? null,
            messageCount: item.message_count ?? 0,
            createdAt: item.created_at,
            updatedAt: item.last_message_at ?? item.created_at,
          })));
        }
        if (prakritiResponse.data) {
          setResult(prakritiResponse.data);
        }
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setConversations([]);
          setError(toDisplayError(requestError));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setConversations, setResult]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const startNewChat = async () => {
    if (isCreatingConversation) return;
    setIsCreatingConversation(true);
    setError(null);
    try {
      const response = await api.post<ConversationResponse>("/chat/conversations", { title: "New consultation" });
      const item = response.data;
      if (!item || typeof item.id !== "string") {
        throw new Error("Chat returned an invalid response.");
      }
      const newConv: Conversation = {
        id: item.id,
        userId: item.user_id,
        title: typeof item.title === "string" ? item.title : "New consultation",
        lastMessage: null,
        messageCount: typeof item.message_count === "number" && Number.isFinite(item.message_count) ? item.message_count : 0,
        createdAt: item.created_at,
        updatedAt: item.last_message_at ?? item.created_at,
      };
      addConversation(newConv);
      setActiveConversation(newConv.id);
      router.push(`/chat/${newConv.id}`);
    } catch (requestError) {
      setError(toDisplayError(requestError));
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  };

  // Symptom-specific cards are rendered only by /symptoms/result. AI Vaidya
  // remains a conversation flow rather than another results dashboard.
  const wellnessCards: WellnessCard[] = [];
  const showChatCards = false;

  return (
    <PageContainer className="py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-status-error/30 bg-status-error-bg px-4 py-3 text-body-sm text-status-error">
            {error.message}
          </div>
        )}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-h1 font-display font-bold text-text-heading mb-1">
                AI Vaidya
              </h1>
              <p className="text-body text-text-muted">
                Your personal Ayurvedic health guide, available 24/7
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                </svg>
              }
              onClick={startNewChat}
              disabled={isCreatingConversation}
            >
              New chat
            </Button>
          </div>

          {/* Search */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search conversations…"
            size="md"
          />
        </motion.div>

        {/* Five Personalized Ayurvedic Cards */}
        {prakritiResult && showChatCards ? (
          <section className="mb-8" aria-label="Personalized Ayurvedic Wellness Cards">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-h3 font-display font-bold text-text-heading">
                  Personalized Ayurvedic Guidance
                </h2>
                <p className="text-body-sm text-text-muted">
                  Traditional recommendations calibrated for your{" "}
                  <strong className="text-brand-burgundy capitalize">
                    {prakritiResult.primaryDosha}
                    {prakritiResult.secondaryDosha && prakritiResult.secondaryDosha !== prakritiResult.primaryDosha
                      ? `-${prakritiResult.secondaryDosha}`
                      : ""}{" "}
                    Prakriti
                  </strong>
                  .
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {wellnessCards.map((card) => {
                const isYoga = card.id === "yoga";
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (isYoga) {
                        router.push("/yoga");
                      } else {
                        setSelectedCard(card);
                      }
                    }}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
                      selectedCard?.id === card.id
                        ? "bg-brand-burgundy/10 border-brand-burgundy shadow-sm"
                        : "bg-surface-card border-border-default hover:border-brand-burgundy/40 hover:shadow-md hover:-translate-y-0.5",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl" aria-hidden>{card.icon}</span>
                        {isYoga && (
                          <span className="text-micro font-semibold px-2 py-0.5 rounded-full bg-brand-burgundy/10 text-brand-burgundy">
                            Studio →
                          </span>
                        )}
                      </div>
                      <h3 className="text-body-sm font-bold text-text-heading mt-3 mb-1">
                        {card.title}
                      </h3>
                      <p className="text-micro text-text-muted line-clamp-2 leading-relaxed">
                        {card.shortDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border-default/60 flex items-center justify-between text-micro font-medium text-brand-burgundy">
                      <span>{isYoga ? "Open Studio" : "View Details"}</span>
                      <span aria-hidden>→</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Detail Modal / Drawer */}
            <AnimatePresence>
              {selectedCard && (
                <motion.div
                  key={selectedCard.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className="mt-5 p-6 rounded-2xl bg-surface-card border border-brand-gold/30 shadow-md relative"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCard(null)}
                    aria-label="Close guidance details"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-bg-subtle hover:text-text-heading transition-colors"
                  >
                    ✕
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl" aria-hidden>{selectedCard.icon}</span>
                    <div>
                      <h3 className="text-h3 font-bold text-text-heading">
                        {selectedCard.title}
                      </h3>
                      <p className="text-label text-brand-burgundy font-medium">
                        {selectedCard.focusArea}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-border-default">
                    {selectedCard.sections?.map((section, idx) => (
                      <div key={idx} className="bg-bg-base/70 p-4 rounded-xl border border-border-default/50">
                        <h4 className="text-body-sm font-bold text-text-heading mb-2.5 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-gold" />
                          {section.heading}
                        </h4>
                        <ul className="space-y-2">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-body-sm text-text-body flex items-start gap-2 leading-relaxed">
                              <span className="text-brand-burgundy font-bold text-micro mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border-default/60 flex items-center justify-between text-micro text-text-muted">
                    <span>Traditional Ayurvedic wellness education. Not a clinical prescription or medical diagnosis.</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCard(null)}>
                      Close
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ) : null}

        {/* New chat hero — if no conversations */}
        {conversations.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* AI avatar */}
            <div className="w-20 h-20 rounded-2xl bg-brand-burgundy flex items-center justify-center mx-auto mb-6 shadow-burgundy">
              <svg className="w-10 h-10 text-text-inverted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
            </div>

            <h2 className="text-h2 font-display font-bold text-text-heading mb-3">
              Meet your AI Vaidya
            </h2>
            <p className="text-body text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
              Ask anything about Ayurveda, your Prakriti, herbs, diet, yoga, or daily wellness.
              Grounded in classical texts and evidence-based principles.
            </p>

            {/* Suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q}
                  type="button"
                  onClick={startNewChat}
                  className={cn(
                    "text-left p-4 rounded-xl border border-border-default",
                    "bg-surface-card hover:border-brand-burgundy/40 hover:shadow-md",
                    "transition-all duration-200 text-body-sm text-text-body font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
                  )}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  whileHover={{ y: -2 }}
                >
                  <span className="text-brand-gold mr-2">✦</span>
                  {q}
                </motion.button>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={startNewChat}
              className="bg-gradient-burgundy border-0 shadow-burgundy"
            >
              Start your first conversation
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversation list */}
            <div className="md:col-span-1 flex flex-col gap-3">
              <p className="text-label font-semibold text-text-muted uppercase tracking-wider mb-1">
                Recent Conversations
              </p>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <EmptyState
                    variant="no-chat"
                    title="No conversations found"
                    description="Try a different search term or start a new chat."
                    size="inline"
                  />
                ) : (
                  filtered.map((conv, i) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <ConversationCard
                        conversation={conv}
                        isActive={activeConversationId === conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Right panel — new chat prompt */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-border-strong bg-bg-subtle">
              <div className="w-16 h-16 rounded-2xl bg-brand-burgundy/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
                </svg>
              </div>
              <h3 className="text-h4 font-semibold text-text-heading mb-2">
                Select or start a conversation
              </h3>
              <p className="text-body-sm text-text-muted text-center max-w-xs mb-6">
                Choose a conversation from the list, or start a new consultation with your AI Vaidya.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={startNewChat}
                    className={cn(
                      "text-left p-3 rounded-lg border border-border-default bg-surface-card",
                      "text-body-sm text-text-muted hover:border-brand-burgundy/40 hover:text-text-body",
                      "transition-all duration-150",
                    )}
                  >
                    <span className="text-brand-gold mr-1.5">✦</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
