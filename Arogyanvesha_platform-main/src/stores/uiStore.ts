/**
 * Arogyanvesha — UI Store
 * Manages global UI state:
 * - Sidebar expanded/collapsed
 * - Active modal tracking
 * - Global loading overlay
 * - Mobile bottom sheet state
 */

import { create } from "zustand";

/* ─────────────────────────────────────────────────────────
   STATE & ACTIONS
───────────────────────────────────────────────────────── */

interface UIState {
  // Sidebar
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // Global loading overlay — blocks entire UI
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Active modal — tracks which modal is open by ID
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  // Mobile nav
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Notification panel
  isNotificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */

export const useUIStore = create<UIState>()((set) => ({
  // Sidebar — expanded by default on desktop
  isSidebarExpanded: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

  // Global loading
  isGlobalLoading: false,
  globalLoadingMessage: null,
 setGlobalLoading: (loading, message) =>
  set({ isGlobalLoading: loading, globalLoadingMessage: message ?? null }),
  // Modal
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  // Mobile nav
  isMobileNavOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

  // Notification panel
  isNotificationPanelOpen: false,
  setNotificationPanelOpen: (open) => set({ isNotificationPanelOpen: open }),
}));