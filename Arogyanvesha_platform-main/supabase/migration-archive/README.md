# Archived numbered migrations

`original-numbered/` preserves the eight source migrations exactly as they
existed before staging preparation. They are not an active Supabase CLI
migration directory and must not be deployed alongside the timestamped files
in `../migrations/`.

The original-to-active mapping and deployment gates are documented in
`../STAGING_MIGRATION_DEPLOYMENT.md`.
