/**
 * Arogyanvesha — Provider Tree
 * Wraps the entire app. Order matters:
 * SessionProvider → ThemeProvider → ToastProvider → children
 *
 * Used in src/app/layout.tsx as:
 *   <Providers>{children}</Providers>
 */

"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { useThemeStore } from "@/stores/themeStore";

/* ─────────────────────────────────────────────────────────
   THEME SYNC
   Applies .dark class to <html> on mount and when
   theme changes. Runs only on client.
───────────────────────────────────────────────────────── */

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  React.useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.setAttribute("data-theme", isDark ? "dark" : "light");

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const current = useThemeStore.getState().theme;
      if (current === "system") {
        if (e.matches) {
          root.classList.add("dark");
          root.setAttribute("data-theme", "dark");
        } else {
          root.classList.remove("dark");
          root.setAttribute("data-theme", "light");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return null;
}

/* ─────────────────────────────────────────────────────────
   PROVIDERS
───────────────────────────────────────────────────────── */

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeSync />
      <ToastProvider maxToasts={3}>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}