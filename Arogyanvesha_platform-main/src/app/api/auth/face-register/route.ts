import { NextResponse } from "next/server";

/** Biometrics enrollment is disabled alongside face login; do not retain new raw descriptors. */
export async function POST() {
  return NextResponse.json({ code: "FACE_LOGIN_UNAVAILABLE", message: "Face enrollment is unavailable." }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ code: "FACE_LOGIN_UNAVAILABLE", message: "Face enrollment is unavailable." }, { status: 501 });
}
