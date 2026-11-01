"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { accordionContent, noAnimation } from "@/lib/animations";

/* ─────────────────────────────────────────────────────────
   CHEVRON ICON
───────────────────────────────────────────────────────── */

function ChevronIcon({ className }: { className?: string }) {
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
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */

export interface AccordionItem {
  id: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  /** Disabled items cannot be opened */
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** "single" — only one item open at a time. "multiple" — any number open */
  type?: "single" | "multiple";
  /** IDs of items open by default */
  defaultOpen?: string[];
  /** Controlled open state */
  openItems?: string[];
  /** Called when open state changes */
  onOpenChange?: (openIds: string[]) => void;
  /** Visual style variant */
  variant?: "default" | "bordered" | "flush";
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function Accordion({
  items,
  type = "single",
  defaultOpen = [],
  openItems,
  onOpenChange,
  variant = "default",
  className,
}: AccordionProps) {
  const shouldReduce = useReducedMotion();
  const isControlled = openItems !== undefined;

  const [internalOpen, setInternalOpen] = React.useState<string[]>(defaultOpen);
  const open = isControlled ? openItems : internalOpen;

  const toggle = React.useCallback(
    (id: string) => {
      const isOpen = open.includes(id);
      let next: string[];

      if (type === "single") {
        next = isOpen ? [] : [id];
      } else {
        next = isOpen ? open.filter((i) => i !== id) : [...open, id];
      }

      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [open, type, isControlled, onOpenChange],
  );

  return (
    <div
      className={cn(
        "w-full",
        variant === "default" && [
          "rounded-lg border border-border-default",
          "bg-surface-card shadow-xs",
          "divide-y divide-border-default",
        ],
        variant === "bordered" && [
          "flex flex-col gap-2",
        ],
        variant === "flush" && [
          "divide-y divide-border-default",
        ],
        className,
      )}
    >
      {items.map((item, index) => {
        const isOpen = open.includes(item.id);
        const triggerId = `accordion-trigger-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={cn(
              variant === "bordered" && [
                "rounded-lg border border-border-default bg-surface-card",
                isOpen && "border-brand-burgundy/30 shadow-xs",
              ],
              variant === "default" && [
                isFirst && "rounded-t-lg",
                isLast && "rounded-b-lg",
              ],
            )}
          >
            {/* Trigger button */}
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id)}
              className={cn(
                "w-full flex items-center justify-between gap-4",
                "text-left",
                "px-5 py-4",
                "font-body font-medium text-body text-text-heading",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-border-gold focus-visible:ring-inset",
                isOpen && "text-brand-burgundy",
                "hover:text-brand-burgundy",
                "disabled:opacity-45 disabled:cursor-not-allowed",
                variant === "bordered" && "rounded-lg",
                variant === "bordered" && isOpen && "rounded-b-none",
              )}
            >
              <span className="flex-1">{item.trigger}</span>

              <ChevronIcon
                className={cn(
                  "w-5 h-5 shrink-0 text-text-muted",
                  "transition-transform duration-250",
                  isOpen && "rotate-180 text-brand-burgundy",
                )}
              />
            </button>

            {/* Animated content panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  variants={shouldReduce ? noAnimation : accordionContent}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className={cn(
                      "px-5 pb-4 pt-0",
                      "text-body text-text-body leading-relaxed",
                    )}
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

Accordion.displayName = "Accordion";