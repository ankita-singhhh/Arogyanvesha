"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  pageEnter,
  staggerContainer,
  cardEnter,
  scrollReveal,
} from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import { useAuthStore, useRoutineStore } from "@/stores";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import type { ActivityItem, Dosha, DoshaBalance } from "@/types";
import { api } from "@/lib/api";

const AYURVEDIC_QUOTE = "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need. — Charaka Samhita";

const QUICK_ACTIONS = [
  {
    href: "/chat",      label: "AI Vaidya",     description: "Ask your Ayurvedic questions",
    iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    gradient: "linear-gradient(135deg, #682332 0%, #4A1520 100%)",
    iconColor: "#fff", badgeText: "New",
  },
  {
    href: "/prakriti",  label: "Prakriti",      description: "Understand your constitution",
    iconPath: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    gradient: "linear-gradient(135deg, #F5EDD3 0%, #EDE3C0 100%)",
    iconColor: "#682332", badgeText: null,
  },
  {
    href: "/yoga",      label: "Yoga",          description: "Today's recommended practice",
    iconPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    gradient: "linear-gradient(135deg, #EFF4F0 0%, #DCF0E0 100%)",
    iconColor: "#3D7A5C", badgeText: null,
  },
  {
    href: "/skin",      label: "Skin Analysis", description: "AI-powered skin assessment",
    iconPath: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z",
    gradient: "linear-gradient(135deg, #EBF5FB 0%, #D6EEF8 100%)",
    iconColor: "#2A5A8A", badgeText: "Beta",
  },
  {
    href: "/diagnosis",  label: "AI Diagnosis",  description: "Tongue & eye Ayurvedic analysis",
    iconPath: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    gradient: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)",
    iconColor: "#9D174D", badgeText: "New",
  },
] as const;

const activityConfig: Record<string, { dot: string; iconPath: string }> = {
  prakriti: { dot: "#8064a2", iconPath: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  yoga:     { dot: "#3D7A5C", iconPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
  chat:     { dot: "#682332", iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
  wisdom:   { dot: "#D4AF37", iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
  skin:     { dot: "#2A5A8A", iconPath: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" },
  routine:  { dot: "#3D7A5C", iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
};

function relativeTime(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* ─────────────────────────────────────────────────────────
   GREETING HERO BANNER
───────────────────────────────────────────────────────── */

function GreetingSection({ name, streak }: { name: string; streak: number }) {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const timeLabel = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #6B2535 0%, #4E1B27 40%, #2A0D14 80%, #190710 100%)",
        boxShadow: "0 24px 72px rgba(104,35,50,0.32), 0 4px 20px rgba(0,0,0,0.16), inset 0 1px 0 rgba(212,175,55,0.12)",
        minHeight: "200px",
      }}
    >
      {/* Ambient warm top-left glow */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: "320px",
          height: "320px",
          background: "radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 65%)",
          filter: "blur(40px)",
          transform: "translate(-30%, -40%)",
        }}
      />

      {/* Ambient burgundy mid glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "30%",
          width: "300px",
          height: "200px",
          background: "radial-gradient(ellipse, rgba(150,50,70,0.20) 0%, transparent 70%)",
          filter: "blur(50px)",
          transform: "translateY(-50%)",
        }}
      />

      {/* Top gold highlight line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.50) 40%, rgba(212,175,55,0.30) 70%, transparent 100%)" }}
      />

      {/* Meditation illustration — seamlessly blended, right side */}
      <div
        className="absolute inset-y-0 right-0 hidden sm:block pointer-events-none"
        style={{ width: "55%", zIndex: 1 }}
        aria-hidden
      >
        {/* Multi-stop gradient mask: left fades to banner BG, bottom fades out */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #4E1B27 0%, rgba(78,27,39,0.85) 20%, rgba(78,27,39,0.40) 50%, transparent 80%)",
            zIndex: 2,
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "50%",
            background: "linear-gradient(to top, rgba(26,8,16,0.6) 0%, transparent 100%)",
            zIndex: 3,
          }}
        />
        {/* Soft golden halo behind figure */}
        <div
          className="absolute"
          style={{
            top: "10%",
            right: "10%",
            width: "60%",
            height: "80%",
            background: "radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 65%)",
            filter: "blur(32px)",
            zIndex: 1,
          }}
        />
        <Image
          src="/images/dashboard/greeting-meditation.png"
          alt=""
          fill
          sizes="(max-width: 640px) 0px, 55vw"
          loading="eager"
          className="object-contain object-right-bottom"
          style={{ opacity: 0.88, mixBlendMode: "luminosity" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-7 sm:p-9 flex flex-col justify-between" style={{ minHeight: "200px" }}>
        <div style={{ maxWidth: "380px" }}>
          <p
            className="text-xs font-semibold mb-2"
            style={{
              color: "rgba(212,175,55,0.80)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "var(--font-body,sans-serif)",
            }}
          >
            {timeLabel}
          </p>
          <h2
            className="font-bold text-white mb-2"
            style={{
              fontFamily: "var(--font-display,Georgia,serif)",
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {greeting}, {name.split(" ")[0]}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.44)",
              fontFamily: "var(--font-body,sans-serif)",
              lineHeight: 1.6,
              maxWidth: "300px",
            }}
          >
            Your wellness journey continues today.
          </p>
        </div>

        <div
          className="mt-6 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl"
              style={{
                background: "rgba(212,175,55,0.10)",
                border: "1px solid rgba(212,175,55,0.22)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="font-bold leading-none"
                style={{
                  fontFamily: "var(--font-display,Georgia,serif)",
                  fontSize: "1.75rem",
                  color: "#D4AF37",
                }}
              >
                {streak}
              </span>
              <span
                className="text-xs font-medium mt-1"
                style={{ color: "rgba(212,175,55,0.60)", letterSpacing: "0.05em" }}
              >
                day streak
              </span>
            </div>
          </div>

          <p
            className="hidden md:block italic text-right"
            style={{
              fontSize: "11.5px",
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-body,sans-serif)",
              maxWidth: "240px",
              lineHeight: 1.6,
            }}
          >
            &ldquo;{AYURVEDIC_QUOTE}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   AROGYA SCORE CARD
───────────────────────────────────────────────────────── */

function ArogyaScoreCard({ score }: { score: number | null }) {
  if (score === null) {
    return <div className="rounded-3xl border border-border-default bg-surface-card p-7 text-body-sm text-text-muted">No health score is available yet. Complete an assessment to start tracking your progress.</div>;
  }
  const getLabel      = (s: number) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Fair" : "Needs attention";
  const getLabelColor = (s: number) => s >= 80 ? "#3D7A5C" : s >= 60 ? "#C9A030" : s >= 40 ? "#C47A1A" : "#B02020";

  return (
    <div
      className="relative rounded-3xl overflow-hidden h-full"
      style={{
        background: "var(--color-surface-card,#fff)",
        border: "1px solid rgba(212,175,55,0.12)",
        boxShadow: "0 4px 24px rgba(45,36,24,0.09), 0 1px 4px rgba(45,36,24,0.05)",
      }}
    >
      {/* Ambient gold orb */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "180px",
          height: "180px",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="relative p-7 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-text-muted,#9A8E84)", fontFamily: "var(--font-body,sans-serif)", letterSpacing: "0.08em" }}
            >
              Arogya Score
            </p>
            <h3
              className="font-bold"
              style={{
                fontFamily: "var(--font-display,Georgia,serif)",
                fontSize: "1.2rem",
                color: "var(--color-text-heading,#2D2418)",
                letterSpacing: "-0.01em",
              }}
            >
              Your Wellness
            </h3>
          </div>
          <Badge variant="gold" size="sm">Today</Badge>
        </div>

        <div className="flex items-center gap-6 flex-1">
          <ProgressRing value={score} variant="arogya" size={108} strokeWidth={10} animate />
          <div>
            <p
              className="font-bold"
              style={{
                fontFamily: "var(--font-display,Georgia,serif)",
                fontSize: "2.4rem",
                color: getLabelColor(score),
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {score}
            </p>
            <p className="font-semibold mt-1.5" style={{ fontSize: "13px", color: getLabelColor(score) }}>
              {getLabel(score)}
            </p>
            <p className="mt-2" style={{ fontSize: "12px", color: "var(--color-text-muted,#9A8E84)", lineHeight: 1.6 }}>
              Keep up your daily<br />routine to improve
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: "11.5px", color: "var(--color-text-muted,#9A8E84)" }}>Progress this week</span>
            <span style={{ fontSize: "11.5px", color: "#3D7A5C", fontWeight: 600 }}>+4 pts</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(45,36,24,0.07)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #682332, #D4AF37)" }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DOSHA BALANCE CARD
───────────────────────────────────────────────────────── */

function DoshaBalanceCard({ balance, primaryDosha }: { balance: DoshaBalance | null; primaryDosha: Dosha | null | undefined }) {
  if (!balance) {
    return <div className="rounded-3xl border border-border-default bg-surface-card p-7 text-body-sm text-text-muted">Complete your Prakriti assessment to receive personalized guidance.</div>;
  }
  const doshas: Dosha[] = ["vata", "pitta", "kapha"];
  const DOSHA_META: Record<Dosha, { emoji: string; color: string; track: string }> = {
    vata:  { emoji: "🌬️", color: "#8064a2", track: "rgba(128,100,162,0.10)" },
    pitta: { emoji: "🔥", color: "#C45C1A", track: "rgba(196,92,26,0.10)"   },
    kapha: { emoji: "🌊", color: "#3D7A5C", track: "rgba(61,122,92,0.10)"   },
  };

  return (
    <div
      className="rounded-3xl overflow-hidden h-full"
      style={{
        background: "var(--color-surface-card,#fff)",
        border: "1px solid rgba(212,175,55,0.12)",
        boxShadow: "0 4px 24px rgba(45,36,24,0.09), 0 1px 4px rgba(45,36,24,0.05)",
      }}
    >
      <div className="p-7 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted,#9A8E84)", letterSpacing: "0.08em" }}>
              Constitution
            </p>
            <h3
              className="font-bold"
              style={{
                fontFamily: "var(--font-display,Georgia,serif)",
                fontSize: "1.2rem",
                color: "var(--color-text-heading,#2D2418)",
                letterSpacing: "-0.01em",
              }}
            >
              Dosha Balance
            </h3>
          </div>
          <Link
            href="/prakriti"
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
            style={{ background: "rgba(104,35,50,0.07)", color: "#682332" }}
          >
            Details →
          </Link>
        </div>

        {primaryDosha && (
          <div
            className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(245,237,211,0.7) 0%, rgba(237,227,192,0.7) 100%)",
              border: "1px solid rgba(212,175,55,0.20)",
            }}
          >
            <span style={{ fontSize: "20px" }}>{DOSHA_META[primaryDosha].emoji}</span>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted,#9A8E84)" }}>Primary Dosha</p>
              <p className="font-bold capitalize" style={{ fontSize: "13.5px", color: "var(--color-text-heading,#2D2418)" }}>
                {primaryDosha}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 flex-1">
          {doshas.map((dosha) => {
            const meta = DOSHA_META[dosha];
            return (
              <div key={dosha}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "15px" }}>{meta.emoji}</span>
                    <span
                      className="font-semibold capitalize"
                      style={{ fontSize: "13px", color: "var(--color-text-heading,#2D2418)" }}
                    >
                      {dosha}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums" style={{ fontSize: "13px", color: meta.color }}>
                    {balance[dosha]}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: meta.track }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${balance[dosha]}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ROUTINE PROGRESS CARD
───────────────────────────────────────────────────────── */

function RoutineProgressCard() {
  const { getCompletionPercentage, practices } = useRoutineStore();
  const percentage = getCompletionPercentage();
  const completed  = Math.round((percentage / 100) * practices.length);
  const total      = practices.length || 8;

  const ROUTINE_ITEMS = [
    { label: "Oil Pulling", done: true,  emoji: "🫧" },
    { label: "Meditation",  done: true,  emoji: "🧘" },
    { label: "Yoga Flow",   done: false, emoji: "🌿" },
    { label: "Herbal Tea",  done: false, emoji: "🍵" },
  ];

  return (
    <div
      className="relative rounded-3xl overflow-hidden h-full"
      style={{
        background: "var(--color-surface-card,#fff)",
        border: "1px solid rgba(212,175,55,0.12)",
        boxShadow: "0 4px 24px rgba(45,36,24,0.09), 0 1px 4px rgba(45,36,24,0.05)",
      }}
    >
      {/* Lotus watermark — very subtle, bottom-right */}
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-[0.05]" aria-hidden>
        <Image
          src="/images/dashboard/lotus.png"
          alt=""
          fill
          sizes="96px"
          className="object-contain"
        />
      </div>

      <div className="relative p-7 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted,#9A8E84)", letterSpacing: "0.08em" }}>
              Daily Practice
            </p>
            <h3
              className="font-bold"
              style={{
                fontFamily: "var(--font-display,Georgia,serif)",
                fontSize: "1.2rem",
                color: "var(--color-text-heading,#2D2418)",
                letterSpacing: "-0.01em",
              }}
            >
              Today&apos;s Routine
            </h3>
          </div>
          <Link
            href="/routine"
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(61,122,92,0.09)", color: "#3D7A5C" }}
          >
            View all →
          </Link>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <ProgressRing value={percentage} variant="routine" size={70} strokeWidth={7} animate />
          <div>
            <p
              className="font-bold"
              style={{
                fontFamily: "var(--font-display,Georgia,serif)",
                fontSize: "1.6rem",
                color: "var(--color-text-heading,#2D2418)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {completed}
              <span style={{ fontSize: "1rem", color: "var(--color-text-muted,#9A8E84)", fontWeight: 400 }}>
                /{total}
              </span>
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted,#9A8E84)", marginTop: "4px" }}>
              practices done
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {ROUTINE_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
              style={{
                background: item.done ? "rgba(61,122,92,0.06)" : "rgba(45,36,24,0.04)",
                border: `1px solid ${item.done ? "rgba(61,122,92,0.14)" : "transparent"}`,
              }}
            >
              <span style={{ fontSize: "15px" }}>{item.emoji}</span>
              <span
                className="flex-1 font-medium"
                style={{
                  fontSize: "13px",
                  color: item.done ? "var(--color-text-muted,#9A8E84)" : "var(--color-text-heading,#2D2418)",
                  textDecoration: item.done ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
              {item.done ? (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#3D7A5C" }}
                >
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ border: "1.5px solid rgba(45,36,24,0.18)" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          {percentage === 100 ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-2xl"
              style={{ background: "rgba(61,122,92,0.08)", border: "1px solid rgba(61,122,92,0.18)" }}
            >
              <p className="font-semibold text-sm" style={{ color: "#3D7A5C" }}>All practices complete</p>
            </div>
          ) : (
            <Link href="/routine">
              <Button variant="sage" className="w-full" size="sm">
                Continue routine
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   QUICK ACTIONS GRID
───────────────────────────────────────────────────────── */

function QuickActionsGrid() {
  return (
    <div>
      <h3
        className="font-bold mb-5"
        style={{
          fontFamily: "var(--font-display,Georgia,serif)",
          fontSize: "1.2rem",
          color: "var(--color-text-heading,#2D2418)",
          letterSpacing: "-0.01em",
        }}
      >
        Quick Access
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(104,35,50,0.16)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col gap-3.5 p-5 rounded-3xl cursor-pointer overflow-hidden"
              style={{
                background: action.gradient,
                border: "1px solid rgba(0,0,0,0.04)",
                boxShadow: "0 2px 12px rgba(45,36,24,0.07)",
              }}
            >
              {action.badgeText && (
                <div
                  className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)" }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: action.iconColor === "#fff" ? "rgba(255,255,255,0.90)" : action.iconColor,
                    }}
                  >
                    {action.badgeText}
                  </span>
                </div>
              )}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.20)" }}
              >
                <svg
                  style={{ width: "20px", height: "20px", color: action.iconColor }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.iconPath} />
                </svg>
              </div>
              <div>
                <p className="font-bold" style={{ fontSize: "13.5px", color: action.iconColor, lineHeight: 1.2 }}>
                  {action.label}
                </p>
                <p className="mt-1 leading-snug" style={{ fontSize: "11.5px", color: action.iconColor, opacity: 0.60 }}>
                  {action.description}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   AI VAIDYA BANNER
───────────────────────────────────────────────────────── */

function AIVaidyaBanner() {
  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #7A2838 0%, #5C1828 35%, #3D0E1A 70%, #220810 100%)",
        boxShadow: "0 24px 72px rgba(104,35,50,0.32), 0 4px 20px rgba(0,0,0,0.16), inset 0 1px 0 rgba(212,175,55,0.10)",
      }}
    >
      {/* Ambient gold top-right orb */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 60%)",
          filter: "blur(40px)",
          transform: "translate(35%, -35%)",
        }}
      />

      {/* Top highlight line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.45) 40%, transparent 100%)" }}
      />

      {/* AI brain illustration — bleeds out of right, fully blended */}
      <div
        className="absolute hidden sm:block pointer-events-none"
        style={{
          top: "50%",
          right: "-30px",
          width: "220px",
          height: "220px",
          transform: "translateY(-50%)",
          zIndex: 1,
        }}
        aria-hidden
      >
        {/* Radial glow halo */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.30) 0%, transparent 65%)",
            filter: "blur(24px)",
            transform: "scale(1.2)",
          }}
        />
        {/* Edge fade — all sides */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 35%, rgba(34,8,16,0.70) 80%, rgba(34,8,16,0.95) 100%)",
            zIndex: 2,
          }}
        />
        {/* Left-side fade into banner */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(61,14,26,0.95) 0%, rgba(61,14,26,0.40) 35%, transparent 65%)",
            zIndex: 3,
          }}
        />
        <div className="relative w-full h-full" style={{ zIndex: 1 }}>
          <Image
            src="/images/dashboard/ai-brain.png"
            alt=""
            fill
            sizes="220px"
            className="object-contain"
            style={{ opacity: 0.90, mixBlendMode: "screen" }}
          />
        </div>
      </div>

      <div className="relative z-10 p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1" style={{ maxWidth: "440px" }}>
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.20)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#D4AF37", boxShadow: "0 0 8px rgba(212,175,55,0.9)" }}
            />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#D4AF37",
              }}
            >
              AI Meets Ayurveda
            </span>
          </div>
          <h3
            className="font-bold text-white mb-3"
            style={{
              fontFamily: "var(--font-display,Georgia,serif)",
              fontSize: "clamp(1.2rem,2.4vw,1.6rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Intelligence Rooted in Tradition
          </h3>
          <p
            className="mb-6"
            style={{ fontSize: "14px", color: "rgba(212,175,55,0.55)", lineHeight: 1.75 }}
          >
            AI Vaidya provides educational guidance from the knowledge sources available to this application. It is not a substitute for clinical care.
          </p>
          <Link href="/chat">
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 12px 36px rgba(212,175,55,0.50)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 font-semibold"
              style={{
                height: "46px",
                paddingInline: "24px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #D4AF37 0%, #C9A030 100%)",
                color: "#2D1B0E",
                fontSize: "13.5px",
                boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
              }}
            >
              Chat with AI Vaidya
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   WISDOM & HERBAL SECONDARY CARDS
───────────────────────────────────────────────────────── */

function WisdomCard() {
  return (
    <div
      className="relative rounded-3xl overflow-hidden h-full"
      style={{
        background: "var(--color-surface-card,#fff)",
        border: "1px solid rgba(212,175,55,0.12)",
        boxShadow: "0 4px 24px rgba(45,36,24,0.09), 0 1px 4px rgba(45,36,24,0.05)",
      }}
    >
      {/* Manuscript illustration — right edge, fully blended */}
      <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, var(--color-surface-card,#fff) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)",
            zIndex: 1,
          }}
        />
        <Image
          src="/images/dashboard/ancient-books.png"
          alt=""
          fill
          sizes="(max-width: 640px) 40vw, 20vw"
          className="object-contain object-right-center"
          style={{ opacity: 0.12 }}
        />
      </div>

      <div className="relative z-10 p-7">
        <div
          className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.18)" }}
        >
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#8A5C2B",
            }}
          >
            Ancient Wisdom
          </span>
        </div>
        <h3
          className="font-bold mb-2.5"
          style={{
            fontFamily: "var(--font-display,Georgia,serif)",
            fontSize: "1.1rem",
            color: "var(--color-text-heading,#2D2418)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          5,000 Years of Healing.<br />Now in Your Pocket.
        </h3>
        <p
          className="mb-5"
          style={{ fontSize: "13.5px", color: "var(--color-text-muted,#9A8E84)", lineHeight: 1.65, maxWidth: "220px" }}
        >
          Explore timeless Ayurvedic knowledge curated for today&apos;s lifestyle.
        </p>
        <Link
          href="/wisdom"
          className="inline-flex items-center gap-1.5 font-semibold"
          style={{ fontSize: "13.5px", color: "#682332" }}
        >
          Explore library →
        </Link>
      </div>
    </div>
  );
}

function HerbalTipsCard() {
  return (
    <div
      className="relative rounded-3xl overflow-hidden h-full"
      style={{
        background: "linear-gradient(135deg, #EFF4F0 0%, #DCF0E0 100%)",
        border: "1px solid rgba(61,122,92,0.15)",
        boxShadow: "0 4px 24px rgba(61,122,92,0.09), 0 1px 4px rgba(61,122,92,0.05)",
      }}
    >
      {/* Herbal tea illustration — bottom-right, blended */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none"
        style={{ width: "100px", height: "100px" }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 70% 80%, rgba(239,244,240,0.90) 0%, transparent 65%)",
            zIndex: 1,
          }}
        />
        <Image
          src="/images/dashboard/herbal-tea.png"
          alt=""
          fill
          sizes="100px"
          className="object-contain object-right-bottom"
          style={{ opacity: 0.35 }}
        />
      </div>

      <div className="relative z-10 p-7">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(61,122,92,0.14)" }}
        >
          <svg
            style={{ width: "20px", height: "20px", color: "#3D7A5C" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3
          className="font-bold mt-1 mb-2"
          style={{
            fontFamily: "var(--font-display,Georgia,serif)",
            fontSize: "1.1rem",
            color: "#2D5A3D",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          Today&apos;s Herbal Tip
        </h3>
        <p
          style={{ fontSize: "13.5px", color: "#4A7A5C", lineHeight: 1.65, maxWidth: "200px" }}
        >
          Start your morning with warm ginger-tulsi tea to kindle digestive fire.
        </p>
        <div
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(61,122,92,0.12)", border: "1px solid rgba(61,122,92,0.20)" }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#2D5A3D",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            Vata season tip
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RECENT ACTIVITY FEED
───────────────────────────────────────────────────────── */

function RecentActivityFeed({ activity }: { activity: ActivityItem[] }) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "var(--color-surface-card,#fff)",
        border: "1px solid rgba(212,175,55,0.12)",
        boxShadow: "0 4px 24px rgba(45,36,24,0.09), 0 1px 4px rgba(45,36,24,0.05)",
      }}
    >
      <div className="px-7 pt-7 pb-3 flex items-center justify-between">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--color-text-muted,#9A8E84)", letterSpacing: "0.08em" }}
          >
            History
          </p>
          <h3
            className="font-bold"
            style={{
              fontFamily: "var(--font-display,Georgia,serif)",
              fontSize: "1.2rem",
              color: "var(--color-text-heading,#2D2418)",
              letterSpacing: "-0.01em",
            }}
          >
            Recent Activity
          </h3>
        </div>
        <Link
          href="/progress"
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(104,35,50,0.07)", color: "#682332" }}
        >
          View all →
        </Link>
      </div>

      <div className="px-7 pb-7 mt-4">
        <div className="relative">
          <div
            className="absolute left-[15px] top-3 bottom-3 w-px pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(45,36,24,0.10), transparent)" }}
          />
          <div className="flex flex-col gap-0">
            {activity.length === 0 ? (
              <p className="py-4 text-body-sm text-text-muted">Your recent activity will appear here as you use Arogyanvesha.</p>
            ) : activity.map((item, i) => {
              const config = activityConfig[item.type] ?? activityConfig.wisdom!;
              return (
                <motion.div
                  key={item.id}
                  className="relative flex items-start gap-4 py-4"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  style={{
                    borderBottom: i < activity.length - 1
                      ? "1px solid rgba(45,36,24,0.07)"
                      : "none",
                  }}
                >
                  <div
                    className="relative z-10 w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: `${config.dot}14`,
                      border: `1.5px solid ${config.dot}35`,
                    }}
                  >
                    <svg
                      style={{ width: "14px", height: "14px", color: config.dot }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={config.iconPath} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ fontSize: "13.5px", color: "var(--color-text-heading,#2D2418)" }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="truncate mt-0.5"
                      style={{ fontSize: "12px", color: "var(--color-text-muted,#9A8E84)" }}
                    >
                      {item.description}
                    </p>
                  </div>
                  <span
                    className="text-xs tabular-nums flex-shrink-0 mt-0.5"
                    style={{ color: "var(--color-text-muted,#9A8E84)" }}
                  >
                    {relativeTime(item.completedAt)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PRAKRITI CTA
───────────────────────────────────────────────────────── */

function PrakritiCTA() {
  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #6B2535 0%, #4E1B27 45%, #2A0D14 80%, #190710 100%)",
        boxShadow: "0 24px 72px rgba(104,35,50,0.30), 0 4px 20px rgba(0,0,0,0.14), inset 0 1px 0 rgba(212,175,55,0.10)",
      }}
    >
      {/* Ambient gold orb top-right */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(212,175,55,0.13) 0%, transparent 60%)",
          filter: "blur(48px)",
          transform: "translate(30%, -35%)",
        }}
      />

      {/* Ambient burgundy center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          width: "60%",
          height: "150%",
          background: "radial-gradient(ellipse, rgba(150,40,65,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Top highlight line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.45) 40%, transparent 100%)" }}
      />

      {/* Lotus watermark — bottom-right corner, very subtle */}
      <div
        className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none opacity-[0.07]"
        aria-hidden
      >
        <Image
          src="/images/dashboard/lotus.png"
          alt=""
          fill
          sizes="160px"
          className="object-contain object-bottom-right"
        />
      </div>

      {/* Subtle botanical top-left */}
      <div
        className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-[0.06]"
        aria-hidden
      >
        <Image
          src="/images/illustrations/leaf-left.png"
          alt=""
          fill
          sizes="128px"
          className="object-contain object-top-left"
        />
      </div>

      <div className="relative z-10 p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-7">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(212,175,55,0.12)",
            border: "1px solid rgba(212,175,55,0.22)",
            boxShadow: "0 0 24px rgba(212,175,55,0.10)",
          }}
        >
          <svg
            style={{ width: "26px", height: "26px", color: "#D4AF37" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div
            className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.20)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#D4AF37", boxShadow: "0 0 8px rgba(212,175,55,0.9)" }}
            />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#D4AF37",
              }}
            >
              Personalised Assessment
            </span>
          </div>
          <h3
            className="font-bold text-white mb-2"
            style={{
              fontFamily: "var(--font-display,Georgia,serif)",
              fontSize: "clamp(1.15rem,2.2vw,1.5rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Discover your Prakriti
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.44)", lineHeight: 1.7 }}>
            Take the 20-question assessment to unlock personalised Ayurvedic insights tailored to your unique constitution.
          </p>
        </div>

        <Link href="/prakriti/quiz" className="flex-shrink-0 w-full sm:w-auto">
          <Button variant="primary-gold" size="md" className="w-full sm:w-auto">
            Start assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const shouldReduce = useReducedMotion();
  const { user }     = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [activity, setActivity] = React.useState<ActivityItem[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [score, setScore] = React.useState<number | null>(null);
  const [balance, setBalance] = React.useState<DoshaBalance | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<any[]>("/progress/activity"),
      api.get<{ currentStreak: number }>("/progress/streak"),
      api.get<any[]>("/progress/health-score"),
      api.get<any>("/prakriti/result"),
    ]).then(([activityResponse, streakResponse, scoreResponse, prakritiResponse]) => {
      if (cancelled) return;
      setActivity((activityResponse.data ?? []).map((item: any) => ({ id: item.id, type: item.type, title: item.title, description: item.description, completedAt: item.created_at })));
      setStreak(streakResponse.data?.currentStreak ?? 0);
      setScore(scoreResponse.data?.[0]?.overall ?? null);
      setBalance(prakritiResponse.data?.balance ?? null);
    }).catch(() => {
      if (!cancelled) { setActivity([]); setStreak(0); setScore(null); setBalance(null); }
    });
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <PageContainer className="py-8">
        <div className="flex flex-col gap-6">
          <SkeletonLoader variant="avatar" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
          <SkeletonLoader variant="list" count={4} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6 sm:py-8">
      <motion.div
        className="flex flex-col gap-5 sm:gap-7"
        variants={shouldReduce ? {} : pageEnter}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting hero */}
        <motion.div variants={shouldReduce ? {} : cardEnter}>
          <GreetingSection name={user?.name ?? "Friend"} streak={streak} />
        </motion.div>

        {/* Score + Dosha + Routine */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={shouldReduce ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <ArogyaScoreCard score={score} />
          </motion.div>
          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <DoshaBalanceCard balance={balance} primaryDosha={user?.primaryDosha} />
          </motion.div>
          <motion.div variants={shouldReduce ? {} : cardEnter} className="md:col-span-2 lg:col-span-1">
            <RoutineProgressCard />
          </motion.div>
        </motion.div>

        {/* Quick actions */}
        <motion.section
          variants={shouldReduce ? {} : scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <QuickActionsGrid />
        </motion.section>

        {/* AI Vaidya banner */}
        <motion.section
          variants={shouldReduce ? {} : scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <AIVaidyaBanner />
        </motion.section>

        {/* Wisdom + Herbal tips */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          variants={shouldReduce ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <WisdomCard />
          </motion.div>
          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <HerbalTipsCard />
          </motion.div>
        </motion.div>

        {/* Recent activity */}
        <motion.section
          variants={shouldReduce ? {} : scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <RecentActivityFeed activity={activity} />
        </motion.section>

        {/* Prakriti CTA */}
        {!user?.prakritiCompleted && (
          <motion.div
            variants={shouldReduce ? {} : scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <PrakritiCTA />
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
