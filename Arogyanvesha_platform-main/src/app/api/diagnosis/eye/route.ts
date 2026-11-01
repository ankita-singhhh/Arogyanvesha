import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { anthropic } from "@/lib/ai/anthropic";
import { EYE_ANALYSIS_PROMPT } from "@/lib/ai/prompts";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Image file is required." }, { status: 400 });
  }

  // Normalise type — canvas.toBlob can sometimes omit the type
  const mimeType = file.type || "image/jpeg";
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(mimeType)) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Image size must be less than 5MB." }, { status: 400 });
  }

  const id = `eye_${userId}_${Date.now()}`;

  // Do not fabricate a health result when the configured AI service is unavailable.
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("replace-")) {
    return NextResponse.json({ code: "AI_UNAVAILABLE", message: "Eye analysis is temporarily unavailable." }, { status: 503 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Invoke Claude Vision
  let aiResponseText = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EYE_ANALYSIS_PROMPT },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/webp",
                data: buffer.toString("base64"),
              },
            },
          ],
        },
      ],
    });
    aiResponseText = response.content[0]?.type === "text" ? response.content[0].text : "{}";
  } catch (err) {
    console.error("Claude Vision API failure (eye):", err);
    return NextResponse.json({ code: "AI_ERROR", message: "Failed to analyze eye image using AI. Check your ANTHROPIC_API_KEY." }, { status: 500 });
  }

  // Parse JSON from Claude response
  let result: any = {};
  try {
    const jsonStart = aiResponseText.indexOf("{");
    const jsonEnd = aiResponseText.lastIndexOf("}") + 1;
    result = JSON.parse(aiResponseText.substring(jsonStart, jsonEnd));
  } catch {
    console.error("Claude malformed JSON (eye):", aiResponseText);
    return NextResponse.json({ code: "AI_PARSING_FAILED", message: "Failed to parse eye diagnosis." }, { status: 500 });
  }

  return NextResponse.json({
    id,
    type: "eye",
    dominantDosha: result.dominantDosha ?? null,
    scleraColor: result.scleraColor ?? null,
    observations: result.observations ?? [],
    imbalances: result.imbalances ?? [],
    score: typeof result.score === "number" ? result.score : null,
    recommendations: result.recommendations ?? [],
    dietAdvice: result.dietAdvice ?? "",
    herbsRecommended: result.herbsRecommended ?? [],
  }, { status: 200 });
});
