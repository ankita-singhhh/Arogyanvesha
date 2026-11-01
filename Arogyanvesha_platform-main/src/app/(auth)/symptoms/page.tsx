"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useSymptomStore } from "@/stores";

const COMMON_SYMPTOMS = [
  "Headache",
  "Fever",
  "Cough",
  "Fatigue",
  "Nausea",
  "Bloating",
  "Joint pain",
  "Sore throat",
  "Insomnia",
  "Anxiety",
  "Acid reflux",
  "Skin irritation",
  "Shortness of breath",
];

const DURATIONS = [
  "Less than a day",
  "1-3 days",
  "4-7 days",
  "More than a week",
  "Chronic (months+)",
];

const BODY_AREAS = ["Head", "Chest", "Abdomen", "Throat", "Back", "Joints", "Skin"];

const EMERGENCY_WORDS = [
  "chest pain",
  "chhati me dard",
  "sine me dard",
  "can't breathe",
  "difficulty breathing",
  "saas nahi aa rahi",
  "dum ghut raha",
  "slurred speech",
  "paralysis",
  "lakwa",
  "unconscious",
  "behosh",
  "coughing blood",
  "khoon ki ulti",
];

export default function SymptomsPage() {
  const router = useRouter();
  const {
    symptomText,
    setSymptomText,
    selectedSymptoms,
    toggleSymptomChip,
    removeSymptomChip,
    addSymptomChip,
    duration,
    setDuration,
    severity,
    setSeverity,
    bodyAreas,
    toggleBodyArea,
    isLoading,
    loadingStage,
    error,
    analyze,
  } = useSymptomStore();

  const [customChipInput, setCustomChipInput] = React.useState("");

  // Check if text triggers immediate local safety warning
  const isEmergencyInput = React.useMemo(() => {
    const lower = symptomText.toLowerCase();
    return EMERGENCY_WORDS.some((w) => lower.includes(w));
  }, [symptomText]);

  const handleAddCustomChip = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customChipInput.trim()) {
      e.preventDefault();
      addSymptomChip(customChipInput.trim());
      setCustomChipInput("");
    }
  };

  const stageLabels = {
    idle: "Preparing analysis...",
    extracting: "Step 1/4: Normalizing multilingual symptoms...",
    predicting: "Step 2/4: Consulting clinical Random Forest model...",
    retrieving: "Step 3/4: Retrieving evidence from AYUSH knowledge base...",
    synthesizing: "Step 4/4: Formulating Ayurvedic wellness guidance...",
  };

  const canSubmit = (symptomText.trim().length > 0 || selectedSymptoms.length > 0) && !isLoading;

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">
            Clinical & Ayurvedic Symptom Checker
          </h1>
          <p className="text-body text-text-muted">
            Describe what you're experiencing in English, Hindi, or Hinglish for clinical probability modeling and evidence-grounded Ayurvedic wellness.
          </p>
        </div>

        {/* Emergency Alert Banner */}
        {isEmergencyInput ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-status-error-bg border border-status-error/40 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-status-error font-bold">
              <span className="text-xl">⚠️</span>
              <p className="text-body font-semibold">URGENT MEDICAL WARNING</p>
            </div>
            <p className="text-body-sm text-text-body leading-relaxed">
              You entered symptoms that may indicate an acute medical emergency. Please stop and call emergency services immediately (<strong>112</strong> / <strong>102</strong> in India, <strong>911</strong> in US). Do not delay emergency hospital care for Ayurvedic remedies.
            </p>
          </motion.div>
        ) : (
          <div className="p-4 rounded-xl bg-status-warning-bg border border-status-warning/20">
            <p className="text-body-sm text-text-body">
              ⚕️ <strong>Medical Disclaimer:</strong> Arogyanvesha is an informational research and wellness support platform. Candidate conditions are statistical probabilities from a trained Random Forest model and are never a clinical diagnosis.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div role="alert" className="p-4 rounded-xl bg-status-error-bg border border-status-error/30 text-status-error text-body-sm flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => analyze(router.push)} disabled={isLoading}>
              Retry
            </Button>
          </div>
        )}

        {/* Free text input */}
        <div className="flex flex-col gap-1.5">
          <Input
            label="Describe your symptoms (English, Hindi, Hinglish)"
            placeholder="e.g. mujhe 2 din se sir dard aur bukhar hai, or severe headache with tiredness"
            value={symptomText}
            onChange={(e) => setSymptomText(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-micro text-text-muted">
            Tip: You can describe symptoms naturally in Hindi, Hinglish, or English.
          </p>
        </div>

        {/* Active recognized/selected chips */}
        {selectedSymptoms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-body-sm font-semibold text-text-heading">
                Active Symptom Chips ({selectedSymptoms.length})
              </p>
              <button
                type="button"
                onClick={() => selectedSymptoms.forEach((s) => removeSymptomChip(s))}
                className="text-micro text-text-muted hover:text-brand-burgundy transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((s) => (
                <Chip
                  key={s}
                  selected={true}
                  onDismiss={() => removeSymptomChip(s)}
                  size="md"
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Common Symptoms Selection */}
        <div>
          <p className="text-body-sm font-medium text-text-heading mb-3">
            Quick Symptom Suggestions (Click to toggle)
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <Chip
                key={s}
                selected={selectedSymptoms.includes(s)}
                onClick={() => toggleSymptomChip(s)}
                disabled={isLoading}
              >
                {s}
              </Chip>
            ))}
          </div>
        </div>

        {/* Custom chip input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 h-9 px-3 rounded-lg border border-border-default bg-surface-card text-body-sm focus:outline-none focus:ring-1 focus:ring-brand-burgundy"
            placeholder="Add custom symptom and press Enter..."
            value={customChipInput}
            onChange={(e) => setCustomChipInput(e.target.value)}
            onKeyDown={handleAddCustomChip}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (customChipInput.trim()) {
                addSymptomChip(customChipInput.trim());
                setCustomChipInput("");
              }
            }}
            disabled={!customChipInput.trim() || isLoading}
          >
            Add
          </Button>
        </div>

        {/* Affected Body Area */}
        <div>
          <p className="text-body-sm font-medium text-text-heading mb-3">Affected body area</p>
          <div className="flex flex-wrap gap-2">
            {BODY_AREAS.map((a) => (
              <Chip
                key={a}
                selected={bodyAreas.includes(a)}
                onClick={() => toggleBodyArea(a)}
                disabled={isLoading}
              >
                {a}
              </Chip>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p className="text-body-sm font-medium text-text-heading mb-3">How long have you had this?</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <Chip
                key={d}
                selected={duration === d}
                onClick={() => setDuration(d)}
                disabled={isLoading}
              >
                {d}
              </Chip>
            ))}
          </div>
        </div>

        {/* Severity Slider */}
        <Slider
          label="Symptom Severity (1 = Very mild, 10 = Very severe)"
          value={severity}
          onChange={setSeverity}
          min={1}
          max={10}
          disabled={isLoading}
          formatValue={(v) =>
            v <= 3 ? `${v} (Mild)` : v <= 6 ? `${v} (Moderate)` : `${v} (Severe)`
          }
        />

        {/* Loading progress indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-surface-card border border-brand-burgundy/30 flex flex-col gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-brand-burgundy border-t-transparent rounded-full animate-spin" />
                <p className="text-body font-semibold text-brand-burgundy">
                  {stageLabels[loadingStage]}
                </p>
              </div>
              <div className="w-full bg-bg-subtle h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-brand-burgundy h-full rounded-full"
                  initial={{ width: "15%" }}
                  animate={{
                    width:
                      loadingStage === "extracting"
                        ? "25%"
                        : loadingStage === "predicting"
                        ? "50%"
                        : loadingStage === "retrieving"
                        ? "75%"
                        : "95%",
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <Button
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          className="bg-gradient-burgundy border-0 shadow-burgundy cursor-pointer disabled:opacity-40"
          onClick={() => analyze(router.push)}
        >
          {isLoading ? "Running Pipeline..." : "Analyze Symptoms & Get Guidance"}
        </Button>
      </motion.div>
    </PageContainer>
  );
}
