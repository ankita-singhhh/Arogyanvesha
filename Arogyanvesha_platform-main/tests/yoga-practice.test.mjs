import assert from "node:assert/strict";
import test from "node:test";
import { advanceBreath, advancePoseHold, advanceSession, appendPracticeHistory, cameraStartupErrorMessage, formatCountdown, PRACTICE_HISTORY_KEY, readPracticeHistory, skipSessionStep } from "../src/lib/yogaPractice.mjs";

const sequence = [
  { durationSeconds: 2, restSeconds: 1 },
  { durationSeconds: 3, restSeconds: 0 },
];

test("guided session countdown advances through pose, rest, and completion", () => {
  let state = { stepIndex: 0, phase: "pose", secondsRemaining: 2, completed: false };
  state = advanceSession(state, sequence);
  assert.deepEqual(state, { stepIndex: 0, phase: "pose", secondsRemaining: 1, completed: false });
  state = advanceSession(state, sequence);
  assert.deepEqual(state, { stepIndex: 0, phase: "rest", secondsRemaining: 1, completed: false });
  state = advanceSession(state, sequence);
  assert.deepEqual(state, { stepIndex: 1, phase: "pose", secondsRemaining: 3, completed: false });
  state = { ...state, secondsRemaining: 1 };
  assert.equal(advanceSession(state, sequence).completed, true);
  assert.equal(formatCountdown(65), "1:05");
});

test("skip control moves to the next pose and completes at the final pose", () => {
  const first = { stepIndex: 0, phase: "pose", secondsRemaining: 2, completed: false };
  assert.deepEqual(skipSessionStep(first, sequence), { stepIndex: 1, phase: "pose", secondsRemaining: 3, completed: false });
  assert.equal(skipSessionStep({ stepIndex: 1, phase: "pose", secondsRemaining: 3, completed: false }, sequence).completed, true);
});

test("breathing timer cycles through phases without requiring a hold", () => {
  const phases = [{ name: "Inhale", seconds: 2 }, { name: "Exhale", seconds: 3 }];
  assert.deepEqual(advanceBreath({ phaseIndex: 0, secondsRemaining: 1, cycles: 0 }, phases), { phaseIndex: 1, secondsRemaining: 3, cycles: 0 });
  assert.deepEqual(advanceBreath({ phaseIndex: 1, secondsRemaining: 1, cycles: 0 }, phases), { phaseIndex: 0, secondsRemaining: 2, cycles: 1 });
});

test("pose hold time advances only while alignment is correct and pauses when it is lost", () => {
  let state = { heldSeconds: 0, sessionSeconds: 0, completed: false };
  state = advancePoseHold(state, false, 3);
  assert.deepEqual(state, { heldSeconds: 0, sessionSeconds: 1, completed: false });
  state = advancePoseHold(state, true, 3);
  assert.deepEqual(state, { heldSeconds: 1, sessionSeconds: 2, completed: false });
  state = advancePoseHold(state, false, 3);
  assert.deepEqual(state, { heldSeconds: 1, sessionSeconds: 3, completed: false });
  state = advancePoseHold(state, true, 3);
  state = advancePoseHold(state, true, 3);
  assert.deepEqual(state, { heldSeconds: 3, sessionSeconds: 5, completed: true });
  assert.equal(advancePoseHold(state, true, 3), state);
});

test("camera permission and device failures have specific recovery guidance", () => {
  assert.match(cameraStartupErrorMessage({ name: "NotAllowedError" }), /permission was denied/i);
  assert.match(cameraStartupErrorMessage({ name: "NotFoundError" }), /no camera was found/i);
  assert.match(cameraStartupErrorMessage({ name: "NotReadableError" }), /already in use/i);
  assert.match(cameraStartupErrorMessage(new Error("model unavailable")), /model unavailable/i);
});

test("practice history reads safely and keeps newest local entries", () => {
  const storage = { value: "not-json", getItem() { return this.value; } };
  assert.deepEqual(readPracticeHistory(storage), []);
  storage.value = JSON.stringify([{ id: "older" }]);
  const updated = appendPracticeHistory(readPracticeHistory(storage), { id: "newer" });
  assert.deepEqual(updated.map((entry) => entry.id), ["newer", "older"]);
  assert.equal(PRACTICE_HISTORY_KEY, "arogya-yoga-practice-history");
});
