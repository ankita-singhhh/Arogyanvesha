export const PRACTICE_HISTORY_KEY = "arogya-yoga-practice-history";

export function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function cameraStartupErrorMessage(error) {
  const name =
    error && typeof error === "object" && "name" in error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow camera access in your browser settings, then try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found. Connect a camera or try a device with a camera.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use or could not start. Close other camera apps and try again.";
  }
  if (error instanceof Error) return `Practice could not start: ${error.message}`;
  return "Practice could not start. Check camera access and try again.";
}

export function advanceSession(state, sequence) {
  if (!sequence[state.stepIndex]) return { ...state, completed: true, secondsRemaining: 0 };
  if (state.secondsRemaining > 1) return { ...state, secondsRemaining: state.secondsRemaining - 1 };
  const current = sequence[state.stepIndex];
  if (state.phase === "pose" && current.restSeconds > 0) return { ...state, phase: "rest", secondsRemaining: current.restSeconds };
  const nextIndex = state.stepIndex + 1;
  if (!sequence[nextIndex]) return { ...state, completed: true, secondsRemaining: 0 };
  return { stepIndex: nextIndex, phase: "pose", secondsRemaining: sequence[nextIndex].durationSeconds, completed: false };
}

export function skipSessionStep(state, sequence) {
  const nextIndex = state.stepIndex + 1;
  if (!sequence[nextIndex]) return { ...state, completed: true, secondsRemaining: 0 };
  return { stepIndex: nextIndex, phase: "pose", secondsRemaining: sequence[nextIndex].durationSeconds, completed: false };
}

export function advancePoseHold(state, isAligned, targetSeconds) {
  if (state.completed) return state;
  const heldSeconds = isAligned
    ? Math.min(targetSeconds, state.heldSeconds + 1)
    : state.heldSeconds;
  return {
    heldSeconds,
    sessionSeconds: state.sessionSeconds + 1,
    completed: heldSeconds >= targetSeconds,
  };
}

export function advanceBreath(state, phases) {
  if (state.secondsRemaining > 1) return { ...state, secondsRemaining: state.secondsRemaining - 1 };
  const nextIndex = (state.phaseIndex + 1) % phases.length;
  return { phaseIndex: nextIndex, secondsRemaining: phases[nextIndex].seconds, cycles: nextIndex === 0 ? state.cycles + 1 : state.cycles };
}

export function readPracticeHistory(storage) {
  try {
    const raw = storage.getItem(PRACTICE_HISTORY_KEY);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function appendPracticeHistory(history, entry) {
  return [entry, ...history].slice(0, 30);
}
