"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { useIsDesktop } from "@/hooks";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isSidebarExpanded } = useUIStore();
  const isDesktop = useIsDesktop();

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Sidebar */}
      <Sidebar />

      {/* Top navbar */}
      <TopNavbar />

      {/* Main content area */}
      <main
        className={cn(
          "transition-all duration-220",
          "pt-[64px]", // TopNavbar height
          "pb-tabbar lg:pb-0", // BottomTabBar on mobile
          // Desktop sidebar offset
          isDesktop && isSidebarExpanded && "lg:pl-[240px]",
          isDesktop && !isSidebarExpanded && "lg:pl-[72px]",
        )}
        id="main-content"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomTabBar />
    </div>
  );
}

AppShell.displayName = "AppShell";