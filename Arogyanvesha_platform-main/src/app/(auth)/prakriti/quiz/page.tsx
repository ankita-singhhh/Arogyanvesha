"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { usePrakritiStore } from "@/stores";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Dosha, PrakritiQuestion } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK QUESTIONS — replace with API call
───────────────────────────────────────────────────────── */

const MOCK_QUESTIONS: PrakritiQuestion[] = [
  {
    id: 0, category: "physical",
    text: "How would you describe your body frame?",
    options: [
      { id: "v0", text: "Thin, light, difficult to gain weight", dosha: "vata" },
      { id: "p0", text: "Medium build, muscular, easy to maintain weight", dosha: "pitta" },
      { id: "k0", text: "Large frame, solid, tends to gain weight easily", dosha: "kapha" },
    ],
  },
  {
    id: 1, category: "physical",
    text: "What best describes your skin?",
    options: [
      { id: "v1", text: "Dry, rough, or thin — tends to crack", dosha: "vata" },
      { id: "p1", text: "Sensitive, oily in places, prone to redness or rashes", dosha: "pitta" },
      { id: "k1", text: "Thick, smooth, oily, soft — rarely has issues", dosha: "kapha" },
    ],
  },
  {
    id: 2, category: "digestive",
    text: "How is your digestion typically?",
    options: [
      { id: "v2", text: "Irregular — sometimes strong, sometimes weak", dosha: "vata" },
      { id: "p2", text: "Strong — I get very hungry and irritable if I miss meals", dosha: "pitta" },
      { id: "k2", text: "Slow and steady — I can skip meals without much discomfort", dosha: "kapha" },
    ],
  },
  {
    id: 3, category: "mental",
    text: "How do you typically make decisions?",
    options: [
      { id: "v3", text: "Quickly, but I often change my mind", dosha: "vata" },
      { id: "p3", text: "Decisively and confidently — I stick to my choices", dosha: "pitta" },
      { id: "k3", text: "Slowly and carefully — I prefer to think it over", dosha: "kapha" },
    ],
  },
  {
    id: 4, category: "sleep",
    text: "How would you describe your sleep?",
    options: [
      { id: "v4", text: "Light, interrupted — I wake up easily", dosha: "vata" },
      { id: "p4", text: "Moderate — I sleep well but sometimes have vivid dreams", dosha: "pitta" },
      { id: "k4", text: "Deep and long — I find it hard to wake up", dosha: "kapha" },
    ],
  },
  {
    id: 5, category: "emotional",
    text: "Under stress, how do you typically react?",
    options: [
      { id: "v5", text: "Anxious, worried, overwhelmed", dosha: "vata" },
      { id: "p5", text: "Irritable, angry, demanding", dosha: "pitta" },
      { id: "k5", text: "Withdrawn, stubborn, avoidant", dosha: "kapha" },
    ],
  },
  {
    id: 6, category: "physical",
    text: "How do you feel about cold weather?",
    options: [
      { id: "v6", text: "I dislike cold — I always feel chilly", dosha: "vata" },
      { id: "p6", text: "I prefer cool weather — I overheat easily", dosha: "pitta" },
      { id: "k6", text: "I can tolerate cold but prefer warmth", dosha: "kapha" },
    ],
  },
  {
    id: 7, category: "mental",
    text: "How would you describe your learning style?",
    options: [
      { id: "v7", text: "I learn quickly but also forget quickly", dosha: "vata" },
      { id: "p7", text: "I focus intensely and remember well", dosha: "pitta" },
      { id: "k7", text: "I learn slowly but retain information very well", dosha: "kapha" },
    ],
  },
  {
    id: 8, category: "digestive",
    text: "How is your appetite?",
    options: [
      { id: "v8", text: "Variable — sometimes I forget to eat", dosha: "vata" },
      { id: "p8", text: "Strong — I get very hungry at regular times", dosha: "pitta" },
      { id: "k8", text: "Moderate — I could comfortably eat less", dosha: "kapha" },
    ],
  },
  {
    id: 9, category: "physical",
    text: "How would you describe your hair?",
    options: [
      { id: "v9", text: "Dry, frizzy, thin or coarse", dosha: "vata" },
      { id: "p9", text: "Fine, oily, prone to early greying or thinning", dosha: "pitta" },
      { id: "k9", text: "Thick, lustrous, oily", dosha: "kapha" },
    ],
  },
  {
    id: 10, category: "emotional",
    text: "How do you typically feel emotionally?",
    options: [
      { id: "v10", text: "Enthusiastic but prone to anxiety", dosha: "vata" },
      { id: "p10", text: "Motivated and goal-oriented but can be critical", dosha: "pitta" },
      { id: "k10", text: "Content and easygoing but prone to attachment", dosha: "kapha" },
    ],
  },
  {
    id: 11, category: "physical",
    text: "How are your joints and bones?",
    options: [
      { id: "v11", text: "Prominent, cracking sounds, prone to dryness", dosha: "vata" },
      { id: "p11", text: "Flexible and moderately built", dosha: "pitta" },
      { id: "k11", text: "Large, well-padded, rarely have issues", dosha: "kapha" },
    ],
  },
  {
    id: 12, category: "mental",
    text: "How do you handle change?",
    options: [
      { id: "v12", text: "I embrace change but it can make me anxious", dosha: "vata" },
      { id: "p12", text: "I manage change well when I can plan for it", dosha: "pitta" },
      { id: "k12", text: "I prefer routine and resist change", dosha: "kapha" },
    ],
  },
  {
    id: 13, category: "digestive",
    text: "How do you experience thirst?",
    options: [
      { id: "v13", text: "Variable — I often forget to drink water", dosha: "vata" },
      { id: "p13", text: "High — I get very thirsty frequently", dosha: "pitta" },
      { id: "k13", text: "Low — I rarely feel very thirsty", dosha: "kapha" },
    ],
  },
  {
    id: 14, category: "physical",
    text: "How is your energy throughout the day?",
    options: [
      { id: "v14", text: "Bursts of energy followed by fatigue", dosha: "vata" },
      { id: "p14", text: "Sustained energy — I push myself", dosha: "pitta" },
      { id: "k14", text: "Steady but sometimes slow to start", dosha: "kapha" },
    ],
  },
  {
    id: 15, category: "emotional",
    text: "What are your speech patterns like?",
    options: [
      { id: "v15", text: "Fast, talkative, sometimes tangential", dosha: "vata" },
      { id: "p15", text: "Clear, precise, and persuasive", dosha: "pitta" },
      { id: "k15", text: "Slow, deliberate, thoughtful", dosha: "kapha" },
    ],
  },
  {
    id: 16, category: "sleep",
    text: "How long do you usually sleep?",
    options: [
      { id: "v16", text: "Less than 7 hours — I wake early or late", dosha: "vata" },
      { id: "p16", text: "6–8 hours — I sleep consistently", dosha: "pitta" },
      { id: "k16", text: "More than 8 hours — I love sleep", dosha: "kapha" },
    ],
  },
  {
    id: 17, category: "physical",
    text: "How do you respond to exercise?",
    options: [
      { id: "v17", text: "I enjoy it but tire quickly and need rest", dosha: "vata" },
      { id: "p17", text: "I love competition and push hard", dosha: "pitta" },
      { id: "k17", text: "I can sustain long workouts but need motivation to start", dosha: "kapha" },
    ],
  },
  {
    id: 18, category: "mental",
    text: "How would others describe your personality?",
    options: [
      { id: "v18", text: "Creative, expressive, enthusiastic", dosha: "vata" },
      { id: "p18", text: "Confident, determined, intelligent", dosha: "pitta" },
      { id: "k18", text: "Caring, patient, reliable", dosha: "kapha" },
    ],
  },
  {
    id: 19, category: "digestive",
    text: "What foods do you naturally crave?",
    options: [
      { id: "v19", text: "Warm, moist, oily foods", dosha: "vata" },
      { id: "p19", text: "Cool, refreshing, sweet and bitter foods", dosha: "pitta" },
      { id: "k19", text: "Light, dry, spicy foods", dosha: "kapha" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   QUIZ OPTION CARD
───────────────────────────────────────────────────────── */

interface OptionCardProps {
  option: PrakritiQuestion["options"][0];
  selected: boolean;
  onSelect: () => void;
  index: number;
}

function OptionCard({ option, selected, onSelect, index }: OptionCardProps) {


  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-5 rounded-xl border-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        selected
          ? "border-brand-burgundy bg-brand-burgundy/5 shadow-burgundy"
          : "border-border-default bg-surface-card hover:border-brand-burgundy/40 hover:shadow-md",
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-4">
        {/* Option letter */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-body-sm transition-all duration-200",
          selected
            ? "bg-brand-burgundy text-text-inverted"
            : "bg-bg-subtle text-text-muted",
        )}>
          {String.fromCharCode(65 + index)}
        </div>

        <div className="flex-1">
          <p className={cn(
            "text-body font-medium leading-snug transition-colors duration-200",
            selected ? "text-brand-burgundy" : "text-text-body",
          )}>
            {option.text}
          </p>
        </div>

        {/* Selected indicator */}
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200",
          selected ? "border-brand-burgundy bg-brand-burgundy" : "border-border-strong",
        )}>
          {selected && (
            <motion.svg className="w-3 h-3 text-text-inverted" viewBox="0 0 12 12" fill="none"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function PrakritiQuizPage() {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const {
    questions,
    answers,
    currentQuestionIndex,
    status,
    startQuiz,
    answerQuestion,
    goToPreviousQuestion,
    setAnalyzing,
  } = usePrakritiStore();

  // Init quiz with mock questions
  React.useEffect(() => {
    if (status === "idle" || questions.length === 0) {
      startQuiz(MOCK_QUESTIONS);
    }
  }, [status, questions.length, startQuiz]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestionIndex);
  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;
  const isLast = currentQuestionIndex === questions.length - 1;
  const canProceed = !!currentAnswer;

  const handleSelect = (optionId: string, dosha: Dosha) => {
    if (!currentQuestion) return;
    answerQuestion({
      questionId: currentQuestionIndex,
      selectedOptionId: optionId,
      dosha,
    });
  };

  const handleNext = () => {
    if (isLast && canProceed) {
      setAnalyzing();
      router.push("/prakriti/analyzing");
    }
  };

  const categoryLabels: Record<string, string> = {
    physical: "Physical Traits",
    mental: "Mental Traits",
    digestive: "Digestive Health",
    emotional: "Emotional Patterns",
    sleep: "Sleep Patterns",
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-border-default">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-burgundy to-brand-gold"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <PageContainer className="py-12 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => {
              if (currentQuestionIndex > 0) goToPreviousQuestion();
              else router.push("/prakriti");
            }}
            className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
            </svg>
            {currentQuestionIndex > 0 ? "Previous" : "Back"}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-body-sm text-text-muted">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i < currentQuestionIndex ? "bg-brand-burgundy w-4" :
                    i === currentQuestionIndex ? "bg-brand-gold w-6" :
                    "bg-border-default w-1.5",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestionIndex}
            initial={{ opacity: 0, x: shouldReduce ? 0 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: shouldReduce ? 0 : -30 }}
            transition={{ duration: 0.3 }}>

            {/* Category badge */}
            <div className="mb-4">
              <span className="text-label font-semibold text-brand-gold uppercase tracking-wider">
                {categoryLabels[currentQuestion.category]}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-h2 font-display font-bold text-text-heading mb-8 leading-snug">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-10">
              {currentQuestion.options.map((option, i) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={currentAnswer?.selectedOptionId === option.id}
                  onSelect={() => handleSelect(option.id, option.dosha)}
                  index={i}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <p className="text-body-sm text-text-muted">
                {answers.length} of {questions.length} answered
              </p>

              {isLast ? (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!canProceed}
                  onClick={handleNext}
                  className="bg-gradient-burgundy border-0 shadow-burgundy"
                >
                  Complete Assessment
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!canProceed}
                  onClick={() => {
                    if (canProceed && currentQuestion) {
                      answerQuestion({
                        questionId: currentQuestionIndex,
                        selectedOptionId: currentAnswer!.selectedOptionId,
                        dosha: currentAnswer!.dosha,
                      });
                    }
                  }}
                >
                  Next question
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
                  </svg>
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </PageContainer>
    </div>
  );
}