"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const CONFIG = {
  tongue: {
    title: "Tongue Photo",
    sanskrit: "Jihva Pariksha",
    instruction:
      'Open your mouth wide, stick out your tongue fully, then click "Take Photo".',
    guideLabel: "Position tongue inside the oval",
    frame: "aspect-video max-w-md",
    apiPath: "/api/diagnosis/tongue",
    tips: ["Open wide", "Bright light", "On waking"],
    GuideOverlay: () => (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="200"
          cy="240"
          rx="110"
          ry="90"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M140 160 Q200 120 260 160"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="5 5"
          fill="none"
          opacity="0.6"
        />
      </svg>
    ),
  },
  eye: {
    title: "Eye Photo",
    sanskrit: "Netra Pariksha",
    instruction:
      'Look straight at the camera lens, keep your eye fully open, then click "Take Photo".',
    guideLabel: "Centre your eye inside the oval",
    frame: "aspect-video max-w-md",
    apiPath: "/api/diagnosis/eye",
    tips: ["Look forward", "No contacts", "Even lighting"],
    GuideOverlay: () => (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="200"
          cy="200"
          rx="160"
          ry="95"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
          opacity="0.7"
        />
        <circle
          cx="200"
          cy="200"
          r="44"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="5 5"
          fill="none"
          opacity="0.6"
        />
      </svg>
    ),
  },
  skin: {
    title: "Skin Photo",
    sanskrit: "Twak Pariksha",
    instruction:
      "Take a bare-faced photo in natural light, facing the camera with your face inside the oval.",
    guideLabel: "Position your face within the oval",
    frame: "aspect-[3/4] max-w-xs",
    apiPath: "/api/diagnosis/skin",
    tips: ["Natural light", "No makeup", "Face forward"],
    GuideOverlay: () => (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="150"
          cy="185"
          rx="95"
          ry="125"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
          opacity="0.8"
        />
      </svg>
    ),
  },
} as const;

type DiagType = keyof typeof CONFIG;

function isDiagType(value: string): value is DiagType {
  return value in CONFIG;
}

function getCameraErrorMsg(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Camera permission denied. Allow camera access in your browser settings, then retry.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No camera found. You can still upload a photo.";
      case "NotReadableError":
      case "TrackStartError":
        return "Camera is in use by another app. Close it and try again.";
      case "SecurityError":
        return "Camera requires a secure connection (HTTPS or localhost).";
      default:
        return `Camera error: ${err.message || err.name}`;
    }
  }
  return "Could not access camera. Try uploading a photo instead.";
}

export default function DiagnosisCapturePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const rawType = params.type as string;
  const diagType: DiagType = isDiagType(rawType) ? rawType : "tongue";
  const config = CONFIG[diagType];

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [capturedFile, setCapturedFile] = React.useState<File | null>(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function startCamera() {
    setCameraError(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        window.location.protocol === "http:" &&
          window.location.hostname !== "localhost"
          ? "Camera requires HTTPS."
          : "Your browser does not support camera access.",
      );
      setCameraLoading(false);
      return;
    }

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (err) {
        if (
          err instanceof DOMException &&
          (err.name === "OverconstrainedError" ||
            err.name === "ConstraintNotSatisfiedError")
        ) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } else {
          throw err;
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (err) {
      setCameraError(getCameraErrorMsg(err));
    } finally {
      setCameraLoading(false);
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    if (diagType === "skin") {
      const target = 3 / 4;

      if (vw / vh > target) {
        sw = vh * target;
        sx = (vw - sw) / 2;
      } else {
        sh = vw / target;
        sy = (vh - sh) / 2;
      }
    }

    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `${diagType}_capture.jpg`, {
          type: "image/jpeg",
        });

        setCapturedFile(file);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.92));
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  }

  function retake() {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        type: "error",
        title: "Invalid file",
        description: "Please select an image.",
      });
      e.target.value = "";
      return;
    }

    stopCamera();
    setCapturedFile(file);

    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!capturedFile) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", capturedFile);

      // The existing Vercel route handles the image with Claude Vision.
      // Do not set Content-Type manually; Axios/browser adds the multipart boundary.
      const response = await api.post(config.apiPath, formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      const data = response.data;

      if (!data?.id) {
        throw new Error("The diagnosis API returned an invalid response.");
      }

      sessionStorage.setItem(
        `diagnosis_${diagType}_${data.id}`,
        JSON.stringify(data),
      );

      router.push(`/diagnosis/analyzing/${diagType}?id=${data.id}`);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };

      toast({
        type: "error",
        title: "Analysis failed",
        description:
          err.response?.data?.message ??
          err.message ??
          "Please try again.",
      });

      setIsAnalyzing(false);
    }
  }

  const GuideOverlay = config.GuideOverlay;

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={() => {
            stopCamera();
            router.push("/diagnosis");
          }}
          className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body w-fit"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          All Diagnoses
        </button>

        <div className="text-center">
          <p className="text-label text-text-muted uppercase tracking-wider mb-1">
            {config.sanskrit}
          </p>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-2">
            Capture {config.title}
          </h1>
          <p className="text-body text-text-muted max-w-sm mx-auto">
            {config.instruction}
          </p>
        </div>

        <div
          className={`relative ${config.frame} mx-auto w-full rounded-2xl overflow-hidden bg-black border-2 border-dashed border-border-strong`}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{
              transform: "scaleX(-1)",
              display: cameraActive && !capturedImage ? "block" : "none",
            }}
            muted
            playsInline
            aria-label="Camera preview"
          />

          <canvas ref={canvasRef} className="hidden" />

          {capturedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          {cameraActive && !capturedImage && <GuideOverlay />}

          {!cameraActive && !capturedImage && !cameraLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-subtle">
              <svg
                className="w-12 h-12 text-text-muted opacity-40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-body-sm text-text-muted text-center px-6">
                Click <strong>Open Camera</strong> or upload a photo
              </p>
            </div>
          )}

          {cameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <svg
                className="animate-spin w-8 h-8 text-brand-gold"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}

          {capturedImage && (
            <button
              type="button"
              onClick={retake}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold hover:bg-black/80"
            >
              Retake
            </button>
          )}

          {cameraError && !capturedImage && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-red-900/80 text-white text-xs text-center">
              {cameraError}
            </div>
          )}
        </div>

        {cameraActive && !capturedImage && (
          <p className="text-label text-text-muted text-center -mt-3">
            {config.guideLabel}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {config.tips.map((tip) => (
            <div
              key={tip}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-bg-subtle"
            >
              <span className="text-label text-text-muted text-center">{tip}</span>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />

        {!capturedImage ? (
          <div className="flex flex-col sm:flex-row gap-3">
            {!cameraActive ? (
              <Button
                variant="primary"
                className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
                isLoading={cameraLoading}
                onClick={startCamera}
              >
                Open Camera
              </Button>
            ) : (
              <Button
                variant="primary"
                className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
                onClick={takePhoto}
              >
                📸 Take Photo
              </Button>
            )}

            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                stopCamera();
                fileInputRef.current?.click();
              }}
            >
              Upload from gallery
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
              isLoading={isAnalyzing}
              onClick={handleAnalyze}
            >
              Analyze with AI
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={retake}
              disabled={isAnalyzing}
            >
              Retake Photo
            </Button>
          </div>
        )}

        <p className="text-micro text-text-disabled text-center">
          🔒 Your photo is only used for this one-time analysis and is never
          stored permanently.
        </p>
      </motion.div>
    </PageContainer>
  );
}
