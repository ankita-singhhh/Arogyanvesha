"use client";

import { FaceAuth } from "@/components/face/FaceAuth";

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">
        Security Settings
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        Register a passkey to sign in securely without entering your password.
      </p>

      <FaceAuth mode="enroll" />
    </main>
  );
}