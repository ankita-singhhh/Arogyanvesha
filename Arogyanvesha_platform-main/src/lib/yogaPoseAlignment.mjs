const LANDMARK = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

const TOLERANCE = {
  visibility: 0.55,
  angle: 12,
  uprightOffset: 0.12,
  raisedHipOffset: 0.04,
};

const SIDES = [
  {
    name: "left",
    shoulder: LANDMARK.leftShoulder,
    elbow: LANDMARK.leftElbow,
    wrist: LANDMARK.leftWrist,
    hip: LANDMARK.leftHip,
    knee: LANDMARK.leftKnee,
    ankle: LANDMARK.leftAnkle,
  },
  {
    name: "right",
    shoulder: LANDMARK.rightShoulder,
    elbow: LANDMARK.rightElbow,
    wrist: LANDMARK.rightWrist,
    hip: LANDMARK.rightHip,
    knee: LANDMARK.rightKnee,
    ankle: LANDMARK.rightAnkle,
  },
];

function visible(point) {
  return Boolean(
    point &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      (point.visibility ?? point.presence ?? 0) >= TOLERANCE.visibility,
  );
}

function angle(a, b, c) {
  if (!visible(a) || !visible(b) || !visible(c)) return null;
  const first = { x: a.x - b.x, y: a.y - b.y };
  const second = { x: c.x - b.x, y: c.y - b.y };
  const magnitude =
    Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  if (!magnitude) return null;
  const cosine = Math.max(
    -1,
    Math.min(
      1,
      (first.x * second.x + first.y * second.y) / magnitude,
    ),
  );
  return (Math.acos(cosine) * 180) / Math.PI;
}

function result(status, message) {
  return { status, message };
}

function unavailable(message) {
  return result("unavailable", message);
}

function chooseVisibleSide(landmarks, names) {
  for (const side of SIDES) {
    const points = Object.fromEntries(
      names.map((name) => [name, landmarks[side[name]]]),
    );
    if (Object.values(points).every(visible)) {
      return { side, points };
    }
  }
  return null;
}

function standingPose(landmarks) {
  const ids = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftHip,
    LANDMARK.rightHip,
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle,
  ];
  if (!ids.every((id) => visible(landmarks[id]))) {
    return unavailable(
      "Keep both shoulders, hips, knees, and ankles in view; no posture correction is reliable yet.",
    );
  }

  const shoulderCenter = {
    x: (landmarks[LANDMARK.leftShoulder].x + landmarks[LANDMARK.rightShoulder].x) / 2,
    y: (landmarks[LANDMARK.leftShoulder].y + landmarks[LANDMARK.rightShoulder].y) / 2,
  };
  const hipCenter = {
    x: (landmarks[LANDMARK.leftHip].x + landmarks[LANDMARK.rightHip].x) / 2,
    y: (landmarks[LANDMARK.leftHip].y + landmarks[LANDMARK.rightHip].y) / 2,
  };
  const shoulderWidth = Math.abs(
    landmarks[LANDMARK.leftShoulder].x - landmarks[LANDMARK.rightShoulder].x,
  );
  const leftKnee = angle(
    landmarks[LANDMARK.leftHip],
    landmarks[LANDMARK.leftKnee],
    landmarks[LANDMARK.leftAnkle],
  );
  const rightKnee = angle(
    landmarks[LANDMARK.rightHip],
    landmarks[LANDMARK.rightKnee],
    landmarks[LANDMARK.rightAnkle],
  );

  if (shoulderWidth < 0.035) {
    return unavailable(
      "Face the camera more directly so both sides of your body can be seen.",
    );
  }
  if (leftKnee === null || rightKnee === null) {
    return unavailable("Move your full legs into view before checking alignment.");
  }
  if (Math.abs(shoulderCenter.x - hipCenter.x) / shoulderWidth > 0.3) {
    return result("adjust", "Stack your shoulders more comfortably over your hips.");
  }
  if (Math.abs(shoulderCenter.x - hipCenter.x) / shoulderWidth > TOLERANCE.uprightOffset) {
    return result("almost", "Gently bring your shoulders back over your hips.");
  }
  if (Math.min(leftKnee, rightKnee) < 145) {
    return result("adjust", "Lengthen your legs gently without locking your knees.");
  }
  if (Math.min(leftKnee, rightKnee) < 165) {
    return result("almost", "Let both legs grow a little longer, keeping the knees soft.");
  }
  return result("correct", "You look steady. Keep breathing and let your shoulders soften.");
}

function treePose(landmarks) {
  const ids = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftHip,
    LANDMARK.rightHip,
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle,
  ];
  if (!ids.every((id) => visible(landmarks[id]))) {
    return unavailable(
      "Keep both legs and hips in view; use a wall or chair while you find your balance.",
    );
  }
  const knees = SIDES.map((side) =>
    angle(
      landmarks[side.hip],
      landmarks[side.knee],
      landmarks[side.ankle],
    ),
  );
  if (knees.some((value) => value === null)) {
    return unavailable("Move both knees and ankles into view to assess this balance.");
  }
  const standingIndex = knees.findIndex((value) => value >= 150);
  const liftedIndex = standingIndex === 0 ? 1 : 0;
  if (standingIndex === -1) {
    return result("adjust", "Keep one leg comfortably long as your standing leg.");
  }
  if (knees[liftedIndex] >= 150) {
    return result("almost", "Bend the lifted knee outward, or use a floor-level kickstand.");
  }
  const liftedSide = SIDES[liftedIndex];
  const standingSide = SIDES[standingIndex];
  const liftedAnkle = landmarks[liftedSide.ankle];
  const standingKnee = landmarks[standingSide.knee];
  if (
    Math.hypot(liftedAnkle.x - standingKnee.x, liftedAnkle.y - standingKnee.y) <
      0.09
  ) {
    return result(
      "adjust",
      "Move your lifted foot above or below the standing knee, not against the joint.",
    );
  }
  if (
    landmarks[liftedSide.knee].y > standingKnee.y + 0.2
  ) {
    return result("almost", "Raise your lifted foot only as high as feels steady.");
  }
  const hipDifference = Math.abs(
    landmarks[LANDMARK.leftHip].y - landmarks[LANDMARK.rightHip].y,
  );
  if (hipDifference > 0.18) {
    return result("almost", "Level your hips gently; hold a support if needed.");
  }
  return result("correct", "Nice steady balance. Keep your gaze soft and your breath easy.");
}

function trianglePose(landmarks) {
  const ids = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftElbow,
    LANDMARK.rightElbow,
    LANDMARK.leftWrist,
    LANDMARK.rightWrist,
    LANDMARK.leftHip,
    LANDMARK.rightHip,
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle,
  ];
  if (!ids.every((id) => visible(landmarks[id]))) {
    return unavailable(
      "Keep both arms, legs, and feet in view; no correction is reliable while a joint is hidden.",
    );
  }
  const shoulderWidth = Math.abs(
    landmarks[LANDMARK.leftShoulder].x - landmarks[LANDMARK.rightShoulder].x,
  );
  const stanceWidth = Math.abs(
    landmarks[LANDMARK.leftAnkle].x - landmarks[LANDMARK.rightAnkle].x,
  );
  if (shoulderWidth < 0.025) {
    return unavailable("Turn slightly toward the camera so your stance can be seen.");
  }
  if (stanceWidth / shoulderWidth < 1.5) {
    return result("almost", "Step your feet a little farther apart, only as comfortable.");
  }
  const elbows = SIDES.map((side) =>
    angle(
      landmarks[side.shoulder],
      landmarks[side.elbow],
      landmarks[side.wrist],
    ),
  );
  if (elbows.some((value) => value === null)) {
    return unavailable("Bring both arms fully into view before checking their alignment.");
  }
  if (Math.min(...elbows) < 135) {
    return result("adjust", "Lengthen both arms comfortably without locking your elbows.");
  }
  const shouldersY =
    (landmarks[LANDMARK.leftShoulder].y + landmarks[LANDMARK.rightShoulder].y) / 2;
  const wrists = [
    landmarks[LANDMARK.leftWrist].y,
    landmarks[LANDMARK.rightWrist].y,
  ];
  const hasLowerHand = wrists.some((value) => value > shouldersY + 0.08);
  const hasUpperHand = wrists.some((value) => value < shouldersY - 0.08);
  if (!hasLowerHand || !hasUpperHand) {
    return result("almost", "Reach one arm up and let the other hand rest on a block or chair.");
  }
  const knees = SIDES.map((side) =>
    angle(
      landmarks[side.hip],
      landmarks[side.knee],
      landmarks[side.ankle],
    ),
  );
  if (knees.some((value) => value === null)) {
    return unavailable("Move both knees and ankles into view before checking your stance.");
  }
  if (Math.min(...knees) < 135) {
    return result("almost", "Lengthen your legs gently while keeping your knees unlocked.");
  }
  return result("correct", "Your stance looks spacious. Keep both sides of your waist long.");
}

function warriorTwoPose(landmarks) {
  const ids = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftElbow,
    LANDMARK.rightElbow,
    LANDMARK.leftWrist,
    LANDMARK.rightWrist,
    LANDMARK.leftHip,
    LANDMARK.rightHip,
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle,
  ];
  if (!ids.every((id) => visible(landmarks[id]))) {
    return unavailable(
      "Keep both arms and legs visible; step back if your hands or feet are out of frame.",
    );
  }
  const shoulderWidth = Math.abs(
    landmarks[LANDMARK.leftShoulder].x - landmarks[LANDMARK.rightShoulder].x,
  );
  const stanceWidth = Math.abs(
    landmarks[LANDMARK.leftAnkle].x - landmarks[LANDMARK.rightAnkle].x,
  );
  if (shoulderWidth < 0.025) {
    return unavailable("Face the camera at a slight angle so both feet can be compared.");
  }
  if (stanceWidth / shoulderWidth < 1.35) {
    return result("almost", "Move your feet a little farther apart for a stable base.");
  }
  const elbows = SIDES.map((side) =>
    angle(
      landmarks[side.shoulder],
      landmarks[side.elbow],
      landmarks[side.wrist],
    ),
  );
  if (elbows.some((value) => value === null)) {
    return unavailable("Keep your hands and elbows in view before checking arm position.");
  }
  if (Math.min(...elbows) < 140) {
    return result("adjust", "Reach through both arms and lengthen them comfortably.");
  }
  const shoulderY =
    (landmarks[LANDMARK.leftShoulder].y + landmarks[LANDMARK.rightShoulder].y) / 2;
  if (
    Math.abs(landmarks[LANDMARK.leftWrist].y - shoulderY) > 0.2 ||
    Math.abs(landmarks[LANDMARK.rightWrist].y - shoulderY) > 0.2
  ) {
    return result("almost", "Bring your arms closer to shoulder height.");
  }
  const knees = SIDES.map((side) =>
    angle(
      landmarks[side.hip],
      landmarks[side.knee],
      landmarks[side.ankle],
    ),
  );
  if (knees.some((value) => value === null)) {
    return unavailable("Move both knees and ankles into view before checking the stance.");
  }
  const bentIndex = knees.findIndex((value) => value < 150);
  if (bentIndex === -1) {
    return result("almost", "Bend one knee gently in the direction of its toes.");
  }
  if (knees[bentIndex] < 65) {
    return result("adjust", "Ease the front knee back to a comfortable bend.");
  }
  if (knees[bentIndex] > 140) {
    return result("almost", "Bend the front knee a little more, without forcing it.");
  }
  if (knees[1 - bentIndex] < 145) {
    return result("almost", "Lengthen the back leg while keeping its knee soft.");
  }
  return result("correct", "Your stance looks balanced. Keep the front knee pointing toward the toes.");
}

function sidePose(landmarks, id) {
  const needsElbow = id === "adho-mukha-svanasana" || id === "bhujangasana";
  const names = needsElbow
    ? ["shoulder", "elbow", "wrist", "hip", "knee", "ankle"]
    : ["shoulder", "hip", "knee", "ankle"];
  const selected = chooseVisibleSide(landmarks, names);
  if (!selected) {
    return unavailable(
      "Turn sideways and keep the near-side joints in frame; wait for tracking before adjusting.",
    );
  }
  const { points } = selected;
  const kneeAngle = angle(points.hip, points.knee, points.ankle);
  if (kneeAngle === null) {
    return unavailable("Keep your hip, knee, and ankle clearly visible.");
  }

  if (id === "adho-mukha-svanasana") {
    const elbowAngle = angle(points.shoulder, points.elbow, points.wrist);
    const shoulderAngle = angle(points.hip, points.shoulder, points.elbow);
    const hipAngle = angle(points.shoulder, points.hip, points.knee);
    if (elbowAngle === null || shoulderAngle === null || hipAngle === null) {
      return unavailable("Keep your shoulder, arm, hip, and knee visible for this check.");
    }
    if (points.hip.y > points.shoulder.y - TOLERANCE.raisedHipOffset) {
      return result("almost", "Lift your hips back and up while keeping your breath easy.");
    }
    if (shoulderAngle < 35 || shoulderAngle > 145) {
      return result("adjust", "Press the floor away and make a comfortable inverted V shape.");
    }
    if (elbowAngle < 120) {
      return result("almost", "Lengthen your arms while keeping the shoulders comfortable.");
    }
    if (hipAngle < 45 || hipAngle > 155) {
      return result("almost", "Adjust your stance so your back can lengthen comfortably.");
    }
    return result("correct", "Your hips look lifted. Keep your knees soft and neck relaxed.");
  }

  if (id === "bhujangasana") {
    const elbowAngle = angle(points.shoulder, points.elbow, points.wrist);
    if (elbowAngle === null) {
      return unavailable("Keep your near-side arm in view before checking this pose.");
    }
    if (kneeAngle < 140) {
      return result("almost", "Let your legs lengthen behind you without tightening them.");
    }
    if (points.shoulder.y > points.hip.y - TOLERANCE.raisedHipOffset) {
      return result("almost", "Lift your chest a little, keeping the movement small and comfortable.");
    }
    if (elbowAngle < 60) {
      return result("adjust", "Ease the bend in your elbows and keep your shoulders relaxed.");
    }
    if (elbowAngle > 175) {
      return result("almost", "Soften your elbows and avoid pushing into a deep backbend.");
    }
    return result("correct", "Your chest is gently lifted. Keep your pelvis grounded and breath easy.");
  }

  if (id === "balasana") {
    if (kneeAngle > 145) {
      return result("almost", "Bend your knees only as much as comfortable; use a cushion if helpful.");
    }
    if (points.shoulder.y < points.hip.y - 0.12) {
      return result("almost", "Fold forward only as far as comfortable and support your head.");
    }
    return result("correct", "You look settled. Keep your breath unrestricted and use support as needed.");
  }

  const hipAngle = angle(points.shoulder, points.hip, points.knee);
  if (hipAngle === null) {
    return unavailable("Keep your shoulder, hip, knee, and ankle clearly visible.");
  }
  if (kneeAngle < 65 || kneeAngle > 150) {
    return result("almost", "Keep both feet planted and bend your knees comfortably.");
  }
  if (points.hip.y > points.shoulder.y - TOLERANCE.raisedHipOffset) {
    return result("almost", "Lift your hips gently while keeping your neck still.");
  }
  if (points.hip.y > points.knee.y + 0.05) {
    return result("almost", "Press evenly through your feet to raise your hips a little.");
  }
  if (hipAngle < 40 || hipAngle > 160) {
    return result("almost", "Make a smaller, comfortable lift through your hips.");
  }
  return result("correct", "Your bridge looks steady. Keep your neck relaxed and still.");
}

export function evaluatePoseAlignment(poseId, landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 33) {
    return unavailable("Move fully into view and wait for the body tracker to find you.");
  }

  switch (poseId) {
    case "tadasana":
      return standingPose(landmarks);
    case "vrikshasana":
      return treePose(landmarks);
    case "trikonasana":
      return trianglePose(landmarks);
    case "virabhadrasana-ii":
      return warriorTwoPose(landmarks);
    case "adho-mukha-svanasana":
    case "bhujangasana":
    case "balasana":
    case "setu-bandhasana":
      return sidePose(landmarks, poseId);
    default:
      return unavailable("This pose does not have an alignment check yet.");
  }
}
