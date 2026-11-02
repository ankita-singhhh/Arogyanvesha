"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import { PoseReferenceImage } from "@/components/yoga/PoseReferenceImage";
import type { PoseAlignmentResult, PoseLandmark } from "@/lib/yogaPoseAlignment.mjs";
import { evaluatePoseAlignment } from "@/lib/yogaPoseAlignment.mjs";
import {
  advancePoseHold,
  appendPracticeHistory,
  cameraStartupErrorMessage,
  PRACTICE_HISTORY_KEY,
  readPracticeHistory,
} from "@/lib/yogaPractice.mjs";
import type { YogaPoseDefinition } from "@/lib/yogaPoses";

type PracticeState =
  | "idle"
  | "loading"
  | "running"
  | "paused"
  | "stopped"
  | "error"
  | "complete";
type Landmarker = import("@mediapipe/tasks-vision").PoseLandmarker;
type HistoryEntry = {
  id: string;
  title: string;
  poseId: string;
  durationSeconds: number;
  completedAt: string;
};
const INITIAL_ALIGNMENT: PoseAlignmentResult = {
  status: "unavailable",
  message: "Move fully into view and wait for the body tracker to find you.",
};

const MEDIAPIPE_VERSION = "1.2.0";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const CONNECTIONS: Array<[number, number]> = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24],
  [23, 24], [23, 25], [25, 27], [27, 29], [29, 31], [27, 31], [24, 26],
  [26, 28], [28, 30], [30, 32], [28, 32],
];

const ALIGNMENT_LABEL: Record<PoseAlignmentResult["status"], string> = {
  correct: "Correct position",
  almost: "Almost there",
  adjust: "Adjust your posture",
  unavailable: "Can't assess yet",
};

const ALIGNMENT_STYLE: Record<PoseAlignmentResult["status"], string> = {
  correct: "border-status-success bg-status-success-bg text-status-success",
  almost: "border-status-warning bg-status-warning-bg text-[#704000]",
  adjust: "border-status-error bg-status-error-bg text-status-error",
  unavailable: "border-border-default bg-bg-subtle text-text-muted",
};

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(
    safeSeconds % 60,
  ).padStart(2, "0")}`;
}

function drawLandmarks(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  landmarks: PoseLandmark[],
) {
  if (!video.videoWidth || !video.videoHeight) return;
  if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
  if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The browser could not create the pose overlay.");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#F2C94C";
  context.fillStyle = "#FFFFFF";
  context.lineWidth = Math.max(3, canvas.width / 240);
  for (const [from, to] of CONNECTIONS) {
    const first = landmarks[from];
    const second = landmarks[to];
    if (
      !first ||
      !second ||
      (first.visibility ?? 0) < 0.5 ||
      (second.visibility ?? 0) < 0.5
    ) {
      continue;
    }
    context.beginPath();
    context.moveTo(first.x * canvas.width, first.y * canvas.height);
    context.lineTo(second.x * canvas.width, second.y * canvas.height);
    context.stroke();
  }
  landmarks.forEach((point) => {
    if ((point.visibility ?? 0) < 0.5) return;
    context.beginPath();
    context.arc(
      point.x * canvas.width,
      point.y * canvas.height,
      Math.max(3, canvas.width / 140),
      0,
      Math.PI * 2,
    );
    context.fill();
  });
}

function clearOverlay(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context?.clearRect(0, 0, canvas.width, canvas.height);
}

export function YogaPosePractice({ pose }: { pose: YogaPoseDefinition }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const landmarkerRef = React.useRef<Landmarker | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const lastTimestampRef = React.useRef(0);
  const runningRef = React.useRef(false);
  const mountedRef = React.useRef(true);
  const alignmentRef = React.useRef<PoseAlignmentResult>(INITIAL_ALIGNMENT);
  const heldSecondsRef = React.useRef(0);
  const sessionSecondsRef = React.useRef(0);
  const savedRef = React.useRef(false);
  const [practiceState, setPracticeState] = React.useState<PracticeState>("idle");
  const [cameraFacing, setCameraFacing] = React.useState<"user" | "environment">("user");
  const [alignment, setAlignment] = React.useState<PoseAlignmentResult>(INITIAL_ALIGNMENT);
  const [cameraMessage, setCameraMessage] = React.useState(
    "Camera is off. Start practice when you are ready.",
  );
  const [heldSeconds, setHeldSeconds] = React.useState(0);
  const [sessionSeconds, setSessionSeconds] = React.useState(0);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [overlayError, setOverlayError] = React.useState(false);

  const updateAlignment = React.useCallback((next: PoseAlignmentResult) => {
    if (
      alignmentRef.current.status === next.status &&
      alignmentRef.current.message === next.message
    ) {
      return;
    }
    alignmentRef.current = next;
    setAlignment(next);
  }, []);

  const releaseResources = React.useCallback(() => {
    runningRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    clearOverlay(canvasRef.current);
  }, []);

  const stopPractice = React.useCallback(() => {
    releaseResources();
    setPracticeState("stopped");
    setCameraMessage("Practice stopped. Your camera is off.");
    updateAlignment({
      status: "unavailable",
      message: "Start practice again when you are ready.",
    });
  }, [releaseResources, updateAlignment]);

  const analyseFrame = React.useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (
      !runningRef.current ||
      !video ||
      !canvas ||
      !landmarker ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }
    const timestamp = performance.now();
    if (timestamp <= lastTimestampRef.current) return;
    lastTimestampRef.current = timestamp;

    try {
      const result = landmarker.detectForVideo(video, timestamp);
      const landmarks = result.landmarks[0]?.map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
        visibility: point.visibility,
        presence: point.presence,
      }));
      if (!landmarks) {
        clearOverlay(canvas);
        updateAlignment({
          status: "unavailable",
          message: "No body landmarks are clear yet. Step back and improve the lighting.",
        });
        return;
      }

      drawLandmarks(video, canvas, landmarks);
      updateAlignment(evaluatePoseAlignment(pose.id, landmarks));
    } catch (error) {
      releaseResources();
      setPracticeState("error");
      setCameraMessage(
        error instanceof Error
          ? `Live tracking stopped: ${error.message}`
          : "Live tracking stopped unexpectedly. Restart practice to try again.",
      );
      setOverlayError(
        error instanceof Error &&
          error.message.includes("pose overlay"),
      );
      updateAlignment({
        status: "unavailable",
        message: "Tracking stopped, so no posture correction is being shown.",
      });
    }
  }, [pose.id, releaseResources, updateAlignment]);

  const beginTracking = React.useCallback(() => {
    runningRef.current = true;
    const loop = () => {
      if (!runningRef.current) return;
      if (performance.now() - lastTimestampRef.current >= 100) analyseFrame();
      if (runningRef.current) frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }, [analyseFrame]);

  const startPractice = React.useCallback(async () => {
    releaseResources();
    savedRef.current = false;
    heldSecondsRef.current = 0;
    sessionSecondsRef.current = 0;
    setHeldSeconds(0);
    setSessionSeconds(0);
    setSaveMessage(null);
    setOverlayError(false);
    setPracticeState("loading");
    setCameraMessage("Requesting camera permission…");
    updateAlignment({
      status: "unavailable",
      message: "Wait for the camera and pose tracker to start.",
    });

    if (!navigator.mediaDevices?.getUserMedia) {
      setPracticeState("error");
      setCameraMessage(
        "Camera access is not available in this browser. Use a current browser over HTTPS.",
      );
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const handleCameraEnded = () => {
        if (!mountedRef.current) return;
        releaseResources();
        setPracticeState("error");
        setCameraMessage("The camera disconnected. Restart practice to try again.");
        updateAlignment({
          status: "unavailable",
          message: "Camera tracking stopped; no posture correction is being shown.",
        });
      };
      stream
        .getVideoTracks()
        .forEach((track) =>
          track.addEventListener("ended", handleCameraEnded, { once: true }),
        );
      const video = videoRef.current;
      if (!video) throw new Error("The camera preview could not be opened.");
      video.srcObject = stream;
      await video.play();
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      setCameraMessage("Loading the on-device pose tracker…");
      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`,
      );
      const landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      if (!mountedRef.current || !stream.active) {
        landmarker.close();
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      landmarkerRef.current = landmarker;
      setPracticeState("running");
      setCameraMessage("Tracking your pose in this browser. Camera video is not uploaded.");
      beginTracking();
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      releaseResources();
      if (!mountedRef.current) return;
      setPracticeState("error");
      setCameraMessage(cameraStartupErrorMessage(error));
      updateAlignment({
        status: "unavailable",
        message: "Tracking is off, so no posture correction is being shown.",
      });
    }
  }, [
    beginTracking,
    cameraFacing,
    releaseResources,
    updateAlignment,
  ]);

  const pausePractice = React.useCallback(() => {
    runningRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setPracticeState("paused");
    setCameraMessage("Tracking is paused. Your camera preview remains on until you stop practice.");
    updateAlignment({
      status: "unavailable",
      message: "Tracking is paused; alignment is not being checked.",
    });
  }, [updateAlignment]);

  const resumePractice = React.useCallback(() => {
    setPracticeState("running");
    setCameraMessage("Tracking your pose in this browser. Camera video is not uploaded.");
    updateAlignment({
      status: "unavailable",
      message: "Wait for the camera to check your alignment again.",
    });
    beginTracking();
  }, [beginTracking, updateAlignment]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseResources();
    };
  }, [releaseResources]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && streamRef.current) {
        stopPractice();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stopPractice]);

  React.useEffect(() => {
    if (practiceState !== "running") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const next = advancePoseHold(
        {
          heldSeconds: heldSecondsRef.current,
          sessionSeconds: sessionSecondsRef.current,
          completed: savedRef.current,
        },
        alignmentRef.current.status === "correct",
        pose.holdSeconds,
      );
      sessionSecondsRef.current = next.sessionSeconds;
      setSessionSeconds(sessionSecondsRef.current);
      heldSecondsRef.current = next.heldSeconds;
      setHeldSeconds(next.heldSeconds);
      if (next.completed && !savedRef.current) {
        savedRef.current = true;
        releaseResources();
        setPracticeState("complete");
        setCameraMessage("Hold complete. Your camera is off.");

        try {
          const entry: HistoryEntry = {
            id: `${pose.id}-${Date.now()}`,
            title: `${pose.sanskrit} · ${pose.english}`,
            poseId: pose.id,
            durationSeconds: sessionSecondsRef.current,
            completedAt: new Date().toISOString(),
          };
          const history = readPracticeHistory(window.localStorage) as HistoryEntry[];
          const updated = appendPracticeHistory(history, entry) as HistoryEntry[];
          window.localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event("arogya-yoga-history"));
          setSaveMessage("Pose completed and session time saved on this device only.");
        } catch {
          setSaveMessage("Pose completed. This browser could not save the session history.");
        }
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [
    pose.english,
    pose.holdSeconds,
    pose.id,
    pose.sanskrit,
    practiceState,
    releaseResources,
  ]);

  const progress = Math.min(100, (heldSeconds / pose.holdSeconds) * 100);
  const canStart = ["idle", "stopped", "error", "complete"].includes(practiceState);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/yoga"
        className="inline-flex min-h-10 items-center rounded-lg px-2 text-body-sm font-semibold text-brand-burgundy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
      >
        <span aria-hidden="true">←</span>&nbsp; All yoga poses
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-gold px-3 py-1 text-label font-semibold text-brand-burgundy">
            {pose.difficulty}
          </span>
          <span className="text-body-sm text-text-muted">
            Target hold: {pose.holdLabel}
          </span>
        </div>
        <h1 className="mt-2 text-h1 font-display font-bold text-text-heading">
          {pose.sanskrit} <span className="font-normal">· {pose.english}</span>
        </h1>
        <p className="mt-2 max-w-3xl text-body text-text-muted">{pose.summary}</p>
      </header>

      <section
        aria-label={`${pose.english} reference and live camera`}
        className="mt-6 grid gap-5 lg:grid-cols-2"
      >
        <figure className="overflow-hidden rounded-3xl border border-border-default bg-surface-card shadow-card">
          <div className="relative aspect-[4/3] bg-surface-sage">
            <PoseReferenceImage
              pose={pose}
              className="h-full w-full object-contain"
            />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default px-4 py-3 text-label text-text-muted">
            <span>Pose reference · {pose.imageCredit}</span>
            <span>
              <a
                href={pose.imageSource}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
              >
                Wikimedia Commons
              </a>
              {" · "}
              <a
                href={pose.imageLicenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
              >
                {pose.imageLicense}
              </a>
            </span>
          </figcaption>
        </figure>

        <section
          aria-label="Private live camera preview"
          className="overflow-hidden rounded-3xl border border-border-default bg-surface-card shadow-card"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <h2 className="font-semibold text-text-heading">Your practice</h2>
              <p className="text-label text-text-muted">
                Camera and landmarks stay in this browser.
              </p>
            </div>
            <label className="text-label font-medium text-text-body">
              Camera
              <select
                value={cameraFacing}
                onChange={(event) =>
                  setCameraFacing(
                    event.target.value === "environment" ? "environment" : "user",
                  )
                }
                disabled={!canStart}
                className="ml-2 min-h-10 rounded-lg border border-border-default bg-surface-card px-2 text-body-sm text-text-heading disabled:opacity-60"
              >
                <option value="user">Front</option>
                <option value="environment">Rear</option>
              </select>
            </label>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#1f211f]">
            {practiceState === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
                <span aria-hidden="true" className="text-4xl">◉</span>
                <p className="font-semibold">Your camera is off</p>
                <p className="max-w-sm text-body-sm text-white/75">
                  Start practice when you are ready. The browser will ask for camera permission.
                </p>
              </div>
            )}
            <video
              ref={videoRef}
              muted
              playsInline
              aria-label="Mirrored live camera preview"
              className={`absolute inset-0 h-full w-full -scale-x-100 object-cover ${
                ["loading", "running", "paused"].includes(practiceState) ? "block" : "hidden"
              }`}
            />
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
            />
            {["loading", "error", "stopped", "complete"].includes(practiceState) && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1f211f] px-6 text-center text-body-sm text-white/85">
                {practiceState === "loading"
                  ? "Starting the camera and loading pose tracking…"
                  : practiceState === "complete"
                    ? "Well done. Your camera has been turned off."
                    : practiceState === "error"
                      ? "Camera or tracking is unavailable."
                      : "Practice stopped. Your camera is off."}
              </div>
            )}
          </div>
          <div className="space-y-3 p-4">
            <p role="status" aria-live="polite" className="min-h-10 text-body-sm text-text-muted">
              {cameraMessage}
            </p>
            {overlayError && (
              <p className="text-body-sm text-status-warning">
                The pose overlay could not be drawn in this browser.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {canStart && (
                <Button
                  type="button"
                  onClick={() => void startPractice()}
                  disabled={practiceState === "loading"}
                >
                  {practiceState === "complete" ? "Practice again" : "Start practice"}
                </Button>
              )}
              {practiceState === "running" && (
                <Button type="button" variant="secondary" onClick={pausePractice}>
                  Pause
                </Button>
              )}
              {practiceState === "paused" && (
                <Button type="button" onClick={resumePractice}>
                  Resume
                </Button>
              )}
              {["running", "paused"].includes(practiceState) && (
                <Button type="button" variant="ghost" onClick={stopPractice}>
                  Stop practice
                </Button>
              )}
            </div>
          </div>
        </section>
      </section>

      <section
        aria-label="Live alignment and hold timer"
        className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]"
      >
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border p-5 ${ALIGNMENT_STYLE[alignment.status]}`}
        >
          <p className="text-label font-bold uppercase tracking-wider">
            {ALIGNMENT_LABEL[alignment.status]}
          </p>
          <p className="mt-2 text-body font-semibold">{alignment.message}</p>
          <p className="mt-2 text-body-sm">
            {pose.cameraView} Required landmarks: {pose.visibleLandmarks}.
          </p>
        </div>
        <div className="rounded-2xl border border-border-default bg-surface-card p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-label font-semibold uppercase tracking-wider text-text-muted">
                Hold timer
              </p>
              <p className="mt-1 text-h2 font-display font-bold text-text-heading">
                {formatTime(heldSeconds)}
              </p>
            </div>
            <p className="pb-1 text-body-sm text-text-muted">
              Target {formatTime(pose.holdSeconds)}
            </p>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-bg-subtle"
            role="progressbar"
            aria-label="Correctly aligned hold progress"
            aria-valuemin={0}
            aria-valuemax={pose.holdSeconds}
            aria-valuenow={heldSeconds}
          >
            <div
              className="h-full rounded-full bg-status-success transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-label text-text-muted">
            <span>
              {practiceState === "complete"
                ? "Hold complete"
                : alignment.status === "correct" && practiceState === "running"
                  ? "Timer running"
                  : "Timer advances only in correct position"}
            </span>
            <span>Session {formatTime(sessionSeconds)}</span>
          </div>
          {saveMessage && (
            <p role="status" className="mt-3 text-body-sm text-text-body">
              {saveMessage}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border-default bg-surface-card p-5">
          <h2 className="text-h4 font-semibold text-text-heading">How to enter the pose</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-body-sm leading-relaxed text-text-body">
            {pose.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
          <h3 className="mt-5 font-semibold text-text-heading">Alignment</h3>
          <p className="mt-1 text-body-sm leading-relaxed text-text-body">
            {pose.alignment}
          </p>
          <h3 className="mt-4 font-semibold text-text-heading">Breathing</h3>
          <p className="mt-1 text-body-sm leading-relaxed text-text-body">
            {pose.breathing}
          </p>
        </article>
        <article className="rounded-2xl border border-border-default bg-surface-card p-5">
          <h2 className="text-h4 font-semibold text-text-heading">Make it comfortable</h2>
          <dl className="mt-3 space-y-4 text-body-sm leading-relaxed">
            <div>
              <dt className="font-semibold text-text-heading">Benefits</dt>
              <dd className="mt-1 text-text-body">{pose.benefits}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-heading">Beginner option and props</dt>
              <dd className="mt-1 text-text-body">{pose.modification}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-heading">Safe exit</dt>
              <dd className="mt-1 text-text-body">{pose.exit}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-heading">Cautions</dt>
              <dd className="mt-1 text-text-body">{pose.cautions}</dd>
            </div>
          </dl>
        </article>
      </section>

      <aside className="mt-5 rounded-2xl border border-brand-gold/40 bg-surface-gold p-4 text-body-sm leading-relaxed text-text-body">
        <strong>Gentle reminder:</strong> Pose tracking uses approximate 2D
        landmarks, not a medical assessment. Camera angle, clothing, lighting,
        mobility, and occlusion can affect results. Follow your comfort rather
        than the indicator, and stop if a movement causes pain or dizziness.
        Live video and landmarks are processed in this browser and are not saved.
      </aside>
    </div>
  );
}
