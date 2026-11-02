# Environment setup

## Current authentication architecture

NextAuth issues the browser session. On every protected API request, the server resolves the verified provider subject to `public.users.id`, which is the canonical Supabase UUID used by all `user_id` relationships. The service-role client is server-only and all routes scope queries by this UUID.

For fresh staging deployment, use the active timestamped migrations and gates in
[`STAGING_MIGRATION_DEPLOYMENT.md`](STAGING_MIGRATION_DEPLOYMENT.md). The
numbered migrations are archived under `supabase/migration-archive/` and are
not an active CLI deployment set. Migration 006 is only for preserving an
existing legacy identity mapping; migration 005 is excluded from a fresh
baseline and must be reviewed against a live legacy schema before any use.

## Frontend

1. Copy `.env.example` to `.env.local`; never commit `.env.local`.
2. In Supabase Dashboard → Project Settings → API, copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`. The current app has no browser Supabase client, so `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unused.
3. In the same dashboard, copy the new **Secret key** (starts with `sb_secret_`) into `SUPABASE_SECRET_KEY`. It is server-only: never prefix it with `NEXT_PUBLIC_`, place it in browser code, or commit it.
4. `SUPABASE_SERVICE_ROLE_KEY` remains an optional, temporary fallback for legacy projects. When both are set, `SUPABASE_SECRET_KEY` wins.
5. Generate and set `NEXTAUTH_SECRET`; set `NEXTAUTH_URL` to the deployed URL outside local development.
6. Run `npm install` and `npm run dev` from this directory.

### Staging example

Store these values in the staging host's private environment configuration or an uncommitted `.env.local` file:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://fazjyvpphzfpwbcjoip.supabase.co
SUPABASE_SECRET_KEY=YOUR_LOCAL_STAGING_SECRET_KEY
NEXTAUTH_SECRET=YOUR_LOCAL_NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=OPTIONAL
GOOGLE_CLIENT_SECRET=OPTIONAL
PYTHON_API_URL=OPTIONAL
GEMINI_API_KEY=OPTIONAL
GEMINI_MODEL=gemini-2.5-flash
```

Use a separate staging environment file and staging deployment variables. Before starting the app, confirm the URL contains the staging project reference; do not reuse a production secret or URL. The application fails safely when the URL or server secret is absent, and rejects `sb_publishable_` keys for privileged operations.

## Google OAuth (optional)

Create a Web application OAuth client in Google Cloud Console. Add `http://localhost:3000/api/auth/callback/google` and the corresponding deployed callback URL, then set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Google is disabled when either value is absent.

## Firebase

Firebase client and Admin authentication are not part of the active auth flow. Do not configure Firebase only because the package remains installed. A future Firebase integration must verify ID tokens with the Firebase Admin SDK on the server and map the verified UID through `auth_provider` / `auth_subject`; never accept a UID from the browser.

## Face login

Face login is disabled. The prior design exposed a shared secret in browser code and treated a face-descriptor match as primary identity verification. Do not set `FACE_LOGIN_SECRET` or `NEXT_PUBLIC_FACE_LOGIN_SECRET`. Re-enable only after a reviewed server-side, liveness-aware, multi-factor design.

## Resend

Resend is not used by the current implementation. `RESEND_API_KEY` is optional and should remain unset until a complete, reviewed transactional-email flow is implemented. Password reset endpoints return `501` rather than issue unusable tokens or claim delivery.

## Gemini (Next.js and backend)

Set `GEMINI_API_KEY` and, optionally, `GEMINI_MODEL` in both Vercel (for skin,
tongue, and eye image analysis) and Render (for chat and symptom synthesis).
The Next.js image routes return `503 AI_UNAVAILABLE` without a key; they never
invent an analysis. Copy `backend/.env.example` to `backend/.env` to run the
Python service:

```powershell
cd D:\arogyan\Arogyanvesha\backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Troubleshooting

- `SERVICE_CONFIGURATION_ERROR`: set `SUPABASE_SECRET_KEY` to the server-only `sb_secret_` key. `SUPABASE_SERVICE_ROLE_KEY` is accepted only as a legacy fallback; publishable keys are intentionally rejected.
- `UNAUTHORIZED`: sign in again; API requests use the NextAuth cookie, not a frontend user ID.
- `This account is already linked`: do not merge identities by email. Use an explicitly verified account-linking workflow.
- `EMAIL_NOT_CONFIGURED`: configure Resend or use password sign-in during local development.
