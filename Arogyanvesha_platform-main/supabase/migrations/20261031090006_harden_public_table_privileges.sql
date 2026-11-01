-- Logical migration 009: harden public-table privileges.
--
-- This migration revokes TRUNCATE, TRIGGER and REFERENCES from PUBLIC, anon and authenticated
-- on all existing tables in the public schema. It does **not** modify CRUD privileges, RLS policies
-- or service_role access.

-- ==== 1️⃣ Migration executed by the standard Supabase migration role (currently `postgres`) ====
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

-- ==== 2️⃣ ADMIN‑ONLY step (must be run by a super‑user such as `supabase_admin`) ====
-- The default‑privileges for the role that creates future tables must also be hardened.
-- This cannot be performed by `postgres` because it does not own those default ACLs.
-- Run the following SQL **once**, using a connection that authenticates as `supabase_admin`:
--
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES
--     FROM PUBLIC, anon, authenticated;

-- ==== NOTE ==== The above admin step is documented here for operators; it is not part of the
-- migration file because `postgres` lacks the rights to alter `supabase_admin` defaults.

--
-- This is intentionally additive. It preserves SELECT, INSERT, UPDATE, and
-- DELETE grants, leaves RLS policies untouched, and does not affect
-- service_role. Including PUBLIC is required because every database role is a
-- member of it, so revoking only direct anon/authenticated grants is not
-- sufficient.

REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

-- Default privileges apply only to objects created later by the role executing
-- this migration. A distinct future table-owner role requires its own reviewed
-- ALTER DEFAULT PRIVILEGES statement.

-- Revoke dangerous default privileges for tables created by the migration role (postgres)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM PUBLIC, anon, authenticated;

/*
  Additional required steps (admin-only):
  --------------------------------------------------
  The supersuer role `supabase_admin` also has default privileges that grant
  TRUNCATE, TRIGGER, REFERENCES to PUBLIC, anon and authenticated. Because the
  migration runs as `postgres`, it cannot alter defaults for `supabase_admin`.
  After applying this migration, an admin must execute the following statement
  (or include it in a separate admin‑only migration) using a superuser connection:

    ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
      REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM PUBLIC, anon, authenticated;

  This ensures that any future tables created by `supabase_admin` are also safe.
*/

--
-- This is intentionally additive. It preserves SELECT, INSERT, UPDATE, and
-- DELETE grants, leaves RLS policies untouched, and does not affect
-- service_role. Including PUBLIC is required because every database role is a
-- member of it, so revoking only direct anon/authenticated grants is not
-- sufficient.

REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

-- Default privileges apply only to objects created later by the role executing
-- this migration. A distinct future table-owner role requires its own reviewed
-- ALTER DEFAULT PRIVILEGES statement.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM PUBLIC, anon, authenticated;
