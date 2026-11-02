import "server-only";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("replace-")) {
    throw new Error("GEMINI_UNAVAILABLE");
  }
  return new GoogleGenAI({ apiKey });
}

/** Sends one validated image to Gemini and returns its JSON response text. */
export async function analyzeImageWithGemini(
  prompt: string,
  image: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
): Promise<string> {
  const response = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [
      { text: prompt },
      { inlineData: { mimeType, data: image.toString("base64") } },
    ] }],
    config: { responseMimeType: "application/json", temperature: 0.2 },
  });

  if (!response.text?.trim()) throw new Error("GEMINI_EMPTY_RESPONSE");
  return response.text;
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !key.startsWith("replace-"));
}
