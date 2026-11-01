"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { pageEnter, fadeIn } from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const shouldReduce = useReducedMotion();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      toast({
        type: "error",
        title: "Request failed",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        variants={shouldReduce ? {} : pageEnter}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              variants={shouldReduce ? {} : fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Back link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body mb-8 transition-colors duration-150"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                </svg>
                Back to login
              </Link>

              <div className="mb-8">
                <h1 className="text-h1 font-bold text-text-heading mb-2">
                  Forgot password?
                </h1>
                <p className="text-body text-text-muted">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  required
                  {...register("email")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                >
                  Send reset link
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="text-center"
              variants={shouldReduce ? {} : fadeIn}
              initial="hidden"
              animate="visible"
            >
              {/* Success icon */}
              <div className="w-16 h-16 rounded-full bg-status-success-bg border border-status-success/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-status-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="text-h2 font-bold text-text-heading mb-3">
                Check your inbox
              </h2>
              <p className="text-body text-text-muted mb-2">
                We sent a password reset link to
              </p>
              <p className="text-body font-semibold text-text-heading mb-8">
                {submittedEmail}
              </p>

              <p className="text-body-sm text-text-muted mb-6">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-brand-burgundy font-semibold hover:underline underline-offset-4"
                >
                  try again
                </button>
              </p>

              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Back to login
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}