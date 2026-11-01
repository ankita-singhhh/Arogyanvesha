-- Adds an explicit, non-destructive mapping from an authenticated external
-- subject (NextAuth credentials / Google today; Firebase only after Admin SDK
-- verification is introduced) to the canonical public.users UUID.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_subject TEXT;

-- Existing profiles remain valid and are linked on their next verified login.
-- Partial uniqueness allows pre-existing NULL mappings without data rewrites.
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_provider_subject_key
  ON public.users (auth_provider, auth_subject)
  WHERE auth_provider IS NOT NULL AND auth_subject IS NOT NULL;

COMMENT ON COLUMN public.users.auth_provider IS
  'Verified external identity provider. Never accept this from a client request.';
COMMENT ON COLUMN public.users.auth_subject IS
  'Verified provider subject/UID mapped to this canonical UUID.';
