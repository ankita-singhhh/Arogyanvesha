import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";

const tempRoot = mkdtempSync(join(tmpdir(), "arogyanvesha-auth-"));
const buildRoot = join(tempRoot, "build");
const databasePath = join(tempRoot, "local-users.json");

process.env.LOCAL_DB_PATH = databasePath;
execFileSync(process.execPath, [
  join(process.cwd(), "node_modules", "typescript", "bin", "tsc"),
  "src/lib/localDb.ts", "src/lib/crypto.ts", "src/lib/supabaseServerConfig.ts", "--outDir", buildRoot, "--target", "es2022",
  "--module", "commonjs", "--esModuleInterop", "--skipLibCheck",
], { cwd: process.cwd(), stdio: "pipe" });

// Compile and load the production persistence module; Supabase remains mocked
// at the route boundary for these filesystem-concurrency tests.
const require = createRequire(import.meta.url);
const { createOrRecoverLocalUser } = require(join(buildRoot, "localDb.js"));
const { hashPassword, verifyPassword } = require(join(buildRoot, "crypto.js"));
const { resolveSupabaseServerConfiguration, SupabaseConfigurationError } = require(join(buildRoot, "supabaseServerConfig.js"));

const makeUser = (id = crypto.randomUUID(), email = "register@example.test") => ({
  id,
  name: "Test User",
  email,
  passwordHash: "test-password-hash",
  plan: "free",
  prakritiCompleted: false,
  currentStreak: 0,
  createdAt: new Date().toISOString(),
  isVerified: false,
  avatarUrl: null,
});

test.after(() => rmSync(tempRoot, { recursive: true, force: true }));

test("new credentials registration persists exactly one recovery intent", async () => {
  const result = await createOrRecoverLocalUser(makeUser(), (hash) => hash === "test-password-hash");
  assert.equal(result.status, "created");
  assert.equal(JSON.parse(readFileSync(databasePath, "utf8")).length, 1);
});

test("credential verifier accepts only the original password", () => {
  const hash = hashPassword("correct horse battery staple");
  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("incorrect password", hash), false);
});

test("Supabase secret-key configuration prefers the new key and rejects publishable keys", () => {
  const base = { NEXT_PUBLIC_SUPABASE_URL: "https://staging.example.supabase.co" };
  assert.deepEqual(resolveSupabaseServerConfiguration({ ...base, SUPABASE_SECRET_KEY: "sb_secret_fake", SUPABASE_SERVICE_ROLE_KEY: "legacy-fake" }), {
    url: base.NEXT_PUBLIC_SUPABASE_URL,
    key: "sb_secret_fake",
  });
  assert.deepEqual(resolveSupabaseServerConfiguration({ ...base, SUPABASE_SERVICE_ROLE_KEY: "legacy-fake" }), {
    url: base.NEXT_PUBLIC_SUPABASE_URL,
    key: "legacy-fake",
  });
  assert.throws(() => resolveSupabaseServerConfiguration({ ...base, SUPABASE_SECRET_KEY: "sb_publishable_fake" }), SupabaseConfigurationError);
  assert.throws(() => resolveSupabaseServerConfiguration(base), SupabaseConfigurationError);
  assert.throws(() => resolveSupabaseServerConfiguration({ SUPABASE_SECRET_KEY: "sb_secret_fake" }), SupabaseConfigurationError);
});

test("retry with the same credentials recovers; a different password is rejected", async () => {
  const recovered = await createOrRecoverLocalUser(makeUser(), (hash) => hash === "test-password-hash");
  const rejected = await createOrRecoverLocalUser(makeUser(), () => false);
  assert.equal(recovered.status, "existing");
  assert.equal(rejected.status, "conflict");
});

test("concurrent registration attempts do not create duplicate local users", async () => {
  const results = await Promise.all(Array.from({ length: 12 }, () =>
    createOrRecoverLocalUser(makeUser(crypto.randomUUID(), "concurrent@example.test"), (hash) => hash === "test-password-hash"),
  ));
  assert.equal(results.filter((result) => result.status === "created").length, 1);
  assert.equal(results.filter((result) => result.status === "existing").length, 11);
  assert.equal(JSON.parse(readFileSync(databasePath, "utf8")).length, 2);
});
