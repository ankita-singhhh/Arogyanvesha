"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { pageEnter } from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const shouldReduce = useReducedMotion();

  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast({
        type: "error",
        title: "Invalid reset link",
        description: "Please request a new password reset.",
      });
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });

      toast({
        type: "success",
        title: "Password reset!",
        description: "You can now sign in with your new password.",
      });

      router.push("/login");
    } catch {
      toast({
        type: "error",
        title: "Reset failed",
        description: "This link may have expired. Please request a new one.",
      });
    }
  };

  // Invalid token — show error state
  if (!token) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-status-error-bg border border-status-error/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-status-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-h2 font-bold text-text-heading mb-3">
            Invalid reset link
          </h1>
          <p className="text-body text-text-muted mb-8">
            This link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button variant="primary" className="w-full">
              Request new link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        variants={shouldReduce ? {} : pageEnter}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-text-heading mb-2">
            Reset your password
          </h1>
          <p className="text-body text-text-muted">
            Choose a strong new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
            required
            {...register("password")}
          />

          <Input
            label="Confirm new password"
            type="password"
            placeholder="Repeat your new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            required
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Reset password
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-brand-burgundy font-semibold hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
        <p className="text-text-muted">Loading reset page...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}