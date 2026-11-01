/**
 * Arogyanvesha — Prakriti Store
 * Manages the 20-question Prakriti quiz flow state.
 * Persisted so users can resume a quiz after refresh.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PrakritiResult, PrakritiQuestion, Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   ANSWER SHAPE
───────────────────────────────────────────────────────── */

interface QuizAnswer {
  questionId: number;
  selectedOptionId: string;
  dosha: Dosha;
}

/* ─────────────────────────────────────────────────────────
   STATE & ACTIONS
───────────────────────────────────────────────────────── */

type QuizStatus = "idle" | "in-progress" | "analyzing" | "complete";

interface PrakritiState {
  // Quiz flow
  status: QuizStatus;
  currentQuestionIndex: number;
  questions: PrakritiQuestion[];
  answers: QuizAnswer[];

  // Result
  result: PrakritiResult | null;
  history: PrakritiResult[];

  // Actions
  startQuiz: (questions: PrakritiQuestion[]) => void;
  answerQuestion: (answer: QuizAnswer) => void;
  goToPreviousQuestion: () => void;
  setAnalyzing: () => void;
  setResult: (result: PrakritiResult) => void;
  setHistory: (history: PrakritiResult[]) => void;
  resetQuiz: () => void;
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */

export const usePrakritiStore = create<PrakritiState>()(
  persist(
    (set, get) => ({
      status: "idle",
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      result: null,
      history: [],

      startQuiz: (questions) =>
        set({
          status: "in-progress",
          questions,
          currentQuestionIndex: 0,
          answers: [],
        }),

      answerQuestion: (answer) => {
        const { answers, questions, currentQuestionIndex } = get();

        // Replace answer if question was already answered
        const existingIndex = answers.findIndex(
          (a) => a.questionId === answer.questionId,
        );

        const updatedAnswers =
          existingIndex >= 0
            ? answers.map((a, i) => (i === existingIndex ? answer : a))
            : [...answers, answer];

        const isLast = currentQuestionIndex === questions.length - 1;

        set({
          answers: updatedAnswers,
          currentQuestionIndex: isLast
            ? currentQuestionIndex
            : currentQuestionIndex + 1,
          status: isLast ? "in-progress" : "in-progress",
        });
      },

      goToPreviousQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        })),

      setAnalyzing: () => set({ status: "analyzing" }),

      setResult: (result) =>
        set((state) => ({
          result,
          status: "complete",
          history: [result, ...state.history].slice(0, 10),
        })),

      setHistory: (history) => set({ history }),

      resetQuiz: () =>
        set({
          status: "idle",
          currentQuestionIndex: 0,
          questions: [],
          answers: [],
        }),
    }),
    {
      name: "arogya-prakriti",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      partialize: (state) => ({
        status: state.status,
        currentQuestionIndex: state.currentQuestionIndex,
        questions: state.questions,
        answers: state.answers,
        result: state.result,
        history: state.history,
      }),
    },
  ),
);