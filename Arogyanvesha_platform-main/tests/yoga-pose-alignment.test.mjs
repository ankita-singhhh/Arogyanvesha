import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePoseAlignment } from "../src/lib/yogaPoseAlignment.mjs";

const point = (x, y, visibility = 1) => ({ x, y, visibility });

function frame(overrides) {
  const landmarks = Array.from({ length: 33 }, () => point(0.5, 0.5, 0));
  for (const [index, value] of Object.entries(overrides)) {
    landmarks[index] = point(...value);
  }
  return landmarks;
}

const tadasana = frame({
  11: [0.4, 0.3], 12: [0.6, 0.3],
  23: [0.4, 0.55], 24: [0.6, 0.55],
  25: [0.4, 0.72], 26: [0.6, 0.72],
  27: [0.4, 0.95], 28: [0.6, 0.95],
});

const vrikshasana = frame({
  11: [0.4, 0.3], 12: [0.6, 0.3],
  23: [0.4, 0.55], 24: [0.6, 0.55],
  25: [0.4, 0.72], 26: [0.7, 0.68],
  27: [0.4, 0.95], 28: [0.62, 0.8],
});

const trikonasana = frame({
  11: [0.4, 0.3], 12: [0.6, 0.3],
  13: [0.27, 0.48], 14: [0.68, 0.16],
  15: [0.15, 0.8], 16: [0.75, 0.03],
  23: [0.42, 0.55], 24: [0.58, 0.55],
  25: [0.3, 0.75], 26: [0.7, 0.75],
  27: [0.15, 0.95], 28: [0.85, 0.95],
});

const warriorTwo = frame({
  11: [0.4, 0.3], 12: [0.6, 0.3],
  13: [0.28, 0.3], 14: [0.72, 0.3],
  15: [0.15, 0.3], 16: [0.85, 0.3],
  23: [0.4, 0.55], 24: [0.6, 0.55],
  25: [0.35, 0.7], 26: [0.72, 0.75],
  27: [0.15, 0.7], 28: [0.85, 0.95],
});

const downwardDog = frame({
  11: [0.55, 0.5], 13: [0.65, 0.65], 15: [0.75, 0.8],
  23: [0.7, 0.3], 25: [0.75, 0.45], 27: [0.8, 0.6],
});

const cobra = frame({
  11: [0.6, 0.4], 13: [0.55, 0.55], 15: [0.48, 0.65],
  23: [0.65, 0.7], 25: [0.8, 0.7], 27: [0.95, 0.7],
});

const balasana = frame({
  11: [0.35, 0.5], 23: [0.65, 0.45],
  25: [0.72, 0.72], 27: [0.55, 0.75],
});

const bridge = frame({
  11: [0.25, 0.55], 23: [0.55, 0.35],
  25: [0.72, 0.55], 27: [0.75, 0.75],
});

const validPoses = [
  ["tadasana", tadasana],
  ["vrikshasana", vrikshasana],
  ["trikonasana", trikonasana],
  ["virabhadrasana-ii", warriorTwo],
  ["adho-mukha-svanasana", downwardDog],
  ["bhujangasana", cobra],
  ["balasana", balasana],
  ["setu-bandhasana", bridge],
];

test("each supported pose has a distinct landmark-based correct-position check", () => {
  for (const [poseId, landmarks] of validPoses) {
    assert.equal(
      evaluatePoseAlignment(poseId, landmarks).status,
      "correct",
      `${poseId} should pass its pose-specific alignment rules`,
    );
  }
});

test("missing and low-confidence joints never produce confident corrections", () => {
  const incomplete = tadasana.map((landmark) => ({ ...landmark }));
  incomplete[27] = point(0.4, 0.95, 0.2);
  assert.equal(evaluatePoseAlignment("tadasana", incomplete).status, "unavailable");
  assert.equal(evaluatePoseAlignment("tadasana", []).status, "unavailable");
  assert.equal(
    evaluatePoseAlignment("adho-mukha-svanasana", downwardDog.map(() => point(0.5, 0.5, 0))).status,
    "unavailable",
  );
});

test("visible misalignment returns actionable feedback rather than a correct result", () => {
  const foldedKnees = tadasana.map((landmark) => ({ ...landmark }));
  foldedKnees[25] = point(0.3, 0.72);
  assert.equal(evaluatePoseAlignment("tadasana", foldedKnees).status, "adjust");
  assert.match(evaluatePoseAlignment("tadasana", foldedKnees).message, /knees/i);

  const straightLegs = warriorTwo.map((landmark) => ({ ...landmark }));
  straightLegs[25] = point(0.275, 0.625);
  assert.notEqual(evaluatePoseAlignment("virabhadrasana-ii", straightLegs).status, "correct");
});

test("pose-specific deviations produce targeted corrections where landmarks are visible", () => {
  const footOnKnee = vrikshasana.map((landmark) => ({ ...landmark }));
  footOnKnee[28] = point(0.4, 0.72);
  assert.match(
    evaluatePoseAlignment("vrikshasana", footOnKnee).message,
    /standing knee/i,
  );

  const narrowTriangle = trikonasana.map((landmark) => ({ ...landmark }));
  narrowTriangle[27] = point(0.42, 0.95);
  narrowTriangle[28] = point(0.58, 0.95);
  assert.match(
    evaluatePoseAlignment("trikonasana", narrowTriangle).message,
    /feet.*apart/i,
  );

  const lowHips = downwardDog.map((landmark) => ({ ...landmark }));
  lowHips[23] = point(0.7, 0.7);
  assert.match(
    evaluatePoseAlignment("adho-mukha-svanasana", lowHips).message,
    /hips back and up/i,
  );

  const lowChest = cobra.map((landmark) => ({ ...landmark }));
  lowChest[11] = point(0.6, 0.72);
  assert.match(
    evaluatePoseAlignment("bhujangasana", lowChest).message,
    /lift your chest/i,
  );

  const straightKnee = balasana.map((landmark) => ({ ...landmark }));
  straightKnee[27] = point(0.74, 1);
  assert.match(
    evaluatePoseAlignment("balasana", straightKnee).message,
    /bend your knees/i,
  );

  const lowBridge = bridge.map((landmark) => ({ ...landmark }));
  lowBridge[23] = point(0.55, 0.54);
  assert.match(
    evaluatePoseAlignment("setu-bandhasana", lowBridge).message,
    /lift your hips/i,
  );
});

test("left/right leg selection is symmetric for the tree balance", () => {
  const mirrored = vrikshasana.map((landmark) =>
    point(1 - landmark.x, landmark.y, landmark.visibility),
  );
  assert.equal(evaluatePoseAlignment("vrikshasana", mirrored).status, "correct");
});
