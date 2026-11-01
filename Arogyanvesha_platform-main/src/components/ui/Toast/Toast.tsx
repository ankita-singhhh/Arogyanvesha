"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn, generateId } from "@/lib/utils";
import { toastEnter, noAnimation } from "@/lib/animations";
import type { ToastItem } from "@/types";

/* ─────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────── */

function SuccessIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   TOAST VARIANT CONFIG
───────────────────────────────────────────────────────── */

const toastConfig = {
  success: {
    icon: <SuccessIcon />,
    containerClass: "bg-status-success-bg border-status-success/30",
    iconClass: "text-status-success",
    titleClass: "text-status-success",
  },
  error: {
    icon: <ErrorIcon />,
    containerClass: "bg-status-error-bg border-status-error/30",
    iconClass: "text-status-error",
    titleClass: "text-status-error",
  },
  warning: {
    icon: <WarningIcon />,
    containerClass: "bg-status-warning-bg border-status-warning/30",
    iconClass: "text-status-warning",
    titleClass: "text-status-warning",
  },
  info: {
    icon: <InfoIcon />,
    containerClass: "bg-status-info-bg border-status-info/30",
    iconClass: "text-status-info",
    titleClass: "text-status-info",
  },
} as const;

/* ─────────────────────────────────────────────────────────
   SINGLE TOAST ITEM
───────────────────────────────────────────────────────── */

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastItemProps) {
  const shouldReduce = useReducedMotion();
  const config = toastConfig[toast.type];
  const duration = toast.duration ?? 4000;

  // Auto-dismiss timer
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      variants={shouldReduce ? noAnimation : toastEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "flex items-start gap-3 w-full max-w-sm",
        "px-4 py-3 rounded-lg border shadow-lg",
        "pointer-events-auto",
        config.containerClass,
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Icon */}
      <span className={cn("mt-0.5", config.iconClass)}>
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-body-sm font-semibold", config.titleClass)}>
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-body-sm text-text-muted mt-0.5">
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={cn(
          "shrink-0 p-0.5 rounded text-text-muted mt-0.5",
          "hover:text-text-body hover:bg-black/5",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        )}
        aria-label="Dismiss notification"
      >
        <CloseIcon />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   TOAST CONTEXT
───────────────────────────────────────────────────────── */

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/* ─────────────────────────────────────────────────────────
   TOAST PROVIDER
   Wrap the app root with this. Renders the portal + toasts.
───────────────────────────────────────────────────────── */

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Max toasts visible at once — default 3 */
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 3 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = generateId();
      setToasts((prev) => {
        const next = [...prev, { ...item, id }];
        // Keep only the last maxToasts
        return next.slice(-maxToasts);
      });
    },
    [maxToasts],
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast portal — fixed position, top-right on desktop */}
      <div
        className={cn(
          "fixed z-[9999] flex flex-col gap-2 pointer-events-none",
          // Desktop: top-right
          "top-4 right-4",
          // Mobile: bottom, full width
          "max-sm:top-auto max-sm:bottom-20 max-sm:right-4 max-sm:left-4",
        )}
        aria-label="Notifications"
      >
        <AnimatePresence mode="sync">
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────
   useToast HOOK
   Call anywhere inside ToastProvider to fire toasts.

   Usage:
     const { toast } = useToast();
     toast({ type: "success", title: "Saved!", description: "Your changes were saved." });
───────────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}