"use client";

import { useThemeStore } from "@/stores/themeStore";
import type { Theme } from "@/types";

/**
 * Convenience hook for theme toggle.
 * Usage:
 *   const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 */
export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  return { theme, resolvedTheme, setTheme, toggleTheme };
}

export type { Theme };