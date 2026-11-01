import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ code: "PASSWORD_RESET_UNAVAILABLE", message: "Password reset is not configured for this authentication system." }, { status: 501 });
}
