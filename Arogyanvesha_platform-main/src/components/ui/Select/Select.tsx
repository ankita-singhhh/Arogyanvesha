"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  inputSize?: "default" | "compact";
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, error, helperText, inputSize = "default", required, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-body-sm font-medium text-text-heading">
            {label}
            {required && <span className="text-status-error ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full appearance-none rounded-lg bg-surface-card text-text-body font-body",
              "border-[1.5px] border-border-default",
              "outline-none transition-all duration-150 cursor-pointer",
              "pr-10",
              inputSize === "default" ? "h-12 pl-3 text-body" : "h-10 pl-3 text-body-sm",
              "focus:border-[2px] focus:border-brand-burgundy focus:ring-4 focus:ring-brand-burgundy/10",
              error && "border-[2px] border-status-error ring-4 ring-status-error/10",
              "disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-bg-subtle",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-body-sm text-status-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-body-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";