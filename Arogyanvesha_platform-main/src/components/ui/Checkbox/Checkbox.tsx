"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
  size?: "sm" | "md";
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, size = "md", id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const errorId = `${inputId}-error`;

    const sizeMap = {
      sm: { box: "w-4 h-4", label: "text-body-sm", desc: "text-label" },
      md: { box: "w-5 h-5", label: "text-body",    desc: "text-body-sm" },
    };
    const s = sizeMap[size];

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className={cn("flex items-start gap-3 cursor-pointer group", props.disabled && "cursor-not-allowed opacity-45")}>
          <div className="relative shrink-0 mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className={cn(
                "peer appearance-none rounded",
                s.box,
                "border-[1.5px] border-border-default bg-surface-card",
                "transition-all duration-150 cursor-pointer",
                "checked:bg-brand-burgundy checked:border-brand-burgundy",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold focus-visible:ring-offset-1",
                error && "border-status-error",
                "disabled:cursor-not-allowed",
                className,
              )}
              {...props}
            />
            {/* Checkmark */}
            <svg
              className={cn(
                "absolute inset-0 m-auto pointer-events-none",
                "text-text-inverted opacity-0 peer-checked:opacity-100",
                "transition-opacity duration-150",
                size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
              )}
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && <span className={cn(s.label, "font-medium text-text-heading")}>{label}</span>}
              {description && <span className={cn(s.desc, "text-text-muted")}>{description}</span>}
            </div>
          )}
        </label>

        {error && (
          <p id={errorId} role="alert" className="text-body-sm text-status-error ml-8">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";