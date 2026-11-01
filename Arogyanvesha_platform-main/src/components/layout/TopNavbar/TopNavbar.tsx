"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore, useThemeStore } from "@/stores";
import { Avatar } from "@/components/ui/Avatar";
import { SearchBar } from "@/components/ui/SearchBar";

/* ─────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────── */

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE TITLE MAP
───────────────────────────────────────────────────────── */

const pageTitles: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/prakriti":     "Prakriti Analysis",
  "/symptoms":     "Symptom Checker",
  "/chat":         "AI Vaidya",
  "/yoga":         "Yoga & Wellness",
  "/skin":         "Skin Analysis",
  "/wisdom":       "Wisdom Library",
  "/herbs":        "Herb Encyclopedia",
  "/progress":     "My Progress",
  "/routine":      "Daily Routine",
  "/notifications":"Notifications",
  "/profile":      "My Profile",
  "/settings":     "Settings",
};

function getPageTitle(pathname: string): string {
  const exact = pageTitles[pathname];
  if (exact) return exact;
  const match = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key + "/"),
  );
  return match ? match[1] : "Arogyanvesha";
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function TopNavbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleSidebar, setNotificationPanelOpen, isNotificationPanelOpen } = useUIStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [searchValue, setSearchValue] = React.useState("");

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-30",
        "lg:left-[var(--sidebar-width-expanded)]",
        "h-[64px]",
        "glass border-b border-border-default",
        "flex items-center gap-4 px-4 lg:px-6",
        "transition-all duration-220",
      )}
      aria-label="Top navigation"
    >
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          "lg:hidden p-2 rounded-lg text-text-muted",
          "hover:bg-bg-subtle hover:text-text-body",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        )}
        aria-label="Toggle navigation menu"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Page title — hidden on mobile when search is present */}
      <h1 className="text-h4 font-semibold text-text-heading hidden sm:block shrink-0">
        {pageTitle}
      </h1>

      {/* Search — grows to fill space */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search anything…"
          size="sm"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            "p-2 rounded-lg text-text-muted",
            "hover:bg-bg-subtle hover:text-text-body",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
          )}
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedTheme === "dark"
            ? <SunIcon className="w-5 h-5" />
            : <MoonIcon className="w-5 h-5" />
          }
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => setNotificationPanelOpen(!isNotificationPanelOpen)}
          className={cn(
            "relative p-2 rounded-lg text-text-muted",
            "hover:bg-bg-subtle hover:text-text-body",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
          )}
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-error border-2 border-surface-card"
            aria-hidden="true"
          />
        </button>

        {/* Avatar — links to profile */}
        <Link
          href="/profile"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold rounded-full"
          aria-label="Go to profile"
        >
          <Avatar
            src={user?.avatarUrl}
            name={user?.name ?? "User"}
            size="sm"
            priority
          />
        </Link>
      </div>
    </header>
  );
}

TopNavbar.displayName = "TopNavbar";