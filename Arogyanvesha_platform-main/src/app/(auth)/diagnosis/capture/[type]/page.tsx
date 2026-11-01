"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useToast } from "@/components/ui/Toast";

/* ─── per-type config ─────────────────────────────────────── */
const CONFIG = {
  tongue: {
    title: "Tongue Photo",
    sanskrit: "Jihva Pariksha",
    instruction: "Open your mouth wide, stick out your tongue fully, then click \"Take Photo\".",
    guideLabel: "Position tongue inside the oval",
    frame: "aspect-video max-w-md",
    tips: [
      { label: "Open wide",    icon: "M12 4.5c0 0-3 2-3 7.5s3 7.5 3 7.5" },
      { label: "Bright light", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25M16.773 19.273l-1.591-1.591M12 18.75V21m-4.773-2.477l1.591-1.591M5.25 12H3m4.477-6.773L9.068 6.82" },
      { label: "On waking",    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
    apiPath: "/api/diagnosis/tongue",
    GuideOverlay: () => (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
        <ellipse cx="200" cy="240" rx="110" ry="90" stroke="#D4AF37" strokeWidth="2" strokeDasharray="8 6" fill="none" opacity="0.7" />
        <path d="M140 160 Q200 120 260 160" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  eye: {
    title: "Eye Photo",
    sanskrit: "Netra Pariksha",
    instruction: "Look straight at the camera lens, keep your eye fully open, then click \"Take Photo\".",
    guideLabel: "Centre your eye inside the oval",
    frame: "aspect-video max-w-md",
    tips: [
      { label: "Look forward",       icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" },
      { label: "No contacts",        icon: "M9 12.75L11.25 15 15 9.75" },
      { label: "Even lighting",      icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25" },
    ],
    apiPath: "/api/diagnosis/eye",
    GuideOverlay: () => (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
        <ellipse cx="200" cy="200" rx="160" ry="95" stroke="#D4AF37" strokeWidth="2" strokeDasharray="8 6" fill="none" opacity="0.7" />
        <circle cx="200" cy="200" r="44" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  skin: {
    title: "Skin Photo",
    sanskrit: "Twak Pariksha",
    instruction: "Take a bare-faced photo in natural light, facing the camera with your face inside the oval, then click \"Take Photo\".",
    guideLabel: "Position your face within the oval",
    // Portrait frame so the face oval is not stretched.
    frame: "aspect-[3/4] max-w-xs",
    tips: [
      { label: "Natural light", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25M16.773 19.273l-1.591-1.591M12 18.75V21m-4.773-2.477l1.591-1.591M5.25 12H3m4.477-6.773L9.068 6.82" },
      { label: "No makeup",     icon: "M9 12.75L11.25 15 15 9.75" },
      { label: "Face forward",  icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" },
    ],
    apiPath: "/api/diagnosis/skin",
    GuideOverlay: () => (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 400" preserveAspectRatio="none">
        <ellipse cx="150" cy="185" rx="95" ry="125" stroke="#D4AF37" strokeWidth="2" strokeDasharray="8 6" fill="none" opacity="0.8" />
      </svg>
    ),
  },
} as const;

type DiagType = keyof typeof CONFIG;

function isDiagType(value: string): value is DiagType {
  return value in CONFIG;
}

/* ─── Camera error helper ─────────────────────────────────── */
function getCameraErrorMsg(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Camera permission denied. Click the 🔒 lock icon in your address bar, allow camera, then retry.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No camera found. You can still upload a photo from your device.";
      case "NotReadableError":
      case "TrackStartError":
        return "Camera is in use by another app. Close it and try again.";
      case "SecurityError":
        return "Camera blocked by browser security. Make sure you're on localhost or HTTPS.";
      default:
        return `Camera error: ${err.message || err.name}`;
    }
  }
  return "Could not access camera. Try uploading a photo instead.";
}

/* ─── Component ───────────────────────────────────────────── */
export default function DiagnosisCapturePage() {
  const params    = useParams();
  const router    = useRouter();
  const { toast } = useToast();

  const rawType  = params.type as string;
  const diagType: DiagType = isDiagType(rawType) ? rawType : "tongue";
  const config   = CONFIG[diagType];

  /* refs */
  const videoRef    = React.useRef<HTMLVideoElement>(null);
  const canvasRef   = React.useRef<HTMLCanvasElement>(null);
  const streamRef   = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* state */
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [capturedFile,  setCapturedFile]  = React.useState<File | null>(null);
  const [cameraActive,  setCameraActive]  = React.useState(false);
  const [cameraError,   setCameraError]   = React.useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = React.useState(false);
  const [isAnalyzing,   setIsAnalyzing]   = React.useState(false);

  /* ── stop camera on unmount ── */
  React.useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  /* ── start live camera ── */
  async function startCamera() {
    setCameraError(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        window.location.protocol === "http:" && window.location.hostname !== "localhost"
          ? "Camera requires HTTPS. Please access the app over a secure connection."
          : "Your browser does not support camera access.",
      );
      setCameraLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      // retry without constraints on OverconstrainedError
      if (err instanceof DOMException && (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError")) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setCameraActive(true);
          setCameraLoading(false);
          return;
        } catch (err2) {
          setCameraError(getCameraErrorMsg(err2));
          setCameraLoading(false);
          return;
        }
      }
      setCameraError(getCameraErrorMsg(err));
    } finally {
      setCameraLoading(false);
    }
  }

  /* ── capture snapshot from video ── */
  function takePhoto() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth  || 640;
    const vh = video.videoHeight || 480;

    // The skin frame is portrait (3:4) and the video is cropped by object-cover,
    // so crop the saved photo the same way to match what the person saw.
    let sx = 0, sy = 0, sw = vw, sh = vh;
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

    canvas.width  = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // mirror horizontally (front camera)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${diagType}_capture.jpg`, { type: "image/jpeg" });
      setCapturedFile(file);
      setCapturedImage(canvas.toDataURL("image/jpeg", 0.92));
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  /* ── retake ── */
  function retake() {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  }

  /* ── file upload fallback ── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setCapturedFile(file);
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── send to API ── */
  const handleAnalyze = async () => {
    if (!capturedFile) return;
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", capturedFile);

      const res = await fetch(config.apiPath, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ type: "error", title: "Analysis failed", description: err.message ?? "Please try again." });
        setIsAnalyzing(false);
        return;
      }

      const data = await res.json();
      sessionStorage.setItem(`diagnosis_${diagType}_${data.id}`, JSON.stringify(data));
      router.push(`/diagnosis/analyzing/${diagType}?id=${data.id}`);
    } catch {
      toast({ type: "error", title: "Something went wrong", description: "Please try again." });
      setIsAnalyzing(false);
    }
  };

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Back */}
        <button type="button" onClick={() => { stopCamera(); router.push("/diagnosis"); }}
          className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body w-fit">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          All Diagnoses
        </button>

        {/* Header */}
        <div className="text-center">
          <p className="text-label text-text-muted uppercase tracking-wider mb-1">{config.sanskrit}</p>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-2">Capture {config.title}</h1>
          <p className="text-body text-text-muted max-w-sm mx-auto">{config.instruction}</p>
        </div>

        {/* ── Viewfinder ── */}
        <div className={`relative ${config.frame} mx-auto w-full rounded-2xl overflow-hidden bg-black border-2 border-dashed border-border-strong`}>

          {/* Live video */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)", display: cameraActive && !capturedImage ? "block" : "none" }}
            muted
            playsInline
            aria-label="Camera preview"
          />

          {/* Hidden canvas for snapshot */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Captured still */}
          {capturedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}

          {/* Guide overlay — shown on live camera */}
          {cameraActive && !capturedImage && <config.GuideOverlay />}

          {/* Idle state — no camera, no image */}
          {!cameraActive && !capturedImage && !cameraLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-subtle">
              <svg className="w-12 h-12 text-text-muted opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-body-sm text-text-muted text-center px-6">
                Click <strong>Open Camera</strong> or upload a photo
              </p>
            </div>
          )}

          {/* Loading spinner while camera starts */}
          {cameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <svg className="animate-spin w-8 h-8 text-brand-gold" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {/* Retake button on captured image */}
          {capturedImage && (
            <button type="button" onClick={retake}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold hover:bg-black/80 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
              </svg>
              Retake
            </button>
          )}

          {/* Camera error banner */}
          {cameraError && !capturedImage && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-red-900/80 text-white text-xs text-center leading-snug">
              {cameraError}
            </div>
          )}
        </div>

        {/* Guide label */}
        {cameraActive && !capturedImage && (
          <p className="text-label text-text-muted text-center -mt-3">{config.guideLabel}</p>
        )}

        {/* Tips */}
        <div className="grid grid-cols-3 gap-3">
          {config.tips.map((tip) => (
            <div key={tip.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-bg-subtle">
              <svg className="w-5 h-5 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tip.icon} />
              </svg>
              <span className="text-label text-text-muted text-center">{tip.label}</span>
            </div>
          ))}
        </div>

        {/* ── Action buttons ── */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {!capturedImage ? (
          /* Before capture */
          <div className="flex flex-col sm:flex-row gap-3">
            {!cameraActive ? (
              <Button variant="primary" className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
                isLoading={cameraLoading} onClick={startCamera}>
                Open Camera
              </Button>
            ) : (
              <Button variant="primary" className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
                onClick={takePhoto}>
                📸 Take Photo
              </Button>
            )}
            <Button variant="secondary" className="flex-1" onClick={() => { stopCamera(); fileInputRef.current?.click(); }}>
              Upload from gallery
            </Button>
          </div>
        ) : (
          /* After capture */
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
              isLoading={isAnalyzing} onClick={handleAnalyze}>
              Analyze with AI
            </Button>
            <Button variant="secondary" className="flex-1" onClick={retake} disabled={isAnalyzing}>
              Retake Photo
            </Button>
          </div>
        )}

        <p className="text-micro text-text-disabled text-center">
          🔒 Your photo is only used for this one-time analysis and is never stored permanently.
        </p>

      </motion.div>
    </PageContainer>
  );
}