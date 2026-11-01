
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { pageEnter } from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const shouldReduce = useReducedMotion();

  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("PLEASE_LOGIN_WITH_GOOGLE")) {
          toast({
            type: "error",
            title: "Google Login Required",
            description:
              "This email is registered via Google. Please click 'Continue with Google'.",
          });
          return;
        }

        if (result.error.includes("FIREBASE_NOT_CONFIGURED")) {
          toast({
            type: "warning",
            title: "Firebase Not Configured",
            description:
              "Firebase is not configured in .env.local. Registering/logging in with Firebase is unavailable.",
          });
          return;
        }

        toast({
          type: "error",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        });
        return;
      }

      toast({ type: "success", title: "Welcome back!" });
      router.push("/dashboard");
    } catch {
      toast({
        type: "error",
        title: "Something went wrong",
        description: "Please try again later.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast({ type: "error", title: "Google login failed" });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Left decorative panel */}
      <div
        className={cn(
          "hidden lg:flex lg:w-1/2",
          "bg-brand-burgundy-deep flex-col items-center justify-center",
          "relative overflow-hidden p-12"
        )}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-brand-gold" />
          <div className="absolute top-40 left-40 w-48 h-48 rounded-full border border-brand-gold" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full border border-brand-gold" />
        </div>

        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo/logo.jpeg"
              alt="Arogyanvesha Logo"
              width={120}
              height={120}
              style={{ width: "120px", height: "120px" }}
              className="rounded-2xl object-contain"
              priority
            />
          </div>

          <h1 className="text-display font-bold text-text-inverted font-display mb-4">
            Arogyanvesha
          </h1>

          <p className="text-body-lg text-brand-gold-light max-w-sm leading-relaxed">
            Your personal Ayurvedic companion for holistic wellness and balanced
            living.
          </p>

          <div className="mt-12 flex flex-col gap-4 text-left">
            {[
              "Discover your unique Prakriti",
              "Get AI-powered Ayurvedic guidance",
              "Track your wellness journey",
              "Learn ancient healing wisdom",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3 h-3 text-brand-gold"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-body text-brand-gold-light">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          variants={shouldReduce ? {} : pageEnter}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-8">
            <h2 className="text-h1 font-bold text-text-heading mb-2">
              Welcome back
            </h2>
            <p className="text-body text-text-muted">
              Sign in to continue your wellness journey
            </p>
          </div>

          <Button
            variant="secondary"
            className="w-full mb-6"
            leftIcon={<GoogleIcon />}
            isLoading={isGoogleLoading}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-bg-base text-body-sm text-text-muted">
                or sign in with email
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              required
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              required
              {...register("password")}
            />

            <div className="flex justify-end -mt-2">
              <Link
                href="/forgot-password"
                className="text-body-sm text-brand-burgundy hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-body-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-burgundy font-semibold hover:underline underline-offset-4"
            >
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
