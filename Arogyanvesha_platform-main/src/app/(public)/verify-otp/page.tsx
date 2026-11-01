"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { pageEnter } from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const shouldReduce = useReducedMotion();

  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOTPComplete = async (value: string) => {
    setIsVerifying(true);
    setOtpError(false);
    setOtpErrorMessage("");

    try {
      await api.post("/auth/verify-otp", { email, otp: value });
      toast({
        type: "success",
        title: "Email verified!",
        description: "Welcome to Arogyanvesha.",
      });
      router.push("/dashboard");
    } catch {
      setOtpError(true);
      setOtpErrorMessage("Invalid or expired code. Please try again.");
      toast({ type: "error", title: "Verification failed" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      toast({
        type: "success",
        title: "Code resent",
        description: "Check your inbox for the new code.",
      });
      setResendCooldown(60);
    } catch {
      toast({ type: "error", title: "Failed to resend code" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md text-center"
        variants={shouldReduce ? {} : pageEnter}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-brand-gold-pale border border-brand-gold/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="text-h1 font-bold text-text-heading mb-2">
          Check your email
        </h1>
        <p className="text-body text-text-muted mb-2">
          We sent a 6-digit verification code to
        </p>
        <p className="text-body font-semibold text-text-heading mb-8">
          {email || "your email address"}
        </p>

        {/* OTP Input */}
        <div className="mb-8">
          <OTPInput
            length={6}
            onChange={setOtp}
            onComplete={handleOTPComplete}
            error={otpError}
            errorMessage={otpErrorMessage}
            disabled={isVerifying}
          />
        </div>

        {/* Verify button */}
        <Button
          variant="primary"
          className="w-full mb-4"
          isLoading={isVerifying}
          disabled={otp.length < 6}
          onClick={() => handleOTPComplete(otp)}
        >
          Verify email
        </Button>

        {/* Resend */}
        <div className="flex items-center justify-center gap-1 text-body-sm text-text-muted">
          <span>Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="text-brand-burgundy font-semibold hover:underline underline-offset-4 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
        <p className="text-text-muted">Loading verification...</p>
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  );
}