"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/lib/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function SkinCapturePage() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setError(null);
    if (!ALLOWED_TYPES.includes(nextFile.type)) { setError("Choose a JPG, PNG, or WEBP image."); return; }
    if (nextFile.size > MAX_IMAGE_BYTES) { setError("Choose an image smaller than 5 MB."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  async function analyze() {
    if (!file || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ id?: string }>("/skin/analyze", formData, { headers: { "Content-Type": undefined } });
      if (!data?.id) throw new Error("The analysis service returned an invalid result.");
      router.replace(`/skin/result/${data.id}`);
    } catch (cause: unknown) {
      const response = cause as { response?: { data?: { message?: string } }; message?: string };
      setError(response.response?.data?.message ?? response.message ?? "Unable to analyze this image. Please try again.");
    } finally { setSubmitting(false); }
  }

  return <PageContainer className="py-8 max-w-2xl mx-auto"><div className="space-y-6">
    <header className="text-center"><h1 className="text-h1 font-display font-bold text-text-heading">Capture Your Photo</h1><p className="mt-2 text-body text-text-muted">Use a clear, makeup-free photo in natural light. This is a wellness observation, not a medical diagnosis.</p></header>
    <div className="relative aspect-square max-w-md mx-auto w-full overflow-hidden rounded-2xl border-2 border-dashed border-border-strong bg-bg-subtle">
      {preview ? <img src={preview} alt="Selected skin-analysis image" className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><svg viewBox="0 0 200 200" className="h-3/4 w-3/4 opacity-40"><ellipse cx="100" cy="100" rx="65" ry="85" stroke="var(--color-brand-gold)" strokeWidth="2" strokeDasharray="6 6" fill="none" /></svg><p className="text-body-sm text-text-muted">Position your face within the oval</p></div>}
    </div>
    {error && <p role="alert" className="rounded-xl border border-status-error/20 bg-status-error-bg p-3 text-body-sm text-status-error">{error}</p>}
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={selectFile} className="hidden" />
    <div className="flex flex-col gap-3 sm:flex-row"><Button variant="secondary" className="flex-1" disabled={submitting} onClick={() => inputRef.current?.click()}>{file ? "Choose another photo" : "Upload from gallery"}</Button><Button variant="primary" className="flex-1 bg-gradient-burgundy border-0 shadow-burgundy" disabled={!file} isLoading={submitting} onClick={analyze}>Analyze photo</Button></div>
    <p className="text-center text-micro text-text-disabled">Your image is stored only with this analysis and can be deleted with the analysis record.</p>
  </div></PageContainer>;
}
