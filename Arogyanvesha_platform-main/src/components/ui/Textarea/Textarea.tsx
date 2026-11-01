"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   ICON
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

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Always rendered above — no floating labels */
  label?: string;
  /** Triggers red border + shake + error message below */
  error?: string;
  /** Shown below when no error */
  helperText?: string;
  /** Shows current/max character count below right */
  maxLength?: number;
  /** Auto-grows with content up to maxRows */
  autoResize?: boolean;
  /** Max rows before scroll kicks in — only used with autoResize */
  maxRows?: number;
  required?: boolean;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLength,
      autoResize = false,
      maxRows = 8,
      required,
      id,
      value,
      defaultValue,
      onChange,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(() => {
      if (value !== undefined) return String(value).length;
      if (defaultValue !== undefined) return String(defaultValue).length;
      return 0;
    });
    const [hasError, setHasError] = React.useState(false);

    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

    const inputId = id ?? React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Shake animation trigger
    React.useEffect(() => {
      if (error) {
        setHasError(true);
        const timer = setTimeout(() => setHasError(false), 200);
        return () => clearTimeout(timer);
      }
    }, [error]);

    // Auto-resize logic
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);

        if (autoResize && resolvedRef.current) {
          // Reset height to measure scrollHeight correctly
          resolvedRef.current.style.height = "auto";
          const lineHeight = parseInt(
            getComputedStyle(resolvedRef.current).lineHeight,
            10,
          );
          const maxHeight = lineHeight * maxRows;
          const newHeight = Math.min(resolvedRef.current.scrollHeight, maxHeight);
          resolvedRef.current.style.height = `${newHeight}px`;
          resolvedRef.current.style.overflowY =
            resolvedRef.current.scrollHeight > maxHeight ? "auto" : "hidden";
        }

        onChange?.(e);
      },
      [autoResize, maxRows, onChange, resolvedRef],
    );

    const isNearLimit = maxLength ? charCount >= maxLength * 0.85 : false;
    const isAtLimit = maxLength ? charCount >= maxLength : false;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
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

        {/* Textarea */}
        <textarea
          ref={resolvedRef}
          id={inputId}
          rows={rows}
          maxLength={maxLength}
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            // Base
            "w-full rounded-lg bg-surface-card text-text-body font-body text-body",
            "border-[1.5px] border-border-default",
            "placeholder:text-text-disabled",
            "outline-none",
            "transition-all duration-150",
            "px-3 py-3",
            "resize-y",
            // Focus
            "focus:border-[2px] focus:border-brand-burgundy",
            "focus:ring-4 focus:ring-brand-burgundy/10",
            // Error
            error && [
              "border-[2px] border-status-error",
              "ring-4 ring-status-error/10",
              "focus:border-status-error focus:ring-status-error/10",
            ],
            // Shake
            hasError && "shake",
            // Auto resize — hide manual resize handle
            autoResize && "resize-none overflow-hidden",
            // Disabled
            "disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-bg-subtle",
            className,
          )}
          {...props}
        />

        {/* Footer row — error/helper left, char count right */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
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
            {helperText && !error && (
              <p id={helperId} className="text-body-sm text-text-muted">
                {helperText}
              </p>
            )}
          </div>

          {/* Character count */}
          {maxLength && (
            <p
              className={cn(
                "text-label shrink-0 tabular-nums",
                isAtLimit
                  ? "text-status-error font-semibold"
                  : isNearLimit
                    ? "text-status-warning"
                    : "text-text-muted",
              )}
              aria-live="polite"
              aria-label={`${charCount} of ${maxLength} characters used`}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };