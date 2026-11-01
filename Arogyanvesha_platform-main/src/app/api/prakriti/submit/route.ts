import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import type { Dosha } from "@/types";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { answers } = await request.json();

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Please provide valid answers." }, { status: 400 });
  }

  const optionIds = answers.map((answer) => answer?.selectedOptionId).filter((id): id is string => typeof id === "string");
  if (optionIds.length !== answers.length || new Set(optionIds).size !== optionIds.length) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Assessment answers are invalid." }, { status: 400 });
  }

  // The client only identifies selected options. Dosha values and question mapping
  // are resolved from the assessment tables so a client cannot forge a result.
  const { data: options, error: optionsError } = await supabase
    .from("prakriti_options")
    .select("id, question_id, dosha")
    .in("id", optionIds);

  if (optionsError || !options || options.length !== optionIds.length) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Assessment answers could not be verified." }, { status: 400 });
  }

  const optionsById = new Map(options.map((option) => [option.id, option]));
  const verifiedAnswers = answers.map((answer) => {
    const option = optionsById.get(answer.selectedOptionId);
    if (!option || option.question_id !== answer.questionId) return null;
    return { questionId: option.question_id, selectedOptionId: option.id, dosha: option.dosha as Dosha };
  });

  if (verifiedAnswers.some((answer) => !answer)) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Assessment answers do not match the questionnaire." }, { status: 400 });
  }

  const resolvedAnswers = verifiedAnswers as { questionId: number; selectedOptionId: string; dosha: Dosha }[];
  const vataScore = resolvedAnswers.filter((a) => a.dosha === "vata").length;
  const pittaScore = resolvedAnswers.filter((a) => a.dosha === "pitta").length;
  const kaphaScore = resolvedAnswers.filter((a) => a.dosha === "kapha").length;
  const total = resolvedAnswers.length;

  let vataPct = Math.round((vataScore / total) * 100);
  let pittaPct = Math.round((pittaScore / total) * 100);
  let kaphaPct = Math.round((kaphaScore / total) * 100);

  // Math rounding adjustments to sum to exactly 100
  const diff = 100 - (vataPct + pittaPct + kaphaPct);
  if (diff !== 0) {
    if (vataPct >= pittaPct && vataPct >= kaphaPct) vataPct += diff;
    else if (pittaPct >= vataPct && pittaPct >= kaphaPct) pittaPct += diff;
    else kaphaPct += diff;
  }

  const scores: { name: Dosha; value: number }[] = [
    { name: "vata", value: vataPct },
    { name: "pitta", value: pittaPct },
    { name: "kapha", value: kaphaPct },
  ];
  scores.sort((a, b) => b.value - a.value);

  const primaryDosha = scores[0]?.name || "vata";
  const secondaryDosha = scores[1]?.name || "pitta";

  // 1. Insert results into prakriti_results
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
    console.error("Submit Prakriti error:", resultError);
    return NextResponse.json({ code: "SUBMIT_FAILED", message: "Failed to save Prakriti results." }, { status: 500 });
  }

  // 2. Insert audit details into prakriti_answers
  const auditAnswers = resolvedAnswers.map((ans) => ({
    result_id: resultRecord.id,
    question_id: ans.questionId,
    option_id: ans.selectedOptionId,
    dosha: ans.dosha,
  }));

  const { error: answersError } = await supabase
    .from("prakriti_answers")
    .insert(auditAnswers);

  if (answersError) {
    console.error("Submit Prakriti answers audit error:", answersError);
  }

  // 3. Mark users table as completed
  await supabase
    .from("users")
    .update({
      prakriti_completed: true,
      primary_dosha: primaryDosha,
      secondary_dosha: secondaryDosha,
    })
    .eq("id", userId);

  // 4. Log in activity log
  await supabase
    .from("activity_log")
    .insert({
      user_id: userId,
      type: "prakriti",
      title: "Completed Prakriti Assessment",
      description: `Discovered Prakriti constitution: Dominant ${primaryDosha.toUpperCase()} (Secondary: ${secondaryDosha.toUpperCase()}).`,
    });

  return NextResponse.json({
    id: resultRecord.id,
    vataPct,
    pittaPct,
    kaphaPct,
    primaryDosha,
    secondaryDosha,
    completedAt: resultRecord.completed_at,
  }, { status: 200 });
});
