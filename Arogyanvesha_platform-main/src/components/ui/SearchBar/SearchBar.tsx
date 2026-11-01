"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────── */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  /** Renders filter/sort button slot on right */
  rightSlot?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  /** Debounce delay in ms — calls onChange after user stops typing */
  debounceMs?: number;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search…",
  isLoading = false,
  size = "md",
  rightSlot,
  disabled = false,
  autoFocus = false,
  className,
  debounceMs,
}: SearchBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState("");
  const resolvedValue = isControlled ? value : internalValue;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const sizeMap = {
    sm: { wrapper: "h-9",  icon: "w-3.5 h-3.5", text: "text-body-sm", px: "pl-8 pr-8"  },
    md: { wrapper: "h-11", icon: "w-4 h-4",     text: "text-body",    px: "pl-10 pr-10" },
    lg: { wrapper: "h-13", icon: "w-5 h-5",     text: "text-body-lg", px: "pl-11 pr-11" },
  };

  const s = sizeMap[size];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) setInternalValue(val);

    if (debounceMs && onChange) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(val), debounceMs);
    } else {
      onChange?.(val);
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange?.("");
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(resolvedValue);
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={cn("relative flex items-center gap-2 w-full", className)}>
      {/* Search input wrapper */}
      <div className="relative flex-1">
        {/* Search icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {isLoading
            ? <LoadingSpinner className={cn(s.icon, "text-brand-burgundy")} />
            : <SearchIcon className={s.icon} />
          }
        </span>

        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          value={resolvedValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={placeholder}
          className={cn(
            "w-full rounded-lg bg-surface-card font-body text-text-body",
            "border-[1.5px] border-border-default",
            "placeholder:text-text-disabled",
            "outline-none transition-all duration-150",
            s.wrapper,
            s.text,
            s.px,
            "focus:border-[2px] focus:border-brand-burgundy",
            "focus:ring-4 focus:ring-brand-burgundy/10",
            "disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-bg-subtle",
            // Hide browser default clear button
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />

        {/* Clear button */}
        {resolvedValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "text-text-muted hover:text-text-body",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-border-gold rounded",
            )}
          >
            <ClearIcon className={s.icon} />
          </button>
        )}
      </div>

      {/* Right slot — filter button etc */}
      {rightSlot && (
        <div className="shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

SearchBar.displayName = "SearchBar";