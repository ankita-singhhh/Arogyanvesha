import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import type { Dosha } from "@/types";

type SubmittedAnswer = {
  questionId: number;
  selectedOptionId: string;
};

type VerifiedAnswer = {
  questionId: number;
  selectedOptionId: string;
  dosha: Dosha;
};

const VALID_DOSHAS: Dosha[] = ["vata", "pitta", "kapha"];

export const POST = withApiHandler(async (request: NextRequest) => {
  // 1. Authenticate user
  const session = await getSession();
  const userId = (session.user as { id: string }).id;

  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Please sign in to submit the assessment." },
      { status: 401 }
    );
  }

  // 2. Parse and validate request body
  let body: { answers?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const answers = body?.answers;

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Please provide valid answers." },
      { status: 400 }
    );
  }

  const submittedAnswers: SubmittedAnswer[] = [];

  for (const answer of answers) {
    if (
      !answer ||
      !Number.isInteger(answer.questionId) ||
      typeof answer.selectedOptionId !== "string" ||
      answer.selectedOptionId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          code: "BAD_REQUEST",
          message:
            "Each answer must contain a numeric questionId and a selectedOptionId.",
        },
        { status: 400 }
      );
    }

    submittedAnswers.push({
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId.trim(),
    });
  }

  const optionIds = submittedAnswers.map((answer) => answer.selectedOptionId);
  const questionIds = submittedAnswers.map((answer) => answer.questionId);

  if (
    new Set(optionIds).size !== optionIds.length ||
    new Set(questionIds).size !== questionIds.length
  ) {
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message: "Each question must have exactly one unique selected option.",
      },
      { status: 400 }
    );
  }

  // 3. Verify selected options against Supabase
  const { data: options, error: optionsError } = await supabase
    .from("prakriti_options")
    .select("id, question_id, dosha")
    .in("id", optionIds);

  if (optionsError) {
    console.error("Prakriti option lookup failed:", {
      message: optionsError.message,
      code: optionsError.code,
      details: optionsError.details,
      hint: optionsError.hint,
    });

    return NextResponse.json(
      {
        code: "OPTION_LOOKUP_FAILED",
        message: "Could not verify assessment options. Please try again.",
      },
      { status: 500 }
    );
  }

  if (!options || options.length !== optionIds.length) {
    const foundIds = new Set((options ?? []).map((option) => option.id));
    const missingOptionIds = optionIds.filter((id) => !foundIds.has(id));

    console.error("Prakriti option verification failed:", {
      submittedCount: optionIds.length,
      returnedCount: options?.length ?? 0,
      missingOptionIds,
    });

    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message: "Some selected options could not be found. Please reload the assessment and try again.",
      },
      { status: 400 }
    );
  }

  const optionsById = new Map(options.map((option) => [option.id, option]));

  // 4. Verify option/question relationship and dosha values
  const verifiedAnswers: VerifiedAnswer[] = [];

  for (const answer of submittedAnswers) {
    const option = optionsById.get(answer.selectedOptionId);

    if (!option || Number(option.question_id) !== answer.questionId) {
      console.error("Prakriti question-option mismatch:", {
        submittedQuestionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        databaseQuestionId: option?.question_id,
      });

      return NextResponse.json(
        {
          code: "BAD_REQUEST",
          message: "An answer does not match its question. Please reload the assessment.",
        },
        { status: 400 }
      );
    }

    const dosha = String(option.dosha).toLowerCase() as Dosha;

    if (!VALID_DOSHAS.includes(dosha)) {
      console.error("Invalid dosha value in prakriti_options:", {
        optionId: option.id,
        dosha: option.dosha,
      });

      return NextResponse.json(
        {
          code: "INVALID_ASSESSMENT_DATA",
          message: "The assessment contains invalid option data.",
        },
        { status: 500 }
      );
    }

    verifiedAnswers.push({
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      dosha,
    });
  }

  // 5. Calculate scores
  const vataScore = verifiedAnswers.filter((answer) => answer.dosha === "vata").length;
  const pittaScore = verifiedAnswers.filter((answer) => answer.dosha === "pitta").length;
  const kaphaScore = verifiedAnswers.filter((answer) => answer.dosha === "kapha").length;
  const total = verifiedAnswers.length;

  let vataPct = Math.round((vataScore / total) * 100);
  let pittaPct = Math.round((pittaScore / total) * 100);
  let kaphaPct = Math.round((kaphaScore / total) * 100);

  // Adjust rounding so percentages sum to exactly 100
  const difference = 100 - (vataPct + pittaPct + kaphaPct);

  if (difference !== 0) {
    if (vataPct >= pittaPct && vataPct >= kaphaPct) {
      vataPct += difference;
    } else if (pittaPct >= vataPct && pittaPct >= kaphaPct) {
      pittaPct += difference;
    } else {
      kaphaPct += difference;
    }
  }

  const scores: { name: Dosha; value: number }[] = [
    { name: "vata", value: vataPct },
    { name: "pitta", value: pittaPct },
    { name: "kapha", value: kaphaPct },
  ];

  scores.sort((a, b) => b.value - a.value);

  const primaryDosha = scores[0].name;
  const secondaryDosha = scores[1].name;

  // 6. Save assessment result
  const { data: resultRecord, error: resultError } = await supabase
    .from("prakriti_results")
    .insert({
      user_id: userId,
      vata_score: vataScore,
      pitta_score: pittaScore,
      kapha_score: kaphaScore,
      vata_pct: vataPct,
      pitta_pct: pittaPct,
      kapha_pct: kaphaPct,
      primary_dosha: primaryDosha,
      secondary_dosha: secondaryDosha,
      recommendations: JSON.stringify([]),
    })
    .select("id, completed_at")
    .single();

  if (resultError || !resultRecord) {
    console.error("Submit Prakriti result insert failed:", resultError);

    return NextResponse.json(
      {
        code: "SUBMIT_FAILED",
        message: "Failed to save Prakriti results.",
      },
      { status: 500 }
    );
  }

  // 7. Save answer audit records
  const auditAnswers = verifiedAnswers.map((answer) => ({
    result_id: resultRecord.id,
    question_id: answer.questionId,
    option_id: answer.selectedOptionId,
    dosha: answer.dosha,
  }));

  const { error: answersError } = await supabase
    .from("prakriti_answers")
    .insert(auditAnswers);

  if (answersError) {
    // Keep the assessment result, but log the audit failure for investigation.
    console.error("Prakriti answer audit insert failed:", answersError);
  }

  // 8. Update user's assessment status
  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      prakriti_completed: true,
      primary_dosha: primaryDosha,
      secondary_dosha: secondaryDosha,
    })
    .eq("id", userId);

  if (userUpdateError) {
    console.error("Prakriti user update failed:", userUpdateError);
  }

  // 9. Log activity
  const { error: activityError } = await supabase
    .from("activity_log")
    .insert({
      user_id: userId,
      type: "prakriti",
      title: "Completed Prakriti Assessment",
      description: `Discovered Prakriti constitution: Dominant ${primaryDosha.toUpperCase()} (Secondary: ${secondaryDosha.toUpperCase()}).`,
    });

  if (activityError) {
    console.error("Prakriti activity log insert failed:", activityError);
  }

  // 10. Return result
  return NextResponse.json(
    {
      id: resultRecord.id,
      vataPct,
      pittaPct,
      kaphaPct,
      primaryDosha,
      secondaryDosha,
      completedAt: resultRecord.completed_at,
    },
    { status: 200 }
  );
});
