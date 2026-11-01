import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { authOptions } from "@/lib/auth/authOptions";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  consumeChallenge,
  verifyPasskeyRegistration,
} from "@/lib/auth/passkeys";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const body = (await request.json()) as {
      response?: RegistrationResponseJSON;
      challenge?: string;
      deviceName?: string;
    };

    if (!body.response || !body.challenge) {
      return NextResponse.json({ error: "Missing registration response." }, { status: 400 });
    }

    await consumeChallenge(body.challenge, "registration", userId);

    const verification = await verifyPasskeyRegistration(
      body.response,
      body.challenge,
    );

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
    }

    const credential = verification.registrationInfo.credential;
    const credentialId = credential.id;

    if (!credentialId || credentialId.length > 512) {
      return NextResponse.json({ error: "Invalid credential ID." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, is_verified")
      .eq("id", userId)
      .single();

    if (userError || !user) throw new Error("User not found.");

    const publicKeyHex = Buffer.from(credential.publicKey).toString("hex");

    const { error: insertError } = await supabase
      .from("user_passkeys")
      .insert({
        user_id: userId,
        credential_id: credentialId,
        public_key: `\\x${publicKeyHex}`,
        counter: credential.counter,
        transports: credential.transports ?? [],
        device_name: body.deviceName?.slice(0, 100) ?? null,
      });

    if (insertError) throw insertError;

    // Enroll the passkey provider identity for this already-authenticated user.
    // Authentication resolves this existing mapping and does not auto-link by email.
    const { error: identityError } = await supabase
      .from("user_auth_identities")
      .upsert(
        {
          provider: "passkey",
          subject: userId,
          user_id: userId,
          provider_email: user.email,
          email_verified: Boolean(user.is_verified),
        },
        { onConflict: "provider,subject" },
      );

    if (identityError) throw identityError;

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Passkey registration verification error:", error);
    return NextResponse.json(
      { error: "Could not verify or save the passkey." },
      { status: 400 },
    );
  }
}