import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getWebAuthnConfig } from "@/lib/auth/passkeys";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { rpID } = getWebAuthnConfig();

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: [],
      userVerification: "required",
    });

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("webauthn_challenges").insert({
      challenge: options.challenge,
      purpose: "authentication",
      user_id: null,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ options, challenge: options.challenge });
  } catch (error) {
    console.error("Passkey authentication options error:", error);
    return NextResponse.json(
      { error: "Could not start passkey login." },
      { status: 500 },
    );
  }
}