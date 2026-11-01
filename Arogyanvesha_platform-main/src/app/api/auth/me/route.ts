import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import type { AppUser } from "@/types";

export async function GET() {
  try {
    // 1. Authenticate user session using server helper
    const session = await getSession();
    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "You must be signed in to perform this action." },
        { status: 401 }
      );
    }

    // 2. Fetch fresh user data from Supabase
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !dbUser) {
      console.error("Fetch current user database profile error:", error);
      return NextResponse.json(
        { code: "USER_NOT_FOUND", message: "User profile could not be found." },
        { status: 404 }
      );
    }

    // 3. Map database snake_case to camelCase AppUser shape
    const appUser: AppUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatar_url || null,
      phone: dbUser.phone || null,
      gender: dbUser.gender || null,
      dateOfBirth: dbUser.date_of_birth || null,
      plan: dbUser.plan || "free",
      prakritiCompleted: dbUser.prakriti_completed || false,
      primaryDosha: dbUser.primary_dosha || null,
      secondaryDosha: dbUser.secondary_dosha || null,
      arogyaScore: dbUser.arogya_score || null,
      currentStreak: dbUser.current_streak || 0,
      createdAt: dbUser.created_at,
    };

    return NextResponse.json(appUser, { status: 200 });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return NextResponse.json({ code: "UNAUTHORIZED", message: error.message }, { status: 401 });
    }
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
