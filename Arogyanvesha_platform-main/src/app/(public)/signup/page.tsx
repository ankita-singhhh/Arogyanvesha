"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { pageEnter, staggerContainer, cardEnter } from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Image from "next/image";
/* ─────────────────────────────────────────────────────────
   SCHEMA
───────────────────────────────────────────────────────── */

const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be less than 60 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

/* ─────────────────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────────────────── */

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-status-error" };
  if (score <= 3) return { score, label: "Fair", color: "bg-status-warning" };
  if (score <= 4) return { score, label: "Good", color: "bg-brand-gold" };
  return { score, label: "Strong", color: "bg-status-success" };
}

/* ─────────────────────────────────────────────────────────
   GOOGLE ICON
───────────────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function SignupPage() {
  const { toast } = useToast();
  const shouldReduce = useReducedMotion();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptTerms: false },
  });

  const watchedPassword = watch("password", "");

  React.useEffect(() => {
    setPasswordValue(watchedPassword);
  }, [watchedPassword]);

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: SignupFormData) => {
    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast({
        type: "success",
        title: "Account created!",
        description: "Welcome to Arogyanvesha! Logging you in...",
      });

      // Automatically sign in the user
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/dashboard",
      });
    } catch {
      toast({
        type: "error",
        title: "Registration failed",
        description: "This email may already be registered.",
      });
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast({ type: "error", title: "Google signup failed" });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 lg:p-12">
      <motion.div
        className="w-full max-w-md"
        variants={shouldReduce ? {} : pageEnter}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
 <Image
  src="/images/logo/logo.jpeg"
  alt="Arogyanvesha Logo"
  width={56}
  height={56}
  className="h-16 w-16 rounded-full object-cover"
  priority
/>
</div>
          <h1 className="text-h1 font-bold text-text-heading mb-2">
            Begin your journey
          </h1>
          <p className="text-body text-text-muted">
            Create your free Arogyanvesha account
          </p>
        </div>

        {/* Google signup */}
        <Button
          variant="secondary"
          className="w-full mb-6"
          leftIcon={<GoogleIcon />}
          isLoading={isGoogleLoading}
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-bg-base text-body-sm text-text-muted">
              or create with email
            </span>
          </div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
          variants={shouldReduce ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <Input
              label="Full name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              error={errors.name?.message}
              required
              {...register("name")}
            />
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              required
              {...register("email")}
            />
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              required
              {...register("password")}
            />

            {/* Password strength bar */}
            {passwordValue && (
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        i <= strength.score ? strength.color : "bg-border-default",
                      )}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-label text-text-muted">
                    Password strength:{" "}
                    <span className="font-semibold text-text-body">
                      {strength.label}
                    </span>
                  </p>
                )}
              </div>
            )}
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              required
              {...register("confirmPassword")}
            />
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <Checkbox
              label={
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-brand-burgundy hover:underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-brand-burgundy hover:underline underline-offset-4">
                    Privacy Policy
                  </Link>
                </span>
              }
              error={errors.acceptTerms?.message}
              {...register("acceptTerms")}
            />
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Create account
            </Button>
          </motion.div>
        </motion.form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-body-sm text-text-muted">
          Already have an account?{" "}
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