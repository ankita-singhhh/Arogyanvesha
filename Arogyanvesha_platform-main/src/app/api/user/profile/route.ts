import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (_request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ code: "USER_NOT_FOUND", message: "User profile not found." }, { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
});

export const PUT = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { name, phone, gender, dateOfBirth } = await request.json();

  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (gender !== undefined) updates.gender = gender;
  if (dateOfBirth !== undefined) updates.date_of_birth = dateOfBirth;
  updates.updated_at = new Date().toISOString();

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ code: "UPDATE_FAILED", message: "Failed to update profile details." }, { status: 500 });
  }

  return NextResponse.json(updatedUser, { status: 200 });
});

export const DELETE = withApiHandler(async (_request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  // Anonymize user details (soft delete)
  const anonymizedEmail = `deleted_${userId.substring(0, 8)}_${Date.now()}@arogyanvesha.com`;
  const { error } = await supabase
    .from("users")
    .update({
      name: "Deleted User",
      email: anonymizedEmail,
      password_hash: null,
      avatar_url: null,
      phone: null,
      gender: null,
      date_of_birth: null,
      plan: "free",
      is_verified: false,
      prakriti_completed: false,
      current_streak: 0,
      longest_streak: 0,
    })
    .eq("id", userId);

  if (error) {
    console.error("Soft-delete error:", error);
    return NextResponse.json({ code: "DELETE_FAILED", message: "Failed to deactivate account." }, { status: 500 });
  }

  return NextResponse.json({ message: "Your account has been deactivated successfully." }, { status: 200 });
});
