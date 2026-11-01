import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  let { data: settings, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Fetch user settings error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to load settings." }, { status: 500 });
  }

  if (!settings) {
    // Upsert and return defaults
    const { data: newSettings, error: insertError } = await supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        theme: "system",
        language: "en",
        email_notifications: true,
        push_notifications: true,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Insert default settings error:", insertError);
    }
    settings = newSettings;
  }

  return NextResponse.json(settings, { status: 200 });
});

export const PUT = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const body = await request.json();

  const updates: any = {};
  if (body.theme !== undefined) updates.theme = body.theme;
  if (body.language !== undefined) updates.language = body.language;
  if (body.emailNotifications !== undefined) updates.email_notifications = body.emailNotifications;
  if (body.pushNotifications !== undefined) updates.push_notifications = body.pushNotifications;
  if (body.routineReminderTime !== undefined) updates.routine_reminder_time = body.routineReminderTime;
  if (body.marketingEmails !== undefined) updates.marketing_emails = body.marketingEmails;
  updates.updated_at = new Date().toISOString();

  const { data: updatedSettings, error } = await supabase
    .from("user_settings")
    .update(updates)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ code: "UPDATE_FAILED", message: "Failed to save settings changes." }, { status: 500 });
  }

  return NextResponse.json(updatedSettings, { status: 200 });
});
