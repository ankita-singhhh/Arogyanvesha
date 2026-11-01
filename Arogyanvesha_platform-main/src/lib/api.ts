
/**
 * Arogyanvesha — Axios API Client
 * Single instance used for ALL backend API calls.
 * Never import axios directly anywhere else in the codebase.
 */

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AppError } from "@/types";

type NormalizedAppError = AppError & {
  endpoint?: string;
  responseBody?: unknown;
  errorType?: string;
};

/* ─────────────────────────────────────────────────────────
   INSTANCE
───────────────────────────────────────────────────────── */

// Set NEXT_PUBLIC_API_URL in Vercel to your deployed backend URL.
// Example: https://your-backend.onrender.com/api/v1
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://arogy anvesha-1lfr.onrender.com/api/v1".replace(" ", "");

export const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/+$/, ""),
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ─────────────────────────────────────────────────────────
   REQUEST INTERCEPTOR
   Attaches auth token from localStorage on every request.
───────────────────────────────────────────────────────── */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("arogya_access_token");

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/* ─────────────────────────────────────────────────────────
   RESPONSE INTERCEPTOR
   Normalises errors and handles expired sessions.
───────────────────────────────────────────────────────── */

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; field?: string }>) => {
    const status = error.response?.status;

    // 401 — session expired
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("arogya_access_token");
      window.location.href = "/login?reason=session_expired";
      return Promise.reject(error);
    }

    const appError: NormalizedAppError = {
      code: error.response?.data?.code ?? "UNKNOWN_ERROR",
      message:
        error.response?.data?.message ??
        error.message ??
        "Something went wrong. Please try again.",
      field: error.response?.data?.field ?? null,
      statusCode: status,
      endpoint: error.config?.url,
      responseBody: error.response?.data,
      errorType: "AxiosError",
    };

    return Promise.reject(appError);
  },
);

/* ─────────────────────────────────────────────────────────
   SWR FETCHER
───────────────────────────────────────────────────────── */

export async function swrFetcher<T>(url: string): Promise<T> {
  const response = await api.get<T>(url);
  return response.data;
}

/* ─────────────────────────────────────────────────────────
   SWR CACHE KEYS
───────────────────────────────────────────────────────── */

export const API_KEYS = {
  // Auth
  me: "/auth/me",

  // Prakriti
  prakritiResult: "/prakriti/result",
  prakritiHistory: "/prakriti/history",
  prakritiQuestions: "/prakriti/questions",

  // Chat
  conversations: "/chat/conversations",
  conversation: (id: string) => `/chat/conversations/${id}`,
  messages: (id: string) => `/chat/conversations/${id}/messages`,

  // Symptoms
  symptomAnalysis: "/analyze",

  // Yoga
  yogaSessions: "/yoga/sessions",
  yogaSession: (id: string) => `/yoga/sessions/${id}`,
  yogaFavorites: "/yoga/favorites",
  yogaProgress: "/yoga/progress",

  // Skin
  skinAnalyses: "/skin/analyses",
  skinAnalysis: (id: string) => `/skin/analyses/${id}`,

  // Wisdom
  articles: "/wisdom/articles",
  article: (slug: string) => `/wisdom/articles/${slug}`,

  // Herbs
  herbs: "/herbs",
  herb: (slug: string) => `/herbs/${slug}`,

  // Progress
  healthScore: "/progress/health-score",
  activityFeed: "/progress/activity",
  streak: "/progress/streak",

  // Routine
  routine: "/routine",
  routineLog: "/routine/log",

  // Notifications
  notifications: "/notifications",
} as const;
