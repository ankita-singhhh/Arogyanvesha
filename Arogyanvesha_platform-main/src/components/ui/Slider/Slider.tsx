"use client";

import * as React from "react";
import { cn, clampNumber } from "@/lib/utils";

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Slider({
  value,
  defaultValue = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue,
  disabled = false,
  error,
  className,
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const resolvedValue = isControlled ? value : internalValue;
  const sliderId = React.useId();
  const errorId = `${sliderId}-error`;

  const clampedValue = clampNumber(resolvedValue, min, max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(clampedValue) : String(clampedValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={sliderId} className="text-body-sm font-medium text-text-heading">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-body-sm font-semibold text-brand-burgundy tabular-nums">
              {displayValue}
            </span>
          )}
        </div>
      )}

      {/* Slider track */}
      <div className="relative flex items-center h-5">
        {/* Track background */}
        <div className="absolute w-full h-1.5 rounded-full bg-border-default" />

        {/* Filled track */}
        <div
          className="absolute h-1.5 rounded-full bg-brand-burgundy transition-all duration-100"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />

        {/* Native range input — overlaid transparent for interaction */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          disabled={disabled}
          onChange={handleChange}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-valuetext={displayValue}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "absolute w-full h-full opacity-0 cursor-pointer",
            "disabled:cursor-not-allowed",
            "[&::-webkit-slider-thumb]:opacity-100",
          )}
        />

        {/* Custom thumb */}
        <div
          className={cn(
            "absolute w-5 h-5 rounded-full bg-surface-card",
            "border-2 border-brand-burgundy shadow-md",
            "transition-all duration-100 pointer-events-none",
            "ring-0 focus-within:ring-4 focus-within:ring-brand-burgundy/20",
            disabled && "opacity-45",
          )}
          style={{ left: `calc(${percentage}% - 10px)` }}
          aria-hidden="true"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between">
        <span className="text-label text-text-muted">{formatValue ? formatValue(min) : min}</span>
        <span className="text-label text-text-muted">{formatValue ? formatValue(max) : max}</span>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-body-sm text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}

Slider.displayName = "Slider";