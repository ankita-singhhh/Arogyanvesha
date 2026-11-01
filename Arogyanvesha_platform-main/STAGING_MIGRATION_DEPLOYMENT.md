# Arogyanvesha staging migration deployment guide

This guide prepares only the `arogyanvesha-staging` project
(`jfazjyypphzfpwbcjojp`). It does not prove that the target database is ready.
Do not point the CLI at production.

## Active migration set

The active `supabase/migrations/` directory contains the following fresh
staging baseline. The timestamp prefixes are unique candidate versions chosen
for this package; they have **not** been compared with remote migration
history. Confirm they are absent from staging before any deployment.

| Order | Active filename | Archived source |
| --- | --- | --- |
| 1 | `20261031090000_core_auth.sql` | `001_core_auth.sql` |
| 2 | `20261031090001_prakriti.sql` | `002_prakriti.sql` |
| 3 | `20261031090002_chat_and_features.sql` | `003_chat_and_features.sql` |
| 4 | `20261031090003_indexes_and_rls.sql` | `004_indexes_and_rls.sql` |
| 5 | `20261031090004_user_auth_identities_and_atomic_resolution.sql` | `007_user_auth_identities_and_atomic_resolution.sql` |
| 6 | `20261031090005_user_credentials.sql` | `008_user_credentials.sql` |
| 7 | `20261031090006_harden_public_table_privileges.sql` | Logical migration `009` |

The numbered originals, including excluded migrations, are retained unchanged
in `supabase/migration-archive/original-numbered/`.

Migration `009` uses a canonical timestamp-prefixed filename to remain
compatible with the active Supabase CLI migration workflow. Its privilege
hardening and validation procedure are documented in
[`STAGING_TABLE_PRIVILEGE_HARDENING.md`](STAGING_TABLE_PRIVILEGE_HARDENING.md).

## Excluded migrations

### `005_align_progress_chat_schema.sql`

Do not add this migration to a fresh baseline. It is a hosted-schema repair:

- Migration `002` has `prakriti_results.completed_at` but no `created_at`, so
  its `UPDATE ... SET completed_at = created_at` fails on this baseline.
- Its fallback `activity_log`, `health_scores`, and `chat_conversations`
  definitions use `TEXT user_id` and omit the UUID foreign keys established by
  migration `003`.
- `CREATE TABLE IF NOT EXISTS` does not reconcile an existing table's column
  types, foreign keys, or constraints.

Keep the archived copy for a separately reviewed legacy-schema repair only.

### `006_add_external_identity_mapping.sql`

Migration `006` is optional only for a new database. Migration `007` depends
on `public.users` from migration `001`, not on the two legacy columns added by
`006`; its conditional block imports those columns only when both already
exist. Include `006` in a separate, reviewed deployment only when an existing
database has legacy `users.auth_provider` and `users.auth_subject` mappings
that must be retained.

## Security correction in active migration 004

Migration `003` defines `is_published BOOLEAN DEFAULT true` on
`yoga_sessions`, `herbs`, and `wisdom_articles`. The active migration `004`
replaces the archived permissive public policies with predicates requiring
`is_published = true` for each of these tables. This preserves public access
to published library content and denies draft rows to both `anon` and
`authenticated` through the `public` policy role.

The migration files do not explicitly grant table `SELECT` to `anon` or
`authenticated`. RLS policies alone do not create SQL table privileges. Verify
the effective grants in staging before deciding whether browser Data API access
is intended; the current Next.js application uses its server-side client.

## Extension prerequisite

Migration `001` uses `gen_random_uuid()`. PostgreSQL 13 and later provide this
function in core; older PostgreSQL installations require `pgcrypto`. Supabase
version and extension state have not been inspected, so this is a mandatory
staging preflight, not an assumed dependency.

Migration `004` creates `pg_trgm` itself. Do not add a `pgcrypto` migration
until the preflight query below shows that `gen_random_uuid()` is unavailable.
If required, have a database administrator approve and apply this prerequisite
before migration `001`:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## SECURITY DEFINER review

| Function | Signature | Search path | Execute grant | Controls |
| --- | --- | --- | --- | --- |
| `resolve_or_create_auth_identity` | `(TEXT, TEXT, TEXT, BOOLEAN, TEXT, BOOLEAN)` | `public, pg_temp` | `service_role` only | Validates provider/subject/email, locks identity and email advisory keys, never reassigns an existing mapping. |
| `register_credentials_account` | `(TEXT, TEXT, TEXT, TEXT)` | `public, pg_temp` | `service_role` only | Validates input and password-hash shape; locks subject and email; inserts profile, identity, and verifier atomically; never links to an existing account. |
| `import_legacy_credential_hash` | `(TEXT, TEXT, TEXT)` | `public, pg_temp` | `service_role` only | Validates input and hash shape; locks the credential subject; only adds a verifier to an already matched credentials identity. |

All three are `SECURITY DEFINER`. Their migrations revoke execute from
`PUBLIC`, `anon`, and `authenticated`, then grant it only to `service_role`.
They bypass RLS only through their controlled definer owner, while the tables
remain RLS-enabled. The migrations do not set function owners explicitly:
staging must verify that each owner is the controlled migration/admin role and
that untrusted roles cannot create objects in `public`.

## Pre-deployment process

1. In the Supabase Dashboard, verify the selected project is
   `arogyanvesha-staging`, create/verify a restorable backup, and record its
   timestamp. Do not use a production project.
2. Install the current Supabase CLI using the official installation method.
   This repository currently has no CLI, `supabase/config.toml`, or project
   link metadata.
3. Create and review the CLI project configuration if needed, then link only
   to staging:

```powershell
cd D:\arogyan\Arogyanvesha\Arogyanvesha_platform-main
supabase init
supabase login
supabase link --project-ref jfazjyypphzfpwbcjojp
supabase migration list --linked
```

`supabase init` writes local configuration; perform it in a reviewed change.
`supabase link` contacts staging and writes link metadata. Neither command
should be pointed at production.

4. Stop if remote history contains any of the candidate timestamp versions, if
   the project reference is not staging, or if staging is not empty as
   expected. Do not use `migration repair` to bypass this check.
5. Run a non-mutating deployment preview only after the history gate passes:

```powershell
supabase db push --linked --dry-run
```

6. Review the exact six migrations printed by the dry-run. Only after a
separate approval should an operator execute:

```powershell
supabase db push --linked
```

Do not pass `--include-seed` unless staging seed data has separately been
reviewed.

## SQL checks for an approved staging verification session

Run these only in the staging SQL editor after deployment; they are not part
of this preparation.

```sql
-- Extension/function preflight
SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto', 'pg_trgm');
SELECT to_regprocedure('gen_random_uuid()') AS gen_random_uuid_function;

-- Applied migration history
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;

-- Publication policies and effective explicit grants
SELECT tablename, policyname, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('yoga_sessions', 'herbs', 'wisdom_articles')
ORDER BY tablename, policyname;

SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('yoga_sessions', 'herbs', 'wisdom_articles')
ORDER BY table_name, grantee, privilege_type;

-- Definer owner, search path, and browser-role execution rights
SELECT
  p.oid::regprocedure AS function_signature,
  pg_get_userbyid(p.proowner) AS owner,
  p.prosecdef AS security_definer,
  p.proconfig AS function_settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_can_execute
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'resolve_or_create_auth_identity',
    'register_credentials_account',
    'import_legacy_credential_hash'
  )
ORDER BY function_signature;
```

Expected results: the publication policies contain `is_published = true`,
`anon` and `authenticated` cannot execute the three definer functions,
`service_role` can execute them, and their owners are controlled migration or
administrator roles.

## Failure and recovery

- Stop at the first error; save the CLI output and staging backup timestamp.
- Do not run `db reset`, do not rerun a partially applied batch blindly, and
  do not use `migration repair` as a first response.
- Compare history with `supabase migration list --linked` and inspect the
  staging schema before choosing a remedy.
- Prefer a reviewed, forward-only corrective migration when the schema is
  consistent enough to continue.
- Restore the verified staging backup when partial changes cannot be safely
  corrected. Use `migration repair` only after the actual schema and migration
  history have been independently reconciled.
