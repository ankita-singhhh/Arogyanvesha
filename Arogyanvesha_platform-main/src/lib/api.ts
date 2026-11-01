
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://arogyanvesha-1lfr.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the saved access token to API requests.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("arogya_access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Clear an expired/invalid token and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("arogya_access_token");

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

// Supports both named and default imports.
export { api };
export default api;
