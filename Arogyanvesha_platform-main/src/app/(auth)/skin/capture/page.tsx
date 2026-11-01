"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";

export default function SkinCapturePage() {
  const router = useRouter();
  const [permissionDenied] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    router.push("/skin/analyzing");
  };

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div className="text-center">
          <h1 className="text-h1 font-display font-bold text-text-heading mb-2">Capture Your Photo</h1>
          <p className="text-body text-text-muted">For best results, take a photo in natural light without makeup</p>
        </div>

        {/* Viewfinder */}
        <div className="relative aspect-square max-w-md mx-auto w-full rounded-2xl overflow-hidden bg-bg-subtle border-2 border-dashed border-border-strong">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover"/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Oval face guide */}
              <svg viewBox="0 0 200 200" className="w-3/4 h-3/4 opacity-40">
                <ellipse cx="100" cy="100" rx="65" ry="85" stroke="var(--color-brand-gold)" strokeWidth="2" strokeDasharray="6 6" fill="none"/>
              </svg>
            </div>
          )}
          {!capturedImage && (
            <p className="absolute bottom-4 inset-x-0 text-center text-body-sm text-text-muted">
              Position your face within the oval
            </p>
          )}
        </div>

        {permissionDenied && (
          <div className="p-4 rounded-xl bg-status-warning-bg border border-status-warning/20 text-center">
            <p className="text-body-sm text-text-body">
              Camera access denied. You can upload a photo from your gallery instead.
            </p>
          </div>
        )}

        {/* Lighting tips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Natural light", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25" },
            { label: "No makeup",     icon: "M9 12.75L11.25 15 15 9.75" },
            { label: "Face forward",  icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
          ].map((tip) => (
            <div key={tip.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-bg-subtle">
              <svg className="w-5 h-5 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tip.icon}/>
              </svg>
              <span className="text-label text-text-muted text-center">{tip.label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleFileUpload} className="hidden"/>
          <Button variant="secondary" className="flex-1" onClick={() => fileInputRef.current?.click()}>
            Upload from gallery
          </Button>
          <Button variant="primary" className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy"
            disabled={!capturedImage} onClick={handleAnalyze}>
            Analyze photo
          </Button>
        </div>

        <p className="text-micro text-text-disabled text-center">
          🔒 Your photo is encrypted and only used for this analysis. You can delete it anytime.
        </p>
      </motion.div>
    </PageContainer>
  );
}