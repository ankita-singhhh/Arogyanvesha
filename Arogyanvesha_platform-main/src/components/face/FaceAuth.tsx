"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

type FaceAuthProps = {
  mode: "login" | "enroll";
  className?: string;
  onEnrollSuccess?: () => void;
  onError?: (msg: string) => void;
};

export function FaceAuth({
  mode,
  className = "",
  onEnrollSuccess,
  onError,
}: FaceAuthProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePasskey() {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "enroll") {
        const optionsResponse = await fetch(
          "/api/auth/passkey/register-options",
          { method: "POST" },
        );

        const optionsData = await optionsResponse.json();

        if (!optionsResponse.ok) {
          throw new Error(
            optionsData.error ?? "Could not start passkey registration.",
          );
        }

        const registration = await startRegistration({
          optionsJSON: optionsData.options,
        });

        const verifyResponse = await fetch(
          "/api/auth/passkey/register-verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              response: registration,
              challenge: optionsData.challenge,
              deviceName: navigator.userAgent.slice(0, 100),
            }),
          },
        );

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          throw new Error(
            verifyData.error ?? "Passkey registration failed.",
          );
        }

        setMessage("Passkey added successfully.");
        onEnrollSuccess?.();
        return;
      }

      const optionsResponse = await fetch(
        "/api/auth/passkey/auth-options",
        { method: "POST" },
      );

      const optionsData = await optionsResponse.json();

      if (!optionsResponse.ok) {
        throw new Error(
          optionsData.error ?? "Could not start passkey login.",
        );
      }

      const assertion = await startAuthentication({
        optionsJSON: optionsData.options,
      });

      const result = await signIn("passkey", {
        assertion: JSON.stringify(assertion),
        challenge: optionsData.challenge,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error("Passkey login failed. Please try again.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";

      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handlePasskey}
        disabled={loading}
        className="w-full rounded-lg border px-4 py-3 font-medium disabled:opacity-60"
      >
        {loading
          ? "Please wait..."
          : mode === "enroll"
            ? "Add a passkey"
            : "Sign in with a passkey"}
      </button>

      {message && (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}