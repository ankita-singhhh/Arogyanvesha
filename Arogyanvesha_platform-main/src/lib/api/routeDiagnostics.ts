import type { PostgrestError } from "@supabase/supabase-js";

export type ApiFailureKind = "configuration" | "authorization" | "schema" | "database";

const SCHEMA_ERROR_CODES = new Set(["PGRST205", "PGRST204", "42P01", "42703"]);

export function classifyDatabaseError(error: PostgrestError | null | undefined): ApiFailureKind {
  if (error?.code === "42501") return "authorization";
  if (error?.code && SCHEMA_ERROR_CODES.has(error.code)) return "schema";
  return "database";
}

/** Logs only operational metadata. Never include query values, records, tokens, or health data. */
export function logDatabaseFailure(
  route: string,
  operation: string,
  error: PostgrestError | null | undefined,
  authenticated: boolean,
) {
  console.error("API database operation failed", {
    route,
    operation,
    authenticated,
    failureKind: classifyDatabaseError(error),
    supabaseCode: error?.code ?? null,
    // Supabase's message describes the failed relation/column, not returned rows.
    supabaseMessage: error?.message ?? "Unknown database error",
    supabaseHint: error?.hint ?? null,
  });
}
