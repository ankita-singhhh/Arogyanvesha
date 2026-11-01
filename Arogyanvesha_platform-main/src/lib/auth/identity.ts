import { getSupabaseServerClient } from "@/lib/supabase";
import { verifyPassword } from "@/lib/crypto";

export class IdentityResolutionError extends Error {
  constructor(message = "Unable to resolve this authenticated identity.") { super(message); this.name = "AuthError"; }
}

export type VerifiedIdentity = {
  provider: "credentials" | "google";
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
};

type CredentialAccount = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
};

export type DatabaseCredentialIdentity = {
  subject: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

function isValidIdentity(identity: VerifiedIdentity) {
  return (identity.provider === "credentials" || identity.provider === "google")
    && identity.subject.length > 0
    && identity.subject.length <= 512
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email);
}

/**
 * Calls the transactional, service-role-only database function. The function
 * owns all lookup/create/link decisions; callers must never do read-then-write
 * identity provisioning themselves.
 */
export async function resolveCanonicalUserId(identity: VerifiedIdentity): Promise<string> {
  const provider = identity.provider.trim();
  const subject = identity.subject.trim();
  const email = identity.email.toLowerCase().trim();
  if (provider !== "credentials" && provider !== "google") {
    throw new IdentityResolutionError("Invalid authenticated identity.");
  }
  const verifiedProvider = provider as VerifiedIdentity["provider"];
  if (!isValidIdentity({ ...identity, provider: verifiedProvider, subject, email })) {
    throw new IdentityResolutionError("Invalid authenticated identity.");
  }
  // Google is usable only with the provider's verified-email assertion. Local
  // credentials remain deliberately unverified until an email-verification
  // flow proves ownership; neither can auto-link to an existing profile.
  if (verifiedProvider === "google" && !identity.emailVerified) {
    throw new IdentityResolutionError("Google did not verify this email address.");
  }
  
  const { data, error } = await getSupabaseServerClient().rpc("resolve_or_create_auth_identity", {
    p_provider: verifiedProvider,
    p_subject: subject,
    p_email: email,
    p_email_verified: identity.emailVerified,
    p_name: identity.name?.trim().slice(0, 200) ?? "",
    // Automatic email account linking is intentionally disabled. A future
    // authenticated account-linking ceremony must opt in server-side.
    p_allow_verified_email_link: false,
  });
  if (error || typeof data !== "string") {
    throw new IdentityResolutionError(error?.code === "P0001" ? "Account linking is required for this sign-in method." : undefined);
  }
  return data;
}

/** Creates the profile, credentials identity, and password verifier atomically. */
export async function registerDatabaseCredentials(input: {
  subject: string;
  email: string;
  name: string;
  passwordHash: string;
}): Promise<{ userId: string; created: boolean }> {
  const { data, error } = await getSupabaseServerClient().rpc("register_credentials_account", {
    p_subject: input.subject,
    p_email: input.email.toLowerCase().trim(),
    p_name: input.name.trim().slice(0, 200),
    p_password_hash: input.passwordHash,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)
    || typeof (data as Record<string, unknown>).user_id !== "string"
    || typeof (data as Record<string, unknown>).created !== "boolean") {
    throw new IdentityResolutionError(error?.code === "P0001" ? "Account linking is required for this sign-in method." : "Unable to register credentials.");
  }
  const result = data as { user_id: string; created: boolean };
  return { userId: result.user_id, created: result.created };
}


/** Reads credential material only through the server-side service-role client. */
export async function authenticateDatabaseCredentials(email: string, password: string): Promise<DatabaseCredentialIdentity | null> {
  const client = getSupabaseServerClient();
  const normalizedEmail = email.toLowerCase().trim();
  const { data: user, error: userError } = await client
    .from("users")
    .select("id,email,name,avatar_url")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (userError || !user) return null;
  const account = user as CredentialAccount;
  const { data: credential, error: credentialError } = await client
    .from("user_credentials")
    .select("password_hash")
    .eq("user_id", account.id)
    .maybeSingle();
  if (credentialError || !credential || typeof credential.password_hash !== "string" || !verifyPassword(password, credential.password_hash)) return null;
  const { data: identity, error: identityError } = await client
    .from("user_auth_identities")
    .select("subject")
    .eq("user_id", account.id)
    .eq("provider", "credentials")
    .maybeSingle();
  if (identityError || !identity || typeof identity.subject !== "string") return null;
  return { subject: identity.subject, name: account.name, email: account.email, avatarUrl: account.avatar_url };
}
