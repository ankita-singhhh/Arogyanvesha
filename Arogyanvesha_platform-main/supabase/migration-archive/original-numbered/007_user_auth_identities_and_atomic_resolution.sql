-- Multi-provider identity mapping. This migration is additive and retains the
-- legacy users.auth_provider/auth_subject columns from migration 006.
CREATE TABLE IF NOT EXISTS public.user_auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (char_length(provider) BETWEEN 1 AND 64),
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 512),
  provider_email TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, subject)
);

CREATE INDEX IF NOT EXISTS user_auth_identities_user_id_idx ON public.user_auth_identities(user_id);

-- Preserve mappings created by 006 only when that migration has already run.
-- Referencing its columns directly would make this additive migration fail in
-- environments that intentionally skipped 006.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_provider'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_subject'
  ) THEN
    EXECUTE $sql$
      INSERT INTO public.user_auth_identities (user_id, provider, subject, provider_email, email_verified)
      -- A historical provider label is not proof that its email claim was
      -- verified. New Google sign-ins must supply a fresh verified claim.
      SELECT id, auth_provider, auth_subject, email, false
      FROM public.users
      WHERE auth_provider IS NOT NULL AND auth_subject IS NOT NULL
      ON CONFLICT (provider, subject) DO NOTHING
    $sql$;
  END IF;
END;
$$;

ALTER TABLE public.user_auth_identities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_auth_identities FROM anon, authenticated;

-- Trusted server-only provisioning. This function never reassigns an identity.
CREATE OR REPLACE FUNCTION public.resolve_or_create_auth_identity(
  p_provider TEXT,
  p_subject TEXT,
  p_email TEXT,
  p_email_verified BOOLEAN,
  p_name TEXT,
  p_allow_verified_email_link BOOLEAN DEFAULT false
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  IF p_provider IS NULL OR trim(p_provider) NOT IN ('credentials', 'google')
     OR length(trim(p_provider)) > 64
     OR p_subject IS NULL OR length(trim(p_subject)) = 0 OR length(trim(p_subject)) > 512
     OR p_email IS NULL OR length(trim(p_email)) = 0 OR length(trim(p_email)) > 320
     OR position('@' IN trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Invalid identity input' USING ERRCODE = '22023';
  END IF;
  IF p_email_verified IS NULL OR p_allow_verified_email_link IS NULL THEN
    RAISE EXCEPTION 'Invalid identity verification input' USING ERRCODE = '22023';
  END IF;

  v_email := lower(trim(p_email));
  -- Serialize first use of the same external identity and email address.
  PERFORM pg_advisory_xact_lock(hashtext(trim(p_provider) || ':' || trim(p_subject)));
  PERFORM pg_advisory_xact_lock(hashtext('email:' || v_email));

  SELECT user_id INTO v_user_id FROM public.user_auth_identities
  WHERE provider = trim(p_provider) AND subject = trim(p_subject);
  IF FOUND THEN RETURN v_user_id; END IF;

  SELECT id INTO v_user_id FROM public.users WHERE email = v_email FOR UPDATE;
  IF FOUND THEN
    IF NOT (p_allow_verified_email_link AND p_email_verified) THEN
      RAISE EXCEPTION 'Account linking is required' USING ERRCODE = 'P0001';
    END IF;
  ELSE
    INSERT INTO public.users (email, name, is_verified)
    VALUES (v_email, left(coalesce(nullif(trim(p_name), ''), split_part(v_email, '@', 1)), 200), p_email_verified)
    RETURNING id INTO v_user_id;
  END IF;

  BEGIN
    INSERT INTO public.user_auth_identities (user_id, provider, subject, provider_email, email_verified)
    VALUES (v_user_id, trim(p_provider), trim(p_subject), v_email, p_email_verified);
  EXCEPTION WHEN unique_violation THEN
    -- An identity is never reassigned. This can only be a racing request or a
    -- conflicting legacy mapping, so return the existing owner if it is ours
    -- and otherwise reject the login.
    SELECT user_id INTO v_user_id FROM public.user_auth_identities
    WHERE provider = trim(p_provider) AND subject = trim(p_subject);
    IF FOUND THEN RETURN v_user_id; END IF;
    RAISE;
  END;
  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_or_create_auth_identity(TEXT, TEXT, TEXT, BOOLEAN, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_or_create_auth_identity(TEXT, TEXT, TEXT, BOOLEAN, TEXT, BOOLEAN) TO service_role;
