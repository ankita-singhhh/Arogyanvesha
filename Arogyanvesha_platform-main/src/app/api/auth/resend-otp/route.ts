import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ code: "OTP_UNAVAILABLE", message: "Email verification is not configured." }, { status: 501 });
}
