"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore, usePrakritiStore, useChatStore, useRoutineStore } from "@/stores";
import { useIsDesktop } from "@/hooks";
import { Avatar } from "@/components/ui/Avatar";
import { sidebarCollapse } from "@/lib/animations";

/* ─────────────────────────────────────────────────────────
   NAV ICONS
───────────────────────────────────────────────────────── */

function NavIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg
      style={{ width: "20px", height: "20px", flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   NAV ITEMS CONFIG
───────────────────────────────────────────────────────── */

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { href: "/dashboard",  label: "Dashboard",       iconPath: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
      { href: "/prakriti",   label: "Prakriti",        iconPath: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
      { href: "/symptoms",   label: "Symptom Checker", iconPath: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
      { href: "/chat",       label: "AI Vaidya",       iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", badge: "AI" },
    ],
  },
  {
    label: "Wellness",
    items: [
      { href: "/yoga",       label: "Yoga",            iconPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
      { href: "/skin",       label: "Skin Analysis",   iconPath: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" },
      { href: "/routine",    label: "Daily Routine",   iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
      { href: "/progress",   label: "My Progress",     iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/wisdom",     label: "Wisdom Library",  iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
      { href: "/herbs",      label: "Herbs",           iconPath: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
    ],
  },
] as const;

/* ─────────────────────────────────────────────────────────
   COLLAPSE TOGGLE ICON
───────────────────────────────────────────────────────── */

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={cn("w-3.5 h-3.5 transition-transform duration-300", collapsed && "rotate-180")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function Sidebar() {
  const pathname  = usePathname();
  const { isSidebarExpanded, toggleSidebar, setSidebarExpanded } = useUIStore();
  const { user }  = useAuthStore();
  const isDesktop = useIsDesktop();

  React.useEffect(() => {
    if (!isDesktop) setSidebarExpanded(false);
    else setSidebarExpanded(true);
  }, [isDesktop, setSidebarExpanded]);

  const isExpanded = isDesktop ? isSidebarExpanded : false;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isDesktop && isSidebarExpanded && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(45,36,24,0.45)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50",
          "flex flex-col",
          "overflow-hidden",
          "lg:translate-x-0",
          !isDesktop && !isSidebarExpanded && "-translate-x-full",
        )}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.06)",
          borderTopRightRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
        animate={isDesktop
          ? (isExpanded ? sidebarCollapse.expanded : sidebarCollapse.collapsed)
          : { width: 240 }
        }
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Main navigation"
      >

        {/* ── Decorative layers (behind everything) ── */}

        {/* Lotus watermark — center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden="true">
          <div className="relative w-48 h-48 opacity-[0.15]">
            <Image src="/images/illustrations/lotus-watermark.png" alt="" fill  sizes="200px" className="object-contain" priority />
          </div>
        </div>

        {/* Leaf — bottom left */}
        <div className="absolute bottom-0 left-0 pointer-events-none z-0" aria-hidden="true"
          style={{ width: "120px", height: "160px", opacity: 0.28 }}>
          <Image src="/images/illustrations/leaf-left.png" alt="" fill sizes="160px" className="object-contain object-bottom-left" />
        </div>

        {/* Leaf — top right */}
        <div className="absolute top-0 right-0 pointer-events-none z-0" aria-hidden="true"
          style={{ width: "80px", height: "100px", opacity: 0.14 }}>
          <Image src="/images/illustrations/leaf-right.png" alt="" fill sizes="160px" className="object-contain object-top-right" />
        </div>

        {/* ── HEADER ── */}
        <div
          className={cn(
            "relative z-10 flex items-center gap-3 px-4 shrink-0",
            !isExpanded && "justify-center",
          )}
          style={{ height: "72px", borderBottom: "1px solid var(--sidebar-border)" }}
        >
          {/* Logo with gold ring */}
          <div className="relative flex-shrink-0" style={{ width: "42px", height: "42px" }}>
            <div
              className="absolute -inset-[2px] rounded-full"
              style={{ background: "conic-gradient(from 0deg, #D4AF37, #F5E083, #D4AF37)", opacity: 0.6 }}
            />
            <div className="relative w-full h-full rounded-full overflow-hidden" style={{ zIndex: 1 }}>
              <Image
                src="/images/logo/logo.jpeg"
                alt="Arogyanvesha Logo"
                fill
                sizes="42px"
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="flex flex-col overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  className="whitespace-nowrap font-semibold tracking-wide leading-none text-text-primary"
                  style={{ fontSize: "14.5px", fontFamily: "var(--font-display, Georgia, serif)" }}
                >
                  AROGYANVESHA
                </span>
                <span
                  className="whitespace-nowrap mt-0.5 leading-none text-text-muted"
                  style={{ fontSize: "10px", letterSpacing: "0.06em" }}
                >
                  Where AI Meets Ayurveda
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── NAV GROUPS ── */}
        <nav
          className="relative z-10 flex-1 overflow-y-auto py-4 px-3"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#D4AF37 transparent",
          }}
        >
          <style>{`
            nav::-webkit-scrollbar { width: 3px; }
            nav::-webkit-scrollbar-track { background: transparent; }
            nav::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 99px; }
          `}</style>

          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">

              {/* Group label */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.p
                    className="mb-2 px-2"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "var(--sidebar-group-label)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Nav items */}
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3.5 mb-0.5 outline-none",
                      "transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 rounded-2xl",
                      !isExpanded && "justify-center",
                    )}
                    style={{
                      height: "50px",
                      paddingLeft: isExpanded ? "14px" : "12px",
                      paddingRight: isExpanded ? "12px" : "12px",
                      borderRadius: "14px",
                      color: isActive ? "var(--sidebar-text-active)" : "var(--sidebar-text-inactive)",
                      background: isActive
                        ? "var(--sidebar-active-bg)"
                        : "transparent",
                      boxShadow: isActive ? "0 1px 4px rgba(151,72,53,0.08)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-hover-bg)";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--sidebar-hover-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--sidebar-text-inactive)";
                      }
                    }}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2"
                        style={{
                          width: "4px",
                          height: "28px",
                          borderRadius: "99px",
                          background: "linear-gradient(180deg, #D4AF37 0%, #B87C3C 100%)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <NavIcon path={item.iconPath} active={isActive} />

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          className="whitespace-nowrap overflow-hidden flex-1 font-medium"
                          style={{ fontSize: "14.5px" }}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.16 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {"badge" in item && item.badge && isExpanded && (
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          fontSize: "10px",
                          background: "#F3E6C9",
                          color: "#8A5C2B",
                          boxShadow: "0 1px 3px rgba(138,92,43,0.15)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── USER FOOTER ── */}
        <div
          className="relative z-10 shrink-0 px-3 pb-4"
          style={{ borderTop: "1px solid var(--sidebar-border)", paddingTop: "12px" }}
        >
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 outline-none transition-all duration-200",
              !isExpanded && "justify-center",
            )}
            style={{
              padding: isExpanded ? "10px 12px" : "10px",
              borderRadius: "16px",
              background: "var(--sidebar-user-bg)",
              border: "1px solid var(--sidebar-user-border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-user-hover-bg)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-user-bg)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name ?? "User"}
              size="md"
              dosha={user?.primaryDosha}
            />
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="flex flex-col min-w-0 flex-1"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <span
                    className="truncate font-semibold leading-none text-text-primary"
                    style={{ fontSize: "13.5px" }}
                  >
                    {user?.name ?? "User"}
                  </span>
                  <span
                    className="truncate mt-0.5 leading-none text-text-muted"
                    style={{ fontSize: "11px" }}
                  >
                    {user?.email ?? ""}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {isExpanded && (
              <svg
                style={{ width: "14px", height: "14px", flexShrink: 0, color: "#B09A74" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={async () => {
              // Clear all stores on logout
              useAuthStore.getState().logout();
              usePrakritiStore.getState().resetQuiz();
              useChatStore.getState().clearChat();
              useRoutineStore.setState({ todayLog: null, history: [], practices: [] });
              
              await signOut({ callbackUrl: "/login" });
            }}
            className={cn(
              "w-full flex items-center gap-3 outline-none transition-all duration-200 mt-2",
              !isExpanded && "justify-center",
            )}
            style={{
              padding: isExpanded ? "10px 12px" : "10px",
              borderRadius: "16px",
              background: "var(--sidebar-logout-bg)",
              border: "1px solid var(--sidebar-logout-border)",
              color: "var(--sidebar-logout-color)",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-logout-hover-bg)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-logout-bg)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            <svg
              style={{ width: "20px", height: "20px", flexShrink: 0 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="whitespace-nowrap overflow-hidden text-left"
                  style={{ fontSize: "13.5px" }}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* ── COLLAPSE TOGGLE (desktop only) ── */}
        {isDesktop && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute top-[76px] -right-4 z-20 flex items-center justify-center
              transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[#D4AF37]"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "99px",
              background: "#FFFDF8",
              border: "1px solid #E9DEC9",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              color: "#9A8878",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#D4AF37";
              (e.currentTarget as HTMLButtonElement).style.color = "#D4AF37";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(212,175,55,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E9DEC9";
              (e.currentTarget as HTMLButtonElement).style.color = "#9A8878";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.10)";
            }}
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <CollapseIcon collapsed={!isSidebarExpanded} />
          </button>
        )}
      </motion.aside>
    </>
  );
}

Sidebar.displayName = "Sidebar";