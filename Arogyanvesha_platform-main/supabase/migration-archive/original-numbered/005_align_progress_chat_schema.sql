-- Align the deployed schema with the API contracts used by progress and chat.
-- The current hosted project contains an older prakriti_results table and is
-- missing these feature tables entirely. Apply this migration through the
-- Supabase migration workflow; it is intentionally idempotent.

ALTER TABLE IF EXISTS public.prakriti_results
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE public.prakriti_results
SET completed_at = created_at
WHERE completed_at IS NULL;

ALTER TABLE IF EXISTS public.prakriti_results
  ALTER COLUMN completed_at SET DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prakriti', 'yoga', 'chat', 'skin', 'routine', 'wisdom')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  overall INT NOT NULL CHECK (overall BETWEEN 0 AND 100),
  physical INT CHECK (physical BETWEEN 0 AND 100),
  mental INT CHECK (mental BETWEEN 0 AND 100),
  digestive INT CHECK (digestive BETWEEN 0 AND 100),
  sleep INT CHECK (sleep BETWEEN 0 AND 100),
  computed_at DATE NOT NULL,
  UNIQUE (user_id, computed_at)
);

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  message_count INT NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created_at
  ON public.activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores_user_computed_at
  ON public.health_scores (user_id, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_last_message_at
  ON public.chat_conversations (user_id, last_message_at DESC);

-- These application routes authenticate with NextAuth/Firebase rather than a
-- Supabase JWT. Keep RLS enabled and deny direct client access; only the
-- server-side API service performs explicit authenticated-user scoped queries.
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.activity_log, public.health_scores, public.chat_conversations FROM anon, authenticated;
