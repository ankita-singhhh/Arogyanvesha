import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { registerDatabaseCredentials, IdentityResolutionError } from "@/lib/auth/identity";

/**
 * The database RPC commits the profile, credentials identity, and verifier in
 * one transaction. JSON credentials are retained only for legacy fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") return NextResponse.json({ code: "VALIDATION_ERROR", message: "Name, email, and password are required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ code: "VALIDATION_ERROR", message: "Password must be at least 8 characters long." }, { status: 400 });
    const normalizedEmail = email.toLowerCase().trim(); const normalizedName = name.trim();
    if (!normalizedName || !normalizedEmail.includes("@")) return NextResponse.json({ code: "VALIDATION_ERROR", message: "Enter a valid name and email address." }, { status: 400 });
    try {
      const result = await registerDatabaseCredentials({
        subject: crypto.randomUUID(),
        email: normalizedEmail,
        name: normalizedName,
        passwordHash: hashPassword(password),
      });
      if (!result.created) {
        return NextResponse.json({ code: "EMAIL_EXISTS", message: "This email is already registered." }, { status: 409 });
      }
    } catch (error) {
      const message = error instanceof IdentityResolutionError ? error.message : "Unable to create this account.";
      const isAccountConflict = error instanceof IdentityResolutionError && message === "Account linking is required for this sign-in method.";
      return NextResponse.json(
        { code: isAccountConflict ? "EMAIL_EXISTS" : "REGISTRATION_UNAVAILABLE", message },
        { status: isAccountConflict ? 409 : 503 },
      );
    }
    return NextResponse.json({ message: "Registration successful. Please sign in. Verify your email before linking another sign-in method." }, { status: 201 });
  } catch {
    return NextResponse.json({ code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
