
import axios from "axios";

// Browser features use the authenticated Next.js BFF.  It owns the session
// cookie and forwards only the narrowly scoped requests that need FastAPI.
// Calling the Python service directly bypassed both the cookie session and
// the ownership checks in the route handlers.
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Next.js API routes (same origin as frontend)
export const webApi = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// A 401 here means the NextAuth cookie session is no longer valid.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const API_KEYS = {
  // Symptoms
  symptoms: "/symptoms/extract",

  // Analysis
  prediction: "/predict",
  symptomAnalysis: "/analyze",

  // RAG and chat
  rag: "/rag/query",
  chat: "/chat",

  // Prakriti
  prakritiResult: "/prakriti/result",
  prakritiHistory: "/prakriti/history",
  prakritiQuestions: "/prakriti/questions",

  // Yoga
  yogaSessions: "/yoga/sessions",
  yogaSession: (id: string | number) => `/yoga/sessions/${id}`,
  yogaFavorites: "/yoga/favorites",
  yogaProgress: "/yoga/progress",

  // Skin analysis
  skinAnalyses: "/skin/analyses",
  skinAnalysis: (id: string | number) => `/skin/analyses/${id}`,

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
};

// Supports named and default imports.
export { api };
export default api;
