"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  modalOpen,
  bottomSheetOpen,
  overlayBackdrop,
  noAnimation,
} from "@/lib/animations";

/* ─────────────────────────────────────────────────────────
   CLOSE ICON
───────────────────────────────────────────────────────── */

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   FOCUS TRAP HOOK
   Traps keyboard focus inside the modal while open.
───────────────────────────────────────────────────────── */

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, isOpen: boolean) {
  React.useEffect(() => {
    if (!isOpen || !ref.current) return;

    const element = ref.current;
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const focusableElements = Array.from(
      element.querySelectorAll<HTMLElement>(focusableSelectors),
    );

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    // Focus first element on open
    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, ref]);
}

/* ─────────────────────────────────────────────────────────
   SCROLL LOCK HOOK
───────────────────────────────────────────────────────── */

function useScrollLock(isOpen: boolean) {
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
}

/* ─────────────────────────────────────────────────────────
   SHARED PROPS
───────────────────────────────────────────────────────── */

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title — rendered in header, used for aria-labelledby */
  title?: string;
  /** Optional description below title */
  description?: string;
  children: React.ReactNode;
  /** Shows X close button in header — default true */
  showCloseButton?: boolean;
  /** Clicking backdrop closes modal — default true */
  closeOnBackdropClick?: boolean;
  /** Pressing Escape closes modal — default true */
  closeOnEscape?: boolean;
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   MODAL — Desktop (md and above)
───────────────────────────────────────────────────────── */

export interface ModalProps extends BaseModalProps {
  /** Max width of modal panel */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const modalSizeMap = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-xl",
  full: "max-w-full mx-4",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "md",
  className,
}: ModalProps) {
  const shouldReduce = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  useFocusTrap(panelRef, isOpen);
  useScrollLock(isOpen);

  // Escape key handler
  React.useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            variants={shouldReduce ? noAnimation : overlayBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Panel wrapper — centers the modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
          >
            <motion.div
              ref={panelRef}
              className={cn(
                "relative w-full bg-surface-card rounded-2xl shadow-xl",
                "border border-border-default",
                "flex flex-col max-h-[90vh]",
                modalSizeMap[size],
                className,
              )}
              variants={shouldReduce ? noAnimation : modalOpen}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border-default shrink-0">
                  <div className="flex flex-col gap-1">
                    {title && (
                      <h2
                        id={titleId}
                        className="text-h4 font-semibold text-text-heading"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id={descId} className="text-body-sm text-text-muted">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={cn(
                        "shrink-0 p-1.5 rounded-lg text-text-muted",
                        "hover:bg-bg-subtle hover:text-text-body",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-border-gold",
                      )}
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

Modal.displayName = "Modal";

/* ─────────────────────────────────────────────────────────
   MODAL FOOTER
   Sticky footer inside Modal for action buttons
───────────────────────────────────────────────────────── */

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3",
        "px-6 py-4 border-t border-border-default",
        "shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

ModalFooter.displayName = "ModalFooter";

/* ─────────────────────────────────────────────────────────
   BOTTOM SHEET — Mobile (below md breakpoint)
   Slides up from bottom, full-width, rounded top corners.
   Use this instead of Modal on mobile viewports.
───────────────────────────────────────────────────────── */

export interface BottomSheetProps extends BaseModalProps {
  /** Height of the sheet — default is content-driven */
  height?: "auto" | "half" | "full";
}

const bottomSheetHeightMap = {
  auto: "max-h-[90vh]",
  half: "h-[50vh]",
  full: "h-[92vh]",
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  height = "auto",
  className,
}: BottomSheetProps) {
  const shouldReduce = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // Drag-to-close handle bar touch state
  const [dragStart, setDragStart] = React.useState<number | null>(null);

  useFocusTrap(panelRef, isOpen);
  useScrollLock(isOpen);

  React.useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0]?.clientY ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const delta = (e.changedTouches[0]?.clientY ?? 0) - dragStart;
    // Close if dragged down more than 80px
    if (delta > 80) onClose();
    setDragStart(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            variants={shouldReduce ? noAnimation : overlayBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <div
            className="fixed inset-x-0 bottom-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
          >
            <motion.div
              ref={panelRef}
              className={cn(
                "w-full bg-surface-card",
                "rounded-t-2xl shadow-xl",
                "border-t border-border-default",
                "flex flex-col",
                "pb-safe",
                bottomSheetHeightMap[height],
                className,
              )}
              variants={shouldReduce ? noAnimation : bottomSheetOpen}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Drag handle */}
              <div
                className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-hidden="true"
              >
                <div className="w-10 h-1 rounded-full bg-border-strong" />
              </div>

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between gap-4 px-4 pt-2 pb-3 border-b border-border-default shrink-0">
                  <div className="flex flex-col gap-0.5">
                    {title && (
                      <h2
                        id={titleId}
                        className="text-h4 font-semibold text-text-heading"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id={descId} className="text-body-sm text-text-muted">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={cn(
                        "shrink-0 p-1.5 rounded-lg text-text-muted",
                        "hover:bg-bg-subtle hover:text-text-body",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-border-gold",
                      )}
                      aria-label="Close"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

BottomSheet.displayName = "BottomSheet";