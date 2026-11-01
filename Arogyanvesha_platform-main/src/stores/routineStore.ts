/**
 * Arogyanvesha — Routine Store
 * Manages daily Dinacharya routine tracking.
 * Persisted so completion state survives refresh.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RoutinePractice } from "@/types";

/* ─────────────────────────────────────────────────────────
   STATE & ACTIONS
───────────────────────────────────────────────────────── */

interface DailyLog {
  date: string; // YYYY-MM-DD
  completedIds: string[];
}

interface RoutineState {
  practices: RoutinePractice[];
  todayLog: DailyLog | null;
  history: DailyLog[];
  isLoading: boolean;

  // Actions
  setPractices: (practices: RoutinePractice[]) => void;
  markComplete: (practiceId: string) => void;
  markIncomplete: (practiceId: string) => void;
  togglePractice: (practiceId: string) => void;
  setLoading: (loading: boolean) => void;
  resetToday: () => void;

  // Computed helpers
  getCompletionPercentage: () => number;
  isCompleted: (practiceId: string) => boolean;
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function getOrCreateTodayLog(state: RoutineState): DailyLog {
  const today = getTodayDate();
  if (state.todayLog?.date === today) return state.todayLog;
  return { date: today, completedIds: [] };
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      practices: [],
      todayLog: null,
      history: [],
      isLoading: false,

      setPractices: (practices) => set({ practices }),

      markComplete: (practiceId) => {
        const todayLog = getOrCreateTodayLog(get());
        if (todayLog.completedIds.includes(practiceId)) return;
        const updated = {
          ...todayLog,
          completedIds: [...todayLog.completedIds, practiceId],
        };
        set((state) => ({
          todayLog: updated,
          history: updateHistory(state.history, updated),
        }));
      },

      markIncomplete: (practiceId) => {
        const todayLog = getOrCreateTodayLog(get());
        const updated = {
          ...todayLog,
          completedIds: todayLog.completedIds.filter((id) => id !== practiceId),
        };
        set((state) => ({
          todayLog: updated,
          history: updateHistory(state.history, updated),
        }));
      },

      togglePractice: (practiceId) => {
        const { isCompleted, markComplete, markIncomplete } = get();
        if (isCompleted(practiceId)) {
          markIncomplete(practiceId);
        } else {
          markComplete(practiceId);
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      resetToday: () => {
        const today = getTodayDate();
        set({ todayLog: { date: today, completedIds: [] } });
      },

      getCompletionPercentage: () => {
        const { practices, todayLog } = get();
        if (!practices.length) return 0;
        const completed = todayLog?.completedIds.length ?? 0;
        return Math.round((completed / practices.length) * 100);
      },

      isCompleted: (practiceId) => {
        const { todayLog } = get();
        return todayLog?.completedIds.includes(practiceId) ?? false;
      },
    }),
    {
      name: "arogya-routine",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      partialize: (state) => ({
        todayLog: state.todayLog,
        history: state.history,
      }),
    },
  ),
);

/* ─────────────────────────────────────────────────────────
   HISTORY HELPER
───────────────────────────────────────────────────────── */

function updateHistory(history: DailyLog[], updated: DailyLog): DailyLog[] {
  const exists = history.findIndex((h) => h.date === updated.date);
  if (exists >= 0) {
    return history.map((h, i) => (i === exists ? updated : h));
  }
  return [updated, ...history].slice(0, 90); // Keep 90 days
}