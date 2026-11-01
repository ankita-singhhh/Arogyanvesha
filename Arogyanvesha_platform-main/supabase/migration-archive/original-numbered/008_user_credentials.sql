-- Database-backed credentials. This is additive: legacy localDb.json users
-- are intentionally not imported or deleted by this migration.
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id),
  -- Current server-generated scrypt format: 16-byte hex salt : 64-byte hex hash.
  CHECK (password_hash ~ '^[0-9a-f]{32}:[0-9a-f]{128}$')
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_credentials FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_credentials TO service_role;

-- Registration is one transaction: profile, credentials identity, and verifier
-- are created together. It never attaches credentials to a pre-existing user.
CREATE OR REPLACE FUNCTION public.register_credentials_account(
  p_subject TEXT,
  p_email TEXT,
  p_name TEXT,
  p_password_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  IF p_subject IS NULL OR length(trim(p_subject)) = 0 OR length(trim(p_subject)) > 512
     OR p_email IS NULL OR length(trim(p_email)) = 0 OR length(trim(p_email)) > 320
     OR position('@' IN trim(p_email)) = 0
     OR p_password_hash IS NULL OR p_password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{128}$' THEN
    RAISE EXCEPTION 'Invalid credential registration input' USING ERRCODE = '22023';
  END IF;

  v_email := lower(trim(p_email));
  PERFORM pg_advisory_xact_lock(hashtext('credentials:' || trim(p_subject)));
  PERFORM pg_advisory_xact_lock(hashtext('email:' || v_email));

  SELECT user_id INTO v_user_id
  FROM public.user_auth_identities
  WHERE provider = 'credentials' AND subject = trim(p_subject);
  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_credentials WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'Credential identity is incomplete' USING ERRCODE = 'P0001';
    END IF;
    RETURN jsonb_build_object('user_id', v_user_id, 'created', false);
  END IF;

  SELECT id INTO v_user_id FROM public.users WHERE email = v_email FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION 'Account linking is required' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.users (email, name, is_verified)
  VALUES (v_email, left(coalesce(nullif(trim(p_name), ''), split_part(v_email, '@', 1)), 200), false)
  RETURNING id INTO v_user_id;

  INSERT INTO public.user_auth_identities (user_id, provider, subject, provider_email, email_verified)
  VALUES (v_user_id, 'credentials', trim(p_subject), v_email, false);

  INSERT INTO public.user_credentials (user_id, password_hash)
  VALUES (v_user_id, p_password_hash);

  RETURN jsonb_build_object('user_id', v_user_id, 'created', true);
END;
$$;

REVOKE ALL ON FUNCTION public.register_credentials_account(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_credentials_account(TEXT, TEXT, TEXT, TEXT) TO service_role;

-- One-time legacy import support. It can only add a verifier to an already
-- mapped credentials identity with the same email; it never creates profiles,
-- transfers identities, or links a Google-only account.
CREATE OR REPLACE FUNCTION public.import_legacy_credential_hash(
  p_subject TEXT,
  p_email TEXT,
  p_password_hash TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  IF p_subject IS NULL OR length(trim(p_subject)) = 0 OR length(trim(p_subject)) > 512
     OR p_email IS NULL OR length(trim(p_email)) = 0 OR length(trim(p_email)) > 320
     OR p_password_hash IS NULL OR p_password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{128}$' THEN
    RAISE EXCEPTION 'Invalid legacy credential input' USING ERRCODE = '22023';
  END IF;
  v_email := lower(trim(p_email));
  PERFORM pg_advisory_xact_lock(hashtext('credentials:' || trim(p_subject)));
  SELECT i.user_id INTO v_user_id
  FROM public.user_auth_identities AS i
  JOIN public.users AS u ON u.id = i.user_id
  WHERE i.provider = 'credentials' AND i.subject = trim(p_subject) AND u.email = v_email
  FOR UPDATE OF i, u;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Legacy credentials identity cannot be imported safely' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_credentials WHERE user_id = v_user_id) THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_credentials (user_id, password_hash) VALUES (v_user_id, p_password_hash);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.import_legacy_credential_hash(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_legacy_credential_hash(TEXT, TEXT, TEXT) TO service_role;
