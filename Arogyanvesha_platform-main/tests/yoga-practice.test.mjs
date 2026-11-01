import assert from "node:assert/strict";
import test from "node:test";
import { advanceBreath, advanceSession, appendPracticeHistory, formatCountdown, PRACTICE_HISTORY_KEY, readPracticeHistory, skipSessionStep } from "../src/lib/yogaPractice.mjs";

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

test("practice history reads safely and keeps newest local entries", () => {
  const storage = { value: "not-json", getItem() { return this.value; } };
  assert.deepEqual(readPracticeHistory(storage), []);
  storage.value = JSON.stringify([{ id: "older" }]);
  const updated = appendPracticeHistory(readPracticeHistory(storage), { id: "newer" });
  assert.deepEqual(updated.map((entry) => entry.id), ["newer", "older"]);
  assert.equal(PRACTICE_HISTORY_KEY, "arogya-yoga-practice-history");
});
