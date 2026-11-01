import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveSupabaseServerConfiguration } from "@/lib/supabaseServerConfig";

export { SupabaseConfigurationError } from "@/lib/supabaseServerConfig";

/**
 * Server-only client.  Do not silently substitute placeholder credentials: that
 * turns a deployment configuration fault into an opaque database 500.
 */
let serverClient: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (!serverClient) {
    const { url, key } = resolveSupabaseServerConfiguration(process.env);
    serverClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return serverClient;
}


// Compatibility export for routes not yet migrated. The proxy delays client
// creation until a request actually uses it, so a missing environment variable
// is handled by that route rather than crashing module initialization.
// Existing routes predate generated Supabase database types. Retain their
// permissive client typing while migration to typed queries is completed.
export const supabase: SupabaseClient = new Proxy({}, {
  get(_target, property, receiver) {
    return Reflect.get(getSupabaseServerClient(), property, receiver);
  },
}) as SupabaseClient;
