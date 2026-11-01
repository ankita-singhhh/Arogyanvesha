import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { resolveCanonicalUserId } from "@/lib/auth/identity";

export class AuthError extends Error {
  constructor(message = "Unauthorized") { super(message); this.name = "AuthError"; }
}

const CANONICAL_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Returns a verified session whose user.id is the canonical public.users UUID. */
export async function getSession(): Promise<Session> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: unknown; email?: string | null; name?: string | null; authProvider?: string; externalSubject?: string; emailVerified?: boolean } | undefined;
  if (!session || !user || typeof user.id !== "string" || !CANONICAL_UUID.test(user.id) || !user.email) throw new AuthError("You must be signed in to perform this action.");
  const provider = user.authProvider;
  const subject = user.externalSubject;
  if ((provider !== "credentials" && provider !== "google") || typeof subject !== "string" || typeof user.emailVerified !== "boolean") {
    throw new AuthError("The sign-in identity is invalid.");
  }
  try {
    // Re-resolve an existing mapping before every protected request. This is
    // a liveness/ownership check, not identity provisioning; it prevents a
    // deleted or changed mapping from being trusted solely because its old JWT
    // remains valid.
    const canonicalUserId = await resolveCanonicalUserId({ provider, subject, email: user.email, emailVerified: user.emailVerified, name: user.name ?? null });
    if (!CANONICAL_UUID.test(canonicalUserId) || canonicalUserId !== user.id) {
      throw new AuthError("The sign-in identity is invalid.");
    }
    user.id = canonicalUserId;
  } catch {
    throw new AuthError("This sign-in method cannot be linked to the account.");
  }
  return session;
}
