import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const databasePath = process.env.LEGACY_LOCAL_DB_PATH ?? join(process.cwd(), "localDb.json");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey || serviceRoleKey.startsWith("sb_publishable_")) {
  throw new Error("Server-side Supabase configuration is required.");
}

const records = JSON.parse(readFileSync(databasePath, "utf8"));
if (!Array.isArray(records)) throw new Error("Legacy credential file is invalid.");

const client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
const summary = { scanned: 0, eligible: 0, imported: 0, alreadyPresent: 0, skipped: 0, failed: 0 };

for (const record of records) {
  summary.scanned += 1;
  if (!record || typeof record.id !== "string" || typeof record.email !== "string" || typeof record.passwordHash !== "string") {
    summary.skipped += 1;
    continue;
  }
  const { data: identity, error: identityError } = await client
    .from("user_auth_identities")
    .select("user_id")
    .eq("provider", "credentials")
    .eq("subject", record.id)
    .maybeSingle();
  if (identityError || !identity) {
    summary.skipped += 1;
    continue;
  }
  summary.eligible += 1;
  if (!apply) continue;
  const { data, error } = await client.rpc("import_legacy_credential_hash", {
    p_subject: record.id,
    p_email: record.email,
    p_password_hash: record.passwordHash,
  });
  if (error) {
    summary.failed += 1;
  } else if (data === true) {
    summary.imported += 1;
  } else {
    summary.alreadyPresent += 1;
  }
}

// Deliberately report aggregate counts only: never emails, passwords, or hashes.
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...summary }));
if (summary.failed > 0) process.exitCode = 1;
