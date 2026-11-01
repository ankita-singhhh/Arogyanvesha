# Staging public-table privilege hardening

## Scope and root cause

The confirmed staging finding is that `anon` and `authenticated` have
effective `TRUNCATE`, `TRIGGER`, and `REFERENCES` privileges on public
application tables. None of migrations 001–008 issues a broad table `GRANT`.
The effective privileges therefore originate from database-level setup outside
these migration files, such as direct grants, `PUBLIC` grants, inherited role
membership, or default privileges of the table-creating role.

RLS does not govern `TRUNCATE`, so this must be corrected with SQL privileges.
The affected table set must be read from staging immediately before deployment;
the active baseline defines 33 application tables, while the reported staging
finding identifies 54 existing public application tables.

## Proposed migration

The active, CLI-compatible logical migration 009 is:

`supabase/migrations/20261031090006_harden_public_table_privileges.sql`

```sql
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM PUBLIC, anon, authenticated;
```

It targets every existing table in `public`, including the two identity and
credential tables already more tightly protected by earlier migrations. It
does not grant or revoke `SELECT`, `INSERT`, `UPDATE`, or `DELETE`; does not
change service-role grants; does not modify RLS policies; and makes no schema
or data changes.

`PUBLIC` is included because all roles inherit its privileges. Revoking only
direct grants to `anon` and `authenticated` would leave a `PUBLIC` grant
effective. The default-privilege statement affects only tables subsequently
created by the role running this migration, in the `public` schema. If future
tables are created by a different owner, an administrator must inspect that
owner's default privileges and apply a separate, reviewed equivalent.

## Read-only pre- and post-deployment verification

Run the following only in the confirmed staging SQL editor. These queries do
not return table rows, user records, credentials, or secrets.

```sql
-- Exact target table list and owners.
SELECT c.relname AS table_name, pg_get_userbyid(c.relowner) AS owner
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

-- Effective unnecessary privileges: all results must be false after migration 009.
SELECT
  c.relname AS table_name,
  has_table_privilege('anon', c.oid, 'TRUNCATE') AS anon_truncate,
  has_table_privilege('anon', c.oid, 'TRIGGER') AS anon_trigger,
  has_table_privilege('anon', c.oid, 'REFERENCES') AS anon_references,
  has_table_privilege('authenticated', c.oid, 'TRUNCATE') AS authenticated_truncate,
  has_table_privilege('authenticated', c.oid, 'TRIGGER') AS authenticated_trigger,
  has_table_privilege('authenticated', c.oid, 'REFERENCES') AS authenticated_references
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

-- Detect PUBLIC/direct grants that could produce inherited privileges.
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
  AND privilege_type IN ('TRUNCATE', 'TRIGGER', 'REFERENCES')
ORDER BY table_name, grantee, privilege_type;

-- Confirm CRUD was preserved and service_role remains privileged.
SELECT
  c.relname AS table_name,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('authenticated', c.oid, 'SELECT, INSERT, UPDATE, DELETE') AS authenticated_crud,
  has_table_privilege('service_role', c.oid, 'SELECT, INSERT, UPDATE, DELETE') AS service_role_crud
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

-- Existing default privileges for the verified table-owner role(s).
SELECT
  pg_get_userbyid(d.defaclrole) AS owner,
  n.nspname AS schema_name,
  d.defaclobjtype AS object_type,
  d.defaclacl AS acl
FROM pg_default_acl AS d
LEFT JOIN pg_namespace AS n ON n.oid = d.defaclnamespace
WHERE d.defaclobjtype = 'r'
  AND (n.nspname = 'public' OR n.nspname IS NULL)
ORDER BY owner, schema_name;
```

## Deployment gate

Before applying the migration, confirm that the CLI/migration executor owns
the tables it creates or is the intended future table-owner. If ownership is
different, do not assume its default privileges are covered: add a separate,
owner-specific migration only after reviewing the query above.
