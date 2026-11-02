import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { analyzeImageWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";
import { TONGUE_ANALYSIS_PROMPT } from "@/lib/ai/prompts";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as { id: string }).id;

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

  const id = `tongue_${userId}_${Date.now()}`;

  // Do not fabricate a health result when the configured AI service is unavailable.
  if (!isGeminiConfigured()) {
    return NextResponse.json({ code: "AI_UNAVAILABLE", message: "Tongue analysis is temporarily unavailable." }, { status: 503 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Invoke Gemini Vision.
  let aiResponseText = "";
  try {
    aiResponseText = await analyzeImageWithGemini(
      TONGUE_ANALYSIS_PROMPT,
      buffer,
      mimeType as "image/jpeg" | "image/png" | "image/webp",
    );
  } catch (err) {
    console.error("Gemini Vision API failure (tongue):", err);
    return NextResponse.json({ code: "AI_ERROR", message: "Failed to analyze tongue image using Gemini." }, { status: 503 });
  }

  // Parse JSON from Gemini response.
  let result: Record<string, unknown> = {};
  try {
    const jsonStart = aiResponseText.indexOf("{");
    const jsonEnd = aiResponseText.lastIndexOf("}") + 1;
    result = JSON.parse(aiResponseText.substring(jsonStart, jsonEnd));
  } catch {
    console.error("Gemini malformed JSON (tongue):", aiResponseText);
    return NextResponse.json({ code: "AI_PARSING_FAILED", message: "Failed to parse tongue diagnosis." }, { status: 500 });
  }

  return NextResponse.json({
    id,
    type: "tongue",
    dominantDosha: typeof result.dominantDosha === "string" ? result.dominantDosha : null,
    coatingColor: typeof result.coatingColor === "string" ? result.coatingColor : null,
    coatingThickness: typeof result.coatingThickness === "string" ? result.coatingThickness : null,
    tongueColor: typeof result.tongueColor === "string" ? result.tongueColor : null,
    observations: Array.isArray(result.observations) ? result.observations : [],
    imbalances: Array.isArray(result.imbalances) ? result.imbalances : [],
    score: typeof result.score === "number" ? result.score : null,
    recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    dietAdvice: typeof result.dietAdvice === "string" ? result.dietAdvice : "",
    herbsRecommended: Array.isArray(result.herbsRecommended) ? result.herbsRecommended : [],
  }, { status: 200 });
});
