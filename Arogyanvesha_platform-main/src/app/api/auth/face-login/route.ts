import { NextResponse } from "next/server";

/**
 * Face embeddings are not a sufficient primary authentication factor. The
 * former implementation returned an email for any matching descriptor and
 * depended on a secret embedded in the browser. Keep the endpoint explicit so
 * existing clients fail safely until a verified, server-side biometric flow is
 * designed and reviewed.
 */
export async function POST() {
  return NextResponse.json(
    { code: "FACE_LOGIN_UNAVAILABLE", message: "Face login is unavailable. Please sign in with your password or Google." },
    { status: 501 },
  );
}
