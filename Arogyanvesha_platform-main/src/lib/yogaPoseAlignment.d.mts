import type { PoseId } from "./yogaPoses";

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
};

export type PoseAlignmentResult = {
  status: "correct" | "almost" | "adjust" | "unavailable";
  message: string;
};

export function evaluatePoseAlignment(
  poseId: PoseId,
  landmarks: PoseLandmark[],
): PoseAlignmentResult;
