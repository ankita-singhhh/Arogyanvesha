"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  error?: string;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
  className?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  label,
  error,
  orientation = "vertical",
  size = "md",
  className,
}: RadioGroupProps) {
  const groupId = React.useId();
  const errorId = `${groupId}-error`;

  const sizeMap = {
    sm: { radio: "w-4 h-4", label: "text-body-sm", desc: "text-label" },
    md: { radio: "w-5 h-5", label: "text-body",    desc: "text-body-sm" },
  };
  const s = sizeMap[size];

  return (
    <fieldset className={cn("border-none p-0 m-0", className)} aria-describedby={error ? errorId : undefined}>
      {label && (
        <legend className="text-body-sm font-medium text-text-heading mb-2">
          {label}
        </legend>
      )}

      <div className={cn(
        "flex gap-3",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
      )}>
        {options.map((opt) => {
          const optId = `${groupId}-${opt.value}`;
          const isSelected = value === opt.value;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                "flex items-start gap-3 cursor-pointer",
                opt.disabled && "cursor-not-allowed opacity-45",
              )}
            >
              <div className="relative shrink-0 mt-0.5">
                <input
                  id={optId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  disabled={opt.disabled}
                  onChange={() => onChange?.(opt.value)}
                  className={cn(
                    "peer appearance-none rounded-full",
                    s.radio,
                    "border-[1.5px] border-border-default bg-surface-card",
                    "transition-all duration-150 cursor-pointer",
                    "checked:border-brand-burgundy",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-border-gold focus-visible:ring-offset-1",
                    error && "border-status-error",
                    "disabled:cursor-not-allowed",
                  )}
                />
                {/* Inner dot */}
                <span
                  className={cn(
                    "absolute inset-0 m-auto rounded-full bg-brand-burgundy",
                    "opacity-0 peer-checked:opacity-100",
                    "transition-opacity duration-150",
                    size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5",
                  )}
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <span className={cn(s.label, "font-medium text-text-heading")}>{opt.label}</span>
                {opt.description && (
                  <span className={cn(s.desc, "text-text-muted")}>{opt.description}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-body-sm text-status-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

RadioGroup.displayName = "RadioGroup";