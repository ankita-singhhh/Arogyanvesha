/**
 * Arogyanvesha — Auth Store
 * Manages user session, login/logout state.
 * Source of truth for: current user, auth status, token.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppUser } from "@/types";

/* ─────────────────────────────────────────────────────────
   STATE & ACTIONS
───────────────────────────────────────────────────────── */

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AppUser) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (partial: Partial<AppUser>) => void;
  logout: () => void;
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setToken: (token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("arogya_access_token", token);
        }
        set({ accessToken: token });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("arogya_access_token");
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "arogya-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      // Only persist user and token — not loading state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);