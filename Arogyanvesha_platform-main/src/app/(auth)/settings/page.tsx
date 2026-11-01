"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useAuthStore } from "@/stores";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";

const SETTINGS_SECTIONS = [
  {
    title: "Account",
    items: [
      { label: "Personal Information", desc: "Name, email, date of birth, gender", href: "/settings/account", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
      { label: "Security & Password",  desc: "Change password, 2FA, active sessions",   href: "/settings/account", icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" },
    ],
  },
  {
    title: "Wellness",
    items: [
      { label: "Prakriti & Dosha",  desc: "View and update your constitution", href: "/prakriti",                icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25" },
      { label: "Routine Preferences", desc: "Customise your Dinacharya practices", href: "/routine",             icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5" },
    ],
  },
  {
    title: "App",
    items: [
      { label: "Notifications",    desc: "Push, email and reminder preferences",   href: "/settings/notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75" },
      { label: "Privacy & Data",   desc: "Data usage, export and deletion",        href: "/settings/privacy",       icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6" },
      { label: "Subscription",     desc: "Plan, billing, and upgrade options",     href: "/settings/subscription",  icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z", badge: "Upgrade" },
    ],
  },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">Settings</h1>
          <p className="text-body text-text-muted">Manage your account and preferences</p>
        </div>

        {/* Sections */}
        {SETTINGS_SECTIONS.map((section, si) => (
          <motion.div key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}>
            <p className="text-label font-semibold text-text-muted uppercase tracking-wider mb-3">
              {section.title}
            </p>
            <div className="flex flex-col divide-y divide-border-default rounded-xl border border-border-default bg-surface-card overflow-hidden shadow-xs">
              {section.items.map((item) => (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-bg-subtle transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-bg-subtle flex items-center justify-center shrink-0 group-hover:bg-brand-burgundy/10 transition-colors">
                    <svg className="w-4.5 h-4.5 text-text-muted group-hover:text-brand-burgundy transition-colors"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-body-sm font-semibold text-text-heading">{item.label}</p>
                      {"badge" in item && item.badge && (
                        <Badge variant="brand" size="sm">{item.badge}</Badge>
                      )}
                    </div>
                    <p className="text-label text-text-muted">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-text-disabled group-hover:text-text-muted transition-colors shrink-0"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                  </svg>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Account info */}
        <motion.div
          className="p-4 rounded-xl bg-bg-subtle border border-border-default"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-semibold text-text-heading">{user?.name ?? "Your Account"}</p>
              <p className="text-label text-text-muted">{user?.email}</p>
            </div>
            <Badge variant={user?.plan === "free" ? "default" : "gold"} size="md" className="capitalize">
              {user?.plan ?? "free"} plan
            </Badge>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-label font-semibold text-text-muted uppercase tracking-wider">Danger Zone</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={logout}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-status-error/30 bg-status-error-bg text-status-error text-body-sm font-semibold hover:bg-status-error hover:text-text-inverted transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              Sign out
            </button>
            <button type="button"
              className="flex-1 flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-border-default bg-surface-card text-text-muted text-body-sm font-semibold hover:border-status-error/40 hover:text-status-error transition-all duration-200">
              Delete account
            </button>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}