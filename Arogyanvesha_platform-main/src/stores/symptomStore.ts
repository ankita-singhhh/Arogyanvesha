
import { create } from "zustand";
import axios from "axios";
import { api } from "@/lib/api";

export interface CandidateCondition {
  condition: string;
  probability: number;
  score_type: string;
  rank: number;
}

export interface RAGPassage {
  document_id: string;
  condition: string;
  category: string;
  content: string;
  source_id?: string;
  source_name?: string;
  organization?: string;
  url?: string;
  knowledge_type?: string;
  similarity_score?: number;
}

export interface AnalysisResult {
  status: string;
  is_emergency: boolean;
  emergency_message?: string | null;
  urgency: "low" | "medium" | "high" | "emergency";
  original_symptom_text: string;
  recognized_symptoms: string[];
  unmatched_symptoms?: string[];
  clarification_needed?: boolean;
  clarification_questions?: string[];
  candidate_conditions: CandidateCondition[];
  analysis_source?: string;
  dosha_imbalance: string;
  ayurvedic_explanation: string;
  traditional_perspective?: string;
  ayurvedic_citations?: string[];
  ayurvedic_citation_urls?: string[];
  traditional_perspective_citations?: string[];
  evidence_grounded_summary: string;
  retrieved_evidence: RAGPassage[];
  wellness_cards?: WellnessCard[];
  recommendations: string[];
  herbs: string[];
  lifestyle_guidance: string[];
  warning_signs: string[];
  when_to_seek_care: string;
  disclaimer: string;
}

export interface WellnessCard {
  id: string;
  title: string;
  icon: string;
  recommendation: string;
  category?: string;
  ayurvedic_context?: string;
  safety_precautions?: string;
  details?: string;
  evidence_status?: string;
  citations?: string[];
  citation_urls?: string[];
}

export type LoadingStage =
  | "idle"
  | "extracting"
  | "predicting"
  | "retrieving"
  | "synthesizing";

interface SymptomState {
  symptomText: string;
  selectedSymptoms: string[];
  duration: string;
  severity: number;
  bodyAreas: string[];
  isLoading: boolean;
  loadingStage: LoadingStage;
  error: string | null;
  result: AnalysisResult | null;

  setSymptomText: (text: string) => void;
  toggleSymptomChip: (symptom: string) => void;
  removeSymptomChip: (symptom: string) => void;
  addSymptomChip: (symptom: string) => void;
  setDuration: (duration: string) => void;
  setSeverity: (severity: number) => void;
  toggleBodyArea: (area: string) => void;
  setLoadingStage: (stage: LoadingStage) => void;
  analyze: (routerPush: (path: string) => void) => Promise<void>;
  reset: () => void;
}

function getAnalysisErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: unknown; detail?: unknown }
      | undefined;

    const detail = Array.isArray(data?.detail)
      ? data.detail
          .map((item) => item?.msg)
          .filter(
            (message): message is string => typeof message === "string"
          )
          .join(" ")
      : data?.detail;

    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof detail === "string"
          ? detail
          : "";

    if (message) return message;
    if (error.code === "ECONNABORTED") {
      return "The analysis request timed out. Please try again.";
    }
    if (!error.response) {
      return "Unable to reach the symptom analysis service. Check your connection and try again.";
    }

    return `Symptom analysis failed (${error.response.status}). Please try again.`;
  }

  if (error instanceof Error) {
    if (error.name === "SyntaxError") {
      return "The analysis service returned an invalid response. Please try again.";
    }
    return error.message || "Failed to analyze symptoms. Please try again.";
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: unknown;
      statusCode?: unknown;
    };

    if (
      typeof candidate.message === "string" &&
      candidate.message.trim()
    ) {
      return candidate.message;
    }

    if (typeof candidate.statusCode === "number") {
      return `Symptom analysis failed (${candidate.statusCode}). Please try again.`;
    }
  }

  return "Failed to analyze symptoms. Please try again.";
}

const SENSITIVE_KEY =
  /authorization|cookie|token|secret|password|api[-_]?key|symptom|health|medical|body|payload|request/i;

const SAFE_RESPONSE_KEY =
  /^(code|message|detail|error|errors|status|statusCode|type|title)$/i;

function safeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;

  return value
    .replace(/(bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/([?&](?:token|key|secret|password)=[^&\s]+)/gi, "[REDACTED]")
    .slice(0, 500);
}

function safeResponseBody(
  value: unknown
): Record<string, unknown> | string | null {
  if (typeof value === "string") return safeText(value) || null;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const safe: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key) || !SAFE_RESPONSE_KEY.test(key)) {
      continue;
    }

    if (typeof item === "string") {
      safe[key] = safeText(item);
    } else if (
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null
    ) {
      safe[key] = item;
    } else if (Array.isArray(item)) {
      safe[key] = item
        .slice(0, 5)
        .map(
          (entry) =>
            safeResponseBody(entry) ?? safeText(entry, "[unavailable]")
        );
    } else {
      safe[key] = safeResponseBody(item);
    }
  }

  return Object.keys(safe).length ? safe : null;
}

function logAnalysisFailure(error: unknown): void {
  const fallbackEndpoint = "/api/v1/analyze";
  const diagnostic: Record<string, unknown> = {
    endpoint: fallbackEndpoint,
    errorType: typeof error,
  };

  if (axios.isAxiosError(error)) {
    diagnostic.errorType = "AxiosError";
    diagnostic.message = safeText(error.message, "Axios request failed");
    diagnostic.code = error.code ?? null;
    diagnostic.status = error.response?.status ?? null;
    diagnostic.endpoint =
      safeText(error.config?.url, fallbackEndpoint).split("?")[0] ||
      fallbackEndpoint;
    diagnostic.responseBody = safeResponseBody(error.response?.data);
  } else if (error instanceof Error) {
    diagnostic.errorType = error.name || "Error";
    diagnostic.message = safeText(error.message, "Error without a message");

    const cause = error.cause;
    if (cause instanceof Error) {
      diagnostic.cause = {
        name: cause.name,
        message: safeText(cause.message),
      };
    }
  } else if (typeof error === "string") {
    diagnostic.errorType = "string";
    diagnostic.message = safeText(error, "Error string was empty");
  } else if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      code?: unknown;
      status?: unknown;
      statusCode?: unknown;
      response?: unknown;
      responseBody?: unknown;
      endpoint?: unknown;
      url?: unknown;
      errorType?: unknown;
    };

    diagnostic.errorType =
      typeof candidate.errorType === "string"
        ? candidate.errorType
        : "object";
    diagnostic.message = safeText(
      candidate.message,
      "Plain error object without a message"
    );
    diagnostic.code =
      typeof candidate.code === "string" ? candidate.code : null;
    diagnostic.status =
      typeof candidate.status === "number"
        ? candidate.status
        : typeof candidate.statusCode === "number"
          ? candidate.statusCode
          : null;
    diagnostic.endpoint =
      safeText(candidate.endpoint ?? candidate.url, fallbackEndpoint)
        .split("?")[0] || fallbackEndpoint;
    diagnostic.responseBody = safeResponseBody(
      candidate.responseBody ?? candidate.response
    );
  } else {
    diagnostic.message =
      error === null ? "null error value" : "undefined error value";
  }

  console.error(
    `Symptom analysis failed: ${JSON.stringify(diagnostic)}`
  );
}

export const useSymptomStore = create<SymptomState>((set, get) => ({
  symptomText: "",
  selectedSymptoms: [],
  duration: "1-3 days",
  severity: 5,
  bodyAreas: [],
  isLoading: false,
  loadingStage: "idle",
  error: null,
  result: null,

  setSymptomText: (text) => set({ symptomText: text }),

  toggleSymptomChip: (symptom) => {
    const { selectedSymptoms } = get();

    set({
      selectedSymptoms: selectedSymptoms.includes(symptom)
        ? selectedSymptoms.filter((s) => s !== symptom)
        : [...selectedSymptoms, symptom],
    });
  },

  addSymptomChip: (symptom) => {
    const { selectedSymptoms } = get();
    const clean = typeof symptom === "string" ? symptom.trim() : "";

    if (clean && !selectedSymptoms.includes(clean)) {
      set({ selectedSymptoms: [...selectedSymptoms, clean] });
    }
  },

  removeSymptomChip: (symptom) => {
    const { selectedSymptoms } = get();
    set({
      selectedSymptoms: selectedSymptoms.filter((s) => s !== symptom),
    });
  },

  setDuration: (duration) => set({ duration }),
  setSeverity: (severity) => set({ severity }),

  toggleBodyArea: (area) => {
    const { bodyAreas } = get();

    set({
      bodyAreas: bodyAreas.includes(area)
        ? bodyAreas.filter((a) => a !== area)
        : [...bodyAreas, area],
    });
  },

  setLoadingStage: (loadingStage) => set({ loadingStage }),

  analyze: async (routerPush) => {
    const {
      symptomText,
      selectedSymptoms,
      duration,
      severity,
      bodyAreas,
    } = get();

    set({
      isLoading: true,
      error: null,
      loadingStage: "extracting",
    });

    try {
      // Simulated progress stages for UI feedback.
      const stageTimers = [
        setTimeout(() => {
          if (get().isLoading) set({ loadingStage: "predicting" });
        }, 700),
        setTimeout(() => {
          if (get().isLoading) set({ loadingStage: "retrieving" });
        }, 1400),
        setTimeout(() => {
          if (get().isLoading) set({ loadingStage: "synthesizing" });
        }, 2100),
      ];

      try {
        // api baseURL should already include /api/v1.
        const response = await api.post<AnalysisResult>(
          "/analyze",
          {
            symptomText: symptomText?.trim() ?? "",
            symptomChips: selectedSymptoms,
            duration,
            severity,
            bodyAreas,
          }
        );

        set({
          result: response.data,
          isLoading: false,
          loadingStage: "idle",
        });

        routerPush("/symptoms/result");
      } finally {
        stageTimers.forEach(clearTimeout);
      }
    } catch (err: unknown) {
      logAnalysisFailure(err);

      set({
        error: getAnalysisErrorMessage(err),
        isLoading: false,
        loadingStage: "idle",
      });
    }
  },

  reset: () =>
    set({
      symptomText: "",
      selectedSymptoms: [],
      duration: "1-3 days",
      severity: 5,
      bodyAreas: [],
      isLoading: false,
      loadingStage: "idle",
      error: null,
      result: null,
    }),
}));
