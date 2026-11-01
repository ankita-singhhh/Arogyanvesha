import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

function routeFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(entryPath) : entry.name === "route.ts" ? [entryPath] : [];
  });
}

test("JWT and session callbacks preserve the canonical-ID contract", () => {
  const source = read("src/lib/auth/authOptions.ts");
  assert.match(source, /token\.id = await resolveCanonicalUserId\(identity\)/);
  assert.match(source, /user\.id = token\.id/);
  assert.match(source, /token\.externalSubject = identity\.subject/);
  assert.doesNotMatch(source, /if \(user\) token\.id = user\.id/);
});

test("getSession rejects failed or mismatched identity resolution", () => {
  const source = read("src/lib/auth/getSession.ts");
  assert.match(source, /canonicalUserId !== user\.id/);
  assert.match(source, /throw new AuthError\("This sign-in method cannot be linked to the account\."\)/);
  assert.match(source, /CANONICAL_UUID\.test\(user\.id\)/);
});

test("routes using a user ID obtain a verified session first", () => {
  const apiRoot = join(root, "src", "app", "api");
  for (const file of routeFiles(apiRoot)) {
    const source = readFileSync(file, "utf8");
    if (!/\buserId\b/.test(source)) continue;
    assert.match(source, /getSession\(\)/, `${file} uses userId without getSession()`);
  }
});

test("provider subjects are not used by API routes as database user IDs", () => {
  const apiRoot = join(root, "src", "app", "api");
  for (const file of routeFiles(apiRoot)) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /externalSubject/, `${file} must not use a provider subject for a database query`);
  }
});

test("new credential registration is delegated to the database transaction", () => {
  const route = read("src/app/api/auth/register/route.ts");
  const migration = read("supabase/migrations/20261031090005_user_credentials.sql");
  const authOptions = read("src/lib/auth/authOptions.ts");
  assert.match(route, /registerDatabaseCredentials/);
  assert.doesNotMatch(route, /localDb/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.user_credentials/);
  assert.match(migration, /UNIQUE \(user_id\)/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /REVOKE ALL ON TABLE public\.user_credentials FROM PUBLIC, anon, authenticated/);
  assert.match(authOptions, /authenticateDatabaseCredentials/);
  assert.match(authOptions, /ENABLE_LEGACY_JSON_CREDENTIALS !== "true"/);
});

test("logical migration 009 removes only unnecessary public-table privileges", () => {
  const migration = read("supabase/migrations/20261031090006_harden_public_table_privileges.sql");
  assert.match(migration, /REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public\s+FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /ALTER DEFAULT PRIVILEGES IN SCHEMA public\s+REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM PUBLIC, anon, authenticated/);
  assert.doesNotMatch(migration, /REVOKE\s+(?:SELECT|INSERT|UPDATE|DELETE)/);
  assert.doesNotMatch(migration, /GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)/);
  assert.doesNotMatch(migration, /DISABLE ROW LEVEL SECURITY/);
});
