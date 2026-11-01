"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */

export interface OTPInputProps {
  /** Number of OTP digits — defaults to 6 per blueprint */
  length?: number;
  /** Called with the full OTP string each time a digit changes */
  onChange?: (value: string) => void;
  /** Called when all cells are filled — auto-submits after 200ms */
  onComplete?: (value: string) => void;
  /** Triggers red border + shake on all cells */
  error?: boolean;
  /** Error message shown below cells */
  errorMessage?: string;
  /** Disables all cells */
  disabled?: boolean;
  /** Accessible label for the group */
  label?: string;
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function OTPInput({
  length = 6,
  onChange,
  onComplete,
  error = false,
  errorMessage,
  disabled = false,
  label = "One-time password",
  className,
}: OTPInputProps) {
  const [values, setValues] = React.useState<string[]>(Array(length).fill(""));
  const [isShaking, setIsShaking] = React.useState(false);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>(
    Array(length).fill(null),
  );
  const completeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger shake when error prop changes to true
  React.useEffect(() => {
    if (error) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 200);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  const focusCell = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Only accept a single digit
    const digit = raw.replace(/\D/g, "").slice(-1);

    const next = [...values];
    next[index] = digit;
    setValues(next);

    const fullValue = next.join("");
    onChange?.(fullValue);

    // Advance focus to next cell on digit entry
    if (digit && index < length - 1) {
      focusCell(index + 1);
    }

    // Auto-submit 200ms after last digit is filled
    if (fullValue.length === length && !fullValue.includes("")) {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(() => {
        onComplete?.(fullValue);
      }, 200);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...values];

      if (next[index]) {
        // Clear current cell
        next[index] = "";
        setValues(next);
        onChange?.(next.join(""));
      } else if (index > 0) {
        // Move to previous cell and clear it
        next[index - 1] = "";
        setValues(next);
        onChange?.(next.join(""));
        focusCell(index - 1);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusCell(index - 1);
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const next = Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });

    setValues(next);
    const fullValue = next.join("");
    onChange?.(fullValue);

    // Focus last filled cell or last cell
    const lastFilledIndex = Math.min(pasted.length, length - 1);
    focusCell(lastFilledIndex);

    // Auto-submit if paste fills all cells
    if (pasted.length === length) {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(() => {
        onComplete?.(fullValue);
      }, 200);
    }
  };

  // Prevent non-numeric input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Accessible group label */}
      {label && (
        <span className="sr-only" id="otp-label">
          {label}
        </span>
      )}

      {/* OTP cells */}
      <div
        role="group"
        aria-labelledby="otp-label"
        className="flex items-center gap-3"
      >
        {values.map((val, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={val}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            // Select all text on focus for easy replacement
            onFocus={(e) => e.target.select()}
            className={cn(
              // Base — 48×56px per blueprint
              "w-12 h-14 text-center",
              "text-h3 font-semibold text-text-heading font-body",
              "bg-surface-card rounded-lg",
              "border-[1.5px] border-border-default",
              "outline-none",
              "transition-all duration-150",
              "caret-brand-burgundy",
              // Focus
              "focus:border-[2px] focus:border-brand-burgundy",
              "focus:ring-4 focus:ring-brand-burgundy/10",
              // Filled state
              val && "border-brand-burgundy bg-brand-gold-pale",
              // Error state — all cells get red border
              error && [
                "border-[2px] border-status-error",
                "ring-4 ring-status-error/10 bg-status-error-bg",
                "focus:border-status-error",
              ],
              // Shake — applied to all cells simultaneously
              isShaking && "shake",
              // Disabled
              "disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-bg-subtle",
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {errorMessage && error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-body-sm text-status-error"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

OTPInput.displayName = "OTPInput";