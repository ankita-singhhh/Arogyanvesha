"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   ICONS
   Inline SVGs — no icon library dependency for primitives
───────────────────────────────────────────────────────── */

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
        clipRule="evenodd"
      />
      <path d="M10.748 13.93l2.523 2.524a10.065 10.065 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Always rendered above the field — floating labels are forbidden per blueprint */
  label?: string;
  /** Shown below field in error state — triggers red border + shake */
  error?: string;
  /** Shown below field in normal state */
  helperText?: string;
  /** Icon or element rendered inside left edge of input */
  leftAddon?: React.ReactNode;
  /** Icon or element rendered inside right edge of input */
  rightAddon?: React.ReactNode;
  /** 48px default, 40px compact */
  inputSize?: "default" | "compact";
  /** Required field indicator shown next to label */
  required?: boolean;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      inputSize = "default",
      type = "text",
      required,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const inputId = id ?? React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    // Trigger shake animation when error appears
    React.useEffect(() => {
      if (error) {
        setHasError(true);
        const timer = setTimeout(() => setHasError(false), 200);
        return () => clearTimeout(timer);
      }
    }, [error]);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label — always above, never floating */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm font-medium text-text-heading"
          >
            {label}
            {required && (
              <span className="text-status-error ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left addon */}
          {leftAddon && (
            <span className="absolute left-3 flex items-center text-text-muted pointer-events-none">
              {leftAddon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base
              "w-full rounded-lg bg-surface-card text-text-body font-body",
              "border-[1.5px] border-border-default",
              "placeholder:text-text-disabled",
              "outline-none",
              "transition-all duration-150",
              // Size
              inputSize === "default" ? "h-12 text-body" : "h-10 text-body-sm",
              // Padding — account for addons
              leftAddon ? "pl-10" : "pl-3",
              rightAddon || isPassword ? "pr-10" : "pr-3",
              // Focus state
              "focus:border-[2px] focus:border-brand-burgundy",
              "focus:ring-4 focus:ring-brand-burgundy/10",
              // Error state
              error && [
                "border-[2px] border-status-error",
                "ring-4 ring-status-error/10",
                "focus:border-status-error focus:ring-status-error/10",
              ],
              // Shake animation on error
              hasError && "shake",
              // Disabled
              "disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-bg-subtle",
              className,
            )}
            {...props}
          />

          {/* Right addon — password toggle takes priority */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={cn(
                  "absolute right-3 flex items-center text-brand-burgundy",
  "hover:text-brand-burgundy-deep transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-brand-burgundy focus-visible:ring-offset-1 rounded",
              )}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          ) : (
            rightAddon && (
              <span className="absolute right-3 flex items-center text-text-muted pointer-events-none">
                {rightAddon}
              </span>
            )
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-body-sm text-status-error"
          >
            <WarningIcon className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        {/* Helper text — only shown when no error */}
        {helperText && !error && (
          <p id={helperId} className="text-body-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };