
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

const PYTHON_API_URL =
  process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

function logUpstreamFailure(
  diagnostic: Record<string, unknown>
): void {
  // Never log user symptom text, request payloads, headers, or credentials.
  console.warn(
    `Symptom analysis upstream failure: ${JSON.stringify(diagnostic)}`
  );
}

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const userPlan = (session.user as any).plan || "free";

  const {
    symptomText,
    symptomChips,
    duration,
    severity,
    bodyAreas,
    language,
    age,
  } = await request.json();

  const cleanedText =
    typeof symptomText === "string" ? symptomText.trim() : "";

  const cleanedChips = Array.isArray(symptomChips)
    ? symptomChips.filter(
        (chip): chip is string =>
          typeof chip === "string" && chip.trim().length > 0
      )
    : [];

  if (!cleanedText && cleanedChips.length === 0) {
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message:
          "Describe a symptom or select at least one symptom chip.",
      },
      { status: 400 }
    );
  }

  // 1. Enforce daily limit: free=10, pro=50, elite=unlimited
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("symptom_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (countError) {
    console.error("Symptom count check error:", countError);
  }

  const currentCount = count || 0;
  const limits: Record<string, number> = {
    free: 10,
    pro: 50,
    elite: 999999,
  };
  const dailyLimit = limits[userPlan] || 10;

  if (currentCount >= dailyLimit) {
    return NextResponse.json(
      {
        code: "LIMIT_EXCEEDED",
        message: `You have reached your daily symptom analysis limit of ${dailyLimit} requests for your ${userPlan.toUpperCase()} plan. Please upgrade to continue.`,
      },
      { status: 429 }
    );
  }

  // 2. Fetch user's Prakriti context if available
  const { data: prakritiData } = await supabase
    .from("prakriti_results")
    .select(
      "primary_dosha, secondary_dosha, vata_pct, pitta_pct, kapha_pct"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const userPrakriti = prakritiData
    ? {
        type: prakritiData.primary_dosha
          ? prakritiData.primary_dosha.charAt(0).toUpperCase() +
            prakritiData.primary_dosha.slice(1)
          : "Vata",
        primary: prakritiData.primary_dosha,
        secondary: prakritiData.secondary_dosha,
        percentages: {
          Vata: prakritiData.vata_pct,
          Pitta: prakritiData.pitta_pct,
          Kapha: prakritiData.kapha_pct,
        },
      }
    : null;

  // 3. Call FastAPI backend
  let backendResponse: any = null;

  try {
    const backendPayload = {
      symptom_text: cleanedText,
      symptom_chips: cleanedChips,
      duration: duration || "1-3 days",
      severity: typeof severity === "number" ? severity : 5,
      body_areas: Array.isArray(bodyAreas) ? bodyAreas : [],
      user_prakriti: userPrakriti,
      language: typeof language === "string" ? language : "auto",
      age: typeof age === "number" ? age : undefined,
    };

    const res = await fetch(`${PYTHON_API_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      // Read the upstream response once and log its validation details.
      const upstreamBody = await res.text();

      logUpstreamFailure({
        endpoint: "/api/v1/analyze",
        status: res.status,
        errorType: "HttpError",
        upstreamBody: upstreamBody.slice(0, 2000),
      });

      return NextResponse.json(
        {
          code: "UPSTREAM_HTTP_ERROR",
          message:
            "The analysis service could not process this request. Please try again shortly.",
        },
        { status: res.status >= 500 ? 503 : res.status }
      );
    }

    try {
      backendResponse = await res.json();
    } catch (error) {
      logUpstreamFailure({
        endpoint: "/api/v1/analyze",
        errorType:
          error instanceof Error ? error.name : "UnknownError",
      });

      return NextResponse.json(
        {
          code: "UPSTREAM_INVALID_RESPONSE",
          message:
            "The analysis service returned an invalid response. Please try again shortly.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    logUpstreamFailure({
      endpoint: "/api/v1/analyze",
      errorType:
        error instanceof Error ? error.name : "UnknownError",
      isTimeout:
        error instanceof Error && error.name === "TimeoutError",
    });

    return NextResponse.json(
      {
        code: "UPSTREAM_NETWORK_ERROR",
        message:
          "The analysis service is unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  // 4. Emergency safeguard
  if (
    backendResponse.is_emergency ||
    backendResponse.urgency === "emergency"
  ) {
    backendResponse.urgency = "emergency";
    backendResponse.recommendations = [
      "Please seek immediate emergency medical care (Call 112 / 102 / 911).",
      "Do not delay urgent medical treatment for home remedies or Ayurvedic self-treatment.",
    ];
  }

  // 5. Store result in Supabase
  const possibleCauses = (
    backendResponse.candidate_conditions || []
  ).map((condition: any) => String(condition.condition));

  const { data: dbRecord, error: insertError } = await supabase
    .from("symptom_analyses")
    .insert({
      user_id: userId,
      symptom_text: cleanedText,
      symptom_chips: cleanedChips,
      duration: duration || null,
      severity: severity || null,
      body_areas: bodyAreas || [],
      dosha_imbalance:
        backendResponse.dosha_imbalance || "Unknown imbalance",
      possible_causes:
        possibleCauses.length > 0
          ? possibleCauses
          : ["General imbalance"],
      recommendations: backendResponse.recommendations || [],
      herbs: backendResponse.herbs || [],
      urgency: backendResponse.urgency || "low",
      disclaimer:
        backendResponse.disclaimer ||
        "Consult a Vaidya for severe issues.",
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Insert symptom analysis error:", insertError);
  }

  // 6. Insert activity log
  await supabase.from("activity_log").insert({
    user_id: userId,
    type: "chat",
    title: "Analyzed Symptoms via AI Vaidya & Clinical ML",
    description: `Analyzed symptoms: "${cleanedText.substring(
      0,
      30
    )}..." (Candidate: ${
      backendResponse.candidate_conditions?.[0]?.condition ||
      "General"
    }).`,
  });

  // 7. Return combined response
  const finalResponse = {
    ...(dbRecord || {}),
    ...backendResponse,
    id: dbRecord?.id || "temp_id",
    created_at:
      dbRecord?.created_at || new Date().toISOString(),
  };

  return NextResponse.json(finalResponse, { status: 200 });
});
