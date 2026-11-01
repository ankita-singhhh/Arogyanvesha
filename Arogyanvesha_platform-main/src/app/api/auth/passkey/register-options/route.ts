import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { authOptions } from "@/lib/auth/authOptions";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getWebAuthnConfig } from "@/lib/auth/passkeys";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("id", userId)
      .single();

    if (userError || !user?.email) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const { data: existing, error: passkeyError } = await supabase
      .from("user_passkeys")
      .select("credential_id, transports")
      .eq("user_id", userId);

    if (passkeyError) throw passkeyError;

    const { rpID, rpName } = getWebAuthnConfig();

    const options = await generateRegistrationOptions({
      rpID,
      rpName,
      userID: new TextEncoder().encode(userId),
      userName: user.email,
      userDisplayName: user.name ?? user.email,
      attestationType: "none",
      excludeCredentials: (existing ?? []).map((item) => ({
        id: item.credential_id,
        transports: item.transports ?? [],
      })),
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    const { error: challengeError } = await supabase
      .from("webauthn_challenges")
      .insert({
        challenge: options.challenge,
        purpose: "registration",
        user_id: userId,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    if (challengeError) throw challengeError;

    return NextResponse.json({ options, challenge: options.challenge });
  } catch (error) {
    console.error("Passkey registration options error:", error);
    return NextResponse.json(
      { error: "Could not start passkey registration." },
      { status: 500 },
    );
  }
}