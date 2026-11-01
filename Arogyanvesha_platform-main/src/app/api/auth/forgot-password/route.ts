import { NextResponse } from "next/server";

/**
 * Local credentials are stored only in the development credential store while
 * account identity is in Supabase. A reset email cannot safely update both, so
 * the previous partially-working flow is disabled rather than issuing tokens
 * that cannot restore access.
 */
export async function POST() {
  return NextResponse.json({ code: "PASSWORD_RESET_UNAVAILABLE", message: "Password reset is not configured for this authentication system." }, { status: 501 });
}
