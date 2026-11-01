import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { anthropic } from "@/lib/ai/anthropic";
import { SKIN_ANALYSIS_PROMPT } from "@/lib/ai/prompts";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const userPlan = (session.user as any).plan || "free";

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Image file is required." }, { status: 400 });
  }

  // 1. Validate File constraints
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Image size must be less than 5MB." }, { status: 400 });
  }

  // 2. Check Monthly Skin Analysis Usage limits
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count, error: countError } = await supabase
    .from("skin_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("analyzed_at", startOfMonth);

  if (countError) {
    console.error("Skin count check error:", countError);
  }

  const currentCount = count || 0;
  const limits: Record<string, number> = { free: 1, pro: 5, elite: 999999 };
  const monthlyLimit = limits[userPlan] || 1;

  if (currentCount >= monthlyLimit) {
    return NextResponse.json(
      { code: "LIMIT_EXCEEDED", message: `You have reached your monthly skin analysis limit of ${monthlyLimit} analyses for your ${userPlan.toUpperCase()} plan. Please upgrade to continue.` },
      { status: 429 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 3. Upload to Supabase Storage
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}.jpg`;
  const { error: storageError } = await supabase.storage
    .from("skin-images")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (storageError) {
    console.error("Storage upload skin error:", storageError);
  }

  // 4. Invoke Claude Vision SDK with base64 image
  let aiResponseText = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: SKIN_ANALYSIS_PROMPT,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as any,
                data: buffer.toString("base64"),
              },
            },
          ],
        },
      ],
    });

    aiResponseText = response.content[0]?.type === "text" ? response.content[0].text : "{}";
  } catch (err) {
    console.error("Claude Vision API failure:", err);
    return NextResponse.json({ code: "AI_ERROR", message: "Failed to analyze skin image using AI." }, { status: 500 });
  }

  // 5. Parse Claude JSON response
  let analysisResult: any = {};
  try {
    const jsonStart = aiResponseText.indexOf("{");
    const jsonEnd = aiResponseText.lastIndexOf("}") + 1;
    const cleanJson = aiResponseText.substring(jsonStart, jsonEnd);
    analysisResult = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error("Claude malformed JSON response:", aiResponseText);
    return NextResponse.json({ code: "AI_PARSING_FAILED", message: "Failed to parse skin diagnostic parameters." }, { status: 500 });
  }

  // 6. Save results to skin_analyses
  const { data: dbRecord, error: insertError } = await supabase
    .from("skin_analyses")
    .insert({
      user_id: userId,
      image_path: filePath,
      skin_type: analysisResult.skinType || "Normal",
      dominant_dosha: analysisResult.dominantDosha || "pitta",
      score: analysisResult.score || 80,
      conditions: analysisResult.conditions || [],
      recommendations: analysisResult.recommendations || [],
      ai_raw_response: aiResponseText.substring(0, 9500),
    })
    .select("id")
    .single();

  if (insertError || !dbRecord) {
    console.error("Insert skin error:", insertError);
    return NextResponse.json({ code: "DATABASE_ERROR", message: "Failed to store skin diagnostics." }, { status: 500 });
  }

  // 7. Insert Activity Log
  await supabase.from("activity_log").insert({
    user_id: userId,
    type: "skin",
    title: "Analyzed Skin Constitution",
    description: `Determined Skin Type: ${analysisResult.skinType || "Normal"} (Score: ${analysisResult.score || 80}/100).`,
  });

  return NextResponse.json({ id: dbRecord.id }, { status: 200 });
});
