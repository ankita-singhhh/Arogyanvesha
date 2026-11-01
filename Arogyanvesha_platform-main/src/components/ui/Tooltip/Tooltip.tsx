"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tooltipEnter, noAnimation } from "@/lib/animations";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  placement?: TooltipPlacement;
  delay?: number;
  maxWidth?: number;
  disabled?: boolean;
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   PLACEMENT STYLES
───────────────────────────────────────────────────────── */

const placementStyles: Record<TooltipPlacement, string> = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles: Record<TooltipPlacement, string> = {
  top:    "top-full left-1/2 -translate-x-1/2 border-t-text-primary/90 border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-text-primary/90 border-x-transparent border-t-transparent",
  left:   "left-full top-1/2 -translate-y-1/2 border-l-text-primary/90 border-y-transparent border-r-transparent",
  right:  "right-full top-1/2 -translate-y-1/2 border-r-text-primary/90 border-y-transparent border-l-transparent",
};

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 400,
  maxWidth = 240,
  disabled = false,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const shouldReduce = useReducedMotion();
  const showTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();

  const show = React.useCallback(() => {
    if (disabled) return;
    showTimerRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [disabled, delay]);

  const hide = React.useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, []);

  const childProps = children.props;

  const trigger = React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide();
      childProps.onBlur?.(e);
    },
    "aria-describedby": isVisible ? tooltipId : undefined,
  });

  return (
    <span className="relative inline-flex">
      {trigger}

      <AnimatePresence>
        {isVisible && (
          <motion.span
            id={tooltipId}
            role="tooltip"
            className={cn(
              "absolute z-50 pointer-events-none",
              placementStyles[placement],
            )}
            variants={shouldReduce ? noAnimation : tooltipEnter}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Arrow */}
            <span
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowStyles[placement],
              )}
              aria-hidden="true"
            />

            {/* Content panel */}
            <span
              className={cn(
                "block px-2.5 py-1.5 rounded-md",
                "bg-text-primary/90 text-text-inverted",
                "text-body-sm font-medium",
                "shadow-md",
                "whitespace-normal wrap-break-word",
                className,
              )}
              style={{ maxWidth }}
            >
              {content}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

Tooltip.displayName = "Tooltip";