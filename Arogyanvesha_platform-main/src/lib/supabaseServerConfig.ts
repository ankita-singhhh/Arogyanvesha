export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase server configuration is incomplete.");
    this.name = "SupabaseConfigurationError";
  }
}

/** Selects only a server-only key; callers must not expose this result to clients. */
export function resolveSupabaseServerConfiguration(environment: Record<string, string | undefined>) {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const key = environment.SUPABASE_SECRET_KEY || environment.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key.startsWith("sb_publishable_")) throw new SupabaseConfigurationError();
  return { url, key };
}
