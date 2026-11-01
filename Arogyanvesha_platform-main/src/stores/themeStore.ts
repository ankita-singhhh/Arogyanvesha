/**
 * Arogyanvesha — Theme Store
 * Manages light/dark/system theme preference.
 * Applies .dark class to <html> element.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Theme } from "@/types";

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Store resolved value for SSR hydration
  root.setAttribute("data-theme", resolved);
}

/* ─────────────────────────────────────────────────────────
   STATE & ACTIONS
───────────────────────────────────────────────────────── */

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: Theme = current === "light" ? "dark" : "light";
        get().setTheme(next);
      },
    }),
    {
      name: "arogya-theme",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      partialize: (state) => ({ theme: state.theme }),
      // Re-apply theme on store rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          const resolved =
            state.theme === "system" ? getSystemTheme() : state.theme;
          state.resolvedTheme = resolved;
        }
      },
    },
  ),
);