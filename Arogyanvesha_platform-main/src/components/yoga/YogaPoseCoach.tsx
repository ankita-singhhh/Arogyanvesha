"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { YogaPracticeStudio } from "@/components/yoga/YogaPracticeStudio";

type Point = { x: number; y: number; visibility?: number };
type MediaPipeLandmarker = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => { landmarks: Array<Array<{ x: number; y: number; visibility?: number }>> };
  close: () => void;
};

// Keep this in sync with the installed @mediapipe/tasks-vision version (see package.json).
const MEDIAPIPE_VERSION = "0.10.14";

export type YogaPose = {
  id: "tadasana" | "vrikshasana" | "trikonasana";
  name: string;
  sanskrit: string;
  image: string;
  description: string;
  instructions: string[];
  difficulty: "Beginner" | "Beginner-friendly";
  suggestedDuration: string;
  traditionalBenefits: string;
  evidenceNote: string;
  precautions: string;
  modification: string;
};

export const YOGA_POSES: YogaPose[] = [
  { id: "tadasana", name: "Mountain Pose", sanskrit: "Tadasana", image: "/images/dashboard/yoga.png", description: "A grounded standing posture for alignment and balance.", instructions: ["Stand tall with feet grounded.", "Relax your shoulders and lengthen through the crown.", "Keep your weight even through both feet."], difficulty: "Beginner", suggestedDuration: "30–60 seconds", traditionalBenefits: "Traditionally practised to cultivate steadiness, posture awareness, and grounding.", evidenceNote: "This is a traditional yoga description, not a medical claim. We do not present a specific health outcome as established evidence.", precautions: "Avoid standing unsupported if you feel unsteady or dizzy.", modification: "Practise beside a wall, with one hand on a chair, or seated tall in a chair." },
  { id: "vrikshasana", name: "Tree Pose", sanskrit: "Vrikshasana", image: "/images/dashboard/yoga.png", description: "A single-leg balance that develops steady focus.", instructions: ["Root through your standing foot.", "Place the other foot below or above the knee—never on it.", "Bring hands together or reach the arms upward."], difficulty: "Beginner-friendly", suggestedDuration: "20–30 seconds per side", traditionalBenefits: "Traditionally used to develop focus and a sense of balance.", evidenceNote: "Balance practice can be part of general physical activity, but this page does not claim that this pose prevents falls or treats a condition.", precautions: "Skip the single-leg version if balance feels uncertain, or if it causes pain.", modification: "Keep toes of the lifted foot on the floor, hold a chair or wall, or practise seated with one foot lightly lifted." },
  { id: "trikonasana", name: "Triangle Pose", sanskrit: "Trikonasana", image: "/images/dashboard/yoga.png", description: "A lateral standing stretch with a long, open chest.", instructions: ["Take a wide, stable stance.", "Extend both arms in one long line.", "Lengthen the spine as you hinge to the side."], difficulty: "Beginner-friendly", suggestedDuration: "20–30 seconds per side", traditionalBenefits: "Traditionally practised as a standing side stretch that encourages a broad, steady stance.", evidenceNote: "Traditional descriptions are not the same as established scientific evidence. No therapeutic benefit is claimed here.", precautions: "Avoid forcing the side bend; use extra caution with acute pain, dizziness, or a recent injury.", modification: "Rest the lower hand on a chair or thigh, reduce the stance, or practise a seated side reach." },
];

const MEDIAPIPE_CONNECTIONS: Array<[number, number]> = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31], [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
];

// MediaPipe Pose landmark indices
const LM = { ls: 11, rs: 12, le: 13, re: 14, lw: 15, rw: 16, lh: 23, rh: 24, lk: 25, rk: 26 } as const;

function jointAngle(a?: Point, b?: Point, c?: Point) {
  if (!a || !b || !c) return null;
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const magnitude = Math.hypot(ba.x, ba.y) * Math.hypot(bc.x, bc.y);
  if (!magnitude) return null;
  const cos = Math.max(-1, Math.min(1, (ba.x * bc.x + ba.y * bc.y) / magnitude));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

function hasConfidence(point?: Point) {
  return Boolean(point && (point.visibility ?? 0) >= 0.45);
}

function feedbackFor(pose: YogaPose["id"], points: Point[]) {
  const required = [points[LM.ls], points[LM.rs], points[LM.lh], points[LM.rh]];
  if (!required.every(hasConfidence)) {
    return { text: "Move fully into view so the key joints are easier to read.", angles: [] as string[] };
  }

  const backLeft = jointAngle(points[LM.ls], points[LM.lh], points[LM.lk]);
  const backRight = jointAngle(points[LM.rs], points[LM.rh], points[LM.rk]);
  const elbowLeft = jointAngle(points[LM.ls], points[LM.le], points[LM.lw]);
  const elbowRight = jointAngle(points[LM.rs], points[LM.re], points[LM.rw]);
  const leftWrist = points[LM.lw];
  const rightWrist = points[LM.rw];
  const leftShoulder = points[LM.ls];
  const rightShoulder = points[LM.rs];

  const angles = [
    backLeft && `Left side ${backLeft}°`,
    backRight && `Right side ${backRight}°`,
    elbowLeft && `Left elbow ${elbowLeft}°`,
    elbowRight && `Right elbow ${elbowRight}°`,
  ].filter(Boolean) as string[];

  const upright = [backLeft, backRight]
    .filter((value): value is number => value !== null)
    .some((value) => value < 155);
  if (upright) {
    return { text: "Straighten your back gently and lengthen through the crown of your head.", angles };
  }

  if (
    pose === "vrikshasana" &&
    hasConfidence(leftWrist) && hasConfidence(rightWrist) &&
    leftWrist && rightWrist && leftShoulder && rightShoulder &&
    Math.max(leftWrist.y, rightWrist.y) > Math.max(leftShoulder.y, rightShoulder.y) - 0.04
  ) {
    return { text: "Raise your arms slightly, keeping your shoulders relaxed.", angles };
  }

  if (
    pose === "trikonasana" &&
    hasConfidence(leftWrist) && hasConfidence(rightWrist) &&
    leftWrist && rightWrist &&
    Math.abs(leftWrist.y - rightWrist.y) > 0.12
  ) {
    return { text: "Extend both arms into a steadier horizontal line.", angles };
  }

  return { text: "Nice steady alignment—breathe smoothly and keep the pose comfortable.", angles };
}

export function YogaPoseCoach() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const poseLandmarkerRef = React.useRef<MediaPipeLandmarker | null>(null);
  const runningRef = React.useRef(false);
  const inFlightRef = React.useRef(false);
  const [selectedPose, setSelectedPose] = React.useState<YogaPose>(YOGA_POSES[0]!);
  const [status, setStatus] = React.useState("Choose a pose, then start the camera when you are ready.");
  const [feedback, setFeedback] = React.useState("Your live posture guidance will appear here.");
  const [angles, setAngles] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const stopCamera = React.useCallback(() => {
    runningRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsRunning(false);
  }, []);

  const drawSkeleton = React.useCallback((points: Point[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#D4AF37";
    context.fillStyle = "#ffffff";
    context.lineWidth = Math.max(3, canvas.width / 220);
    MEDIAPIPE_CONNECTIONS.forEach(([from, to]) => {
      const a = points[from];
      const b = points[to];
      if (!a || !b || !hasConfidence(a) || !hasConfidence(b)) return;
      context.beginPath();
      context.moveTo(a.x * canvas.width, a.y * canvas.height);
      context.lineTo(b.x * canvas.width, b.y * canvas.height);
      context.stroke();
    });
    points.forEach((point) => {
      if (!hasConfidence(point)) return;
      context.beginPath();
      context.arc(point.x * canvas.width, point.y * canvas.height, Math.max(3, canvas.width / 130), 0, Math.PI * 2);
      context.fill();
    });
  }, []);

  const loadModel = React.useCallback(async () => {
    if (poseLandmarkerRef.current) return;
    setStatus("Loading MediaPipe Pose Landmarker…");
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`,
    );
    poseLandmarkerRef.current = (await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })) as unknown as MediaPipeLandmarker;
  }, []);

  const analyseFrame = React.useCallback(() => {
    const video = videoRef.current;
    if (!runningRef.current || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const result = poseLandmarkerRef.current?.detectForVideo(video, performance.now());
      const points: Point[] = (result?.landmarks?.[0] ?? []).map((point) => ({
        x: point.x,
        y: point.y,
        visibility: point.visibility,
      }));
      if (points.length) {
        drawSkeleton(points);
        const next = feedbackFor(selectedPose.id, points);
        setFeedback(next.text);
        setAngles(next.angles);
        setStatus("MediaPipe (33 landmarks) is analysing locally.");
      } else {
        setStatus("No confident pose found. Step back and improve the lighting.");
      }
    } catch {
      setStatus("The live analysis paused. Try restarting the camera.");
    } finally {
      inFlightRef.current = false;
    }
  }, [drawSkeleton, selectedPose.id]);

  const beginLoop = React.useCallback(() => {
    const loop = () => {
      if (!runningRef.current) return;
      analyseFrame();
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }, [analyseFrame]);

  const startCamera = React.useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("This browser does not support camera access.");
      return;
    }
    try {
      stopCamera();
      setStatus("Requesting camera permission…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await loadModel();
      runningRef.current = true;
      setIsRunning(true);
      beginLoop();
    } catch (error) {
      stopCamera();
      const name = error instanceof DOMException ? error.name : "";
      setStatus(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access and try again."
          : "Could not start the camera or model. Please try again.",
      );
    }
  }, [beginLoop, loadModel, stopCamera]);

  // Restart the loop when the selected pose changes so feedback uses the new pose.
  React.useEffect(() => {
    if (!runningRef.current) return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    beginLoop();
  }, [beginLoop]);

  React.useEffect(
    () => () => {
      runningRef.current = false;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      poseLandmarkerRef.current?.close?.();
      poseLandmarkerRef.current = null;
    },
    [],
  );

  return (
    <section aria-labelledby="pose-coach-heading" className="mt-12 rounded-3xl border border-border-default bg-surface-card p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label font-semibold uppercase tracking-wider text-brand-burgundy">Practice studio</p>
          <h2 id="pose-coach-heading" className="mt-1 text-h2 font-display font-bold text-text-heading">Live yoga posture coach</h2>
          <p className="mt-2 max-w-2xl text-body-sm text-text-muted">
            Choose a pose, review its reference, then explicitly start your camera. Processing stays in this browser—no video is uploaded or stored.
          </p>
        </div>
        {isRunning && (
          <span className="rounded-full bg-sage-bg px-3 py-1 text-body-sm font-semibold text-sage">Active: MediaPipe</span>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {YOGA_POSES.map((pose) => (
          <button
            key={pose.id}
            type="button"
            onClick={() => setSelectedPose(pose)}
            className={`overflow-hidden rounded-2xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold ${
              selectedPose.id === pose.id ? "border-brand-gold ring-1 ring-brand-gold" : "border-border-default hover:border-brand-gold"
            }`}
            aria-pressed={selectedPose.id === pose.id}
          >
            <div className="relative h-32 w-full">
              <Image src={pose.image} alt={`${pose.sanskrit} yoga pose reference`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-center" />
            </div>
            <div className="p-4">
              <p className="text-label text-text-muted">{pose.sanskrit} · {pose.difficulty}</p>
              <h3 className="mt-1 font-semibold text-text-heading">{pose.name}</h3>
              <p className="mt-1 text-body-sm text-text-muted">{pose.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.8fr)]">
        <div className="overflow-hidden rounded-2xl bg-black">
          <div className="relative aspect-video">
            <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" aria-label="Live camera preview" />
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100" aria-label="Pose skeleton overlay" />
          </div>
        </div>

        <aside className="rounded-2xl bg-bg-subtle p-5">
          <p className="text-label font-semibold uppercase tracking-wider text-brand-burgundy">{selectedPose.sanskrit} · {selectedPose.name}</p>
          <p className="mt-1 text-body-sm text-text-muted">{selectedPose.difficulty} · Suggested hold: {selectedPose.suggestedDuration}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-body-sm text-text-body">
            {selectedPose.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
          <dl className="mt-4 space-y-3 border-t border-border-default pt-4 text-body-sm">
            <div><dt className="font-semibold text-text-heading">Traditional context</dt><dd className="text-text-muted">{selectedPose.traditionalBenefits}</dd></div>
            <div><dt className="font-semibold text-text-heading">Evidence note</dt><dd className="text-text-muted">{selectedPose.evidenceNote}</dd></div>
            <div><dt className="font-semibold text-text-heading">Precautions</dt><dd className="text-text-muted">{selectedPose.precautions}</dd></div>
            <div><dt className="font-semibold text-text-heading">Beginner / chair option</dt><dd className="text-text-muted">{selectedPose.modification}</dd></div>
          </dl>
        </aside>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void startCamera()} isLoading={false}>
          {isRunning ? "Restart camera" : "Start camera"}
        </Button>
        {isRunning && (
          <Button type="button" variant="secondary" onClick={stopCamera}>Stop session</Button>
        )}
        <p role="status" className="text-body-sm text-text-muted">{status}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-brand-gold/40 bg-[#fff9e7] p-4">
        <p className="text-label font-semibold uppercase tracking-wider text-text-heading">Approximate posture feedback — not medical advice</p>
        <p className="mt-1 text-body text-text-body">{feedback}</p>
        {angles.length > 0 && (
          <p className="mt-2 text-body-sm text-text-muted">Observed angles: {angles.join(" · ")}</p>
        )}
        <p className="mt-2 text-xs text-text-muted">
          Stop if you feel pain, dizziness, or discomfort. This visual estimate cannot diagnose injuries or replace a qualified instructor or clinician.
        </p>
      </div>

      <YogaPracticeStudio poses={YOGA_POSES} />
    </section>
  );
}