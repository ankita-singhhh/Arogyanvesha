"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import { useAuthStore, usePrakritiStore } from "@/stores";
import { useReducedMotion } from "@/hooks";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Dosha } from "@/types";

const DOSHA_COLORS: Record<Dosha, { color: string; bg: string; border: string }> = {
  vata:  { color: "var(--color-dosha-vata)",  bg: "var(--color-dosha-vata-bg)",  border: "var(--color-dosha-vata)"  },
  pitta: { color: "var(--color-dosha-pitta)", bg: "var(--color-dosha-pitta-bg)", border: "var(--color-dosha-pitta)" },
  kapha: { color: "var(--color-dosha-kapha)", bg: "var(--color-dosha-kapha-bg)", border: "var(--color-dosha-kapha)" },
};

const STATS = [
  { label: "Yoga Sessions",    value: "24",    icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048" },
  { label: "AI Chats",         value: "18",    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12" },
  { label: "Articles Read",    value: "31",    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25" },
  { label: "Streak",           value: "7d",    icon: "M15.362 5.214A8.252 8.252 0 0112 21" },
];

const ACHIEVEMENTS = [
  { title: "Prakriti Pioneer",    desc: "Completed first assessment",       earned: true  },
  { title: "Consistent Yogi",     desc: "10 yoga sessions completed",       earned: true  },
  { title: "Herb Scholar",        desc: "Read 10 herb profiles",            earned: false },
  { title: "Streak Master",       desc: "30-day practice streak",           earned: false },
  { title: "Wisdom Seeker",       desc: "Read 20 wisdom articles",          earned: false },
  { title: "Dosha Devotee",       desc: "All Dosha sessions completed",     earned: false },
];

export default function ProfilePage() {
  const shouldReduce = useReducedMotion();
  const { user } = useAuthStore();
  const { result: prakriti } = usePrakritiStore();
  

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <PageContainer className="py-8 max-w-4xl mx-auto">
      <motion.div className="flex flex-col gap-8" variants={stagger} initial="hidden" animate="visible">

        {/* Profile hero card */}
        <motion.div variants={fadeUp}
          className="relative rounded-2xl overflow-hidden border border-border-default shadow-sm">

          {/* Cover gradient */}
          <div className="h-32  from-brand-burgundy via-brand-burgundy-light to-brand-gold/40"/>

          {/* Logo watermark in cover */}
          <div className="absolute top-4 right-6 w-16 h-16 opacity-20">
            <Image src="/images/logo/logo.jpeg" alt="" fill className="object-contain" sizes="64px"/>
          </div>

          <div className="px-6 pb-6 bg-surface-card">
            {/* Avatar + edit */}
            <div className="flex items-end justify-between -mt-10 mb-5">
              <div className="relative">
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name ?? "User"}
                  size="2xl"
                  dosha={prakriti?.primaryDosha}
                  className="border-4 border-surface-card shadow-lg"
                  priority
                />
                {prakriti?.primaryDosha && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-surface-card flex items-center justify-center"
                    style={{ background: DOSHA_COLORS[prakriti.primaryDosha].color }}>
                    <span className="text-micro font-bold text-text-inverted capitalize">
                      {prakriti.primaryDosha[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <Link href="/settings/account">
                <Button variant="secondary" size="sm">Edit profile</Button>
              </Link>
            </div>

            {/* Name + info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-h2 font-display font-bold text-text-heading mb-1">
                  {user?.name ?? "Your Name"}
                </h1>
                <p className="text-body-sm text-text-muted mb-3">{user?.email}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold" size="md">
                    {user?.plan === "pro" ? "Pro Member" : user?.plan === "elite" ? "Elite Member" : "Free Plan"}
                  </Badge>
                  {prakriti && (
                    <Badge
                      variant={prakriti.primaryDosha as "vata" | "pitta" | "kapha"}
                      size="md"
                      className="capitalize"
                    >
                      {prakriti.primaryDosha} — {prakriti.secondaryDosha}
                    </Badge>
                  )}
                  <Badge variant="default" size="md">
                    Member since {formatDate(user?.createdAt ?? new Date().toISOString(), { month: "long", year: "numeric" })}
                  </Badge>
                </div>
              </div>

              {/* Arogya score mini */}
              <ProgressRing
                value={72}
                variant="arogya"
                size={80}
                strokeWidth={7}
                sublabel="Arogya"
                animate={!shouldReduce}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label}
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-card border border-border-default shadow-xs text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring" }}>
              <svg className="w-5 h-5 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}/>
              </svg>
              <p className="text-h3 font-bold text-text-heading">{stat.value}</p>
              <p className="text-label text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Prakriti summary */}
        {prakriti ? (
          <motion.div variants={fadeUp}
            className="p-6 rounded-2xl border"
            style={{
              background: `linear-gradient(135deg, ${DOSHA_COLORS[prakriti.primaryDosha].bg} 0%, var(--color-surface-card) 100%)`,
              borderColor: DOSHA_COLORS[prakriti.primaryDosha].border + "33",
            }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-label font-semibold uppercase tracking-wider mb-1"
                  style={{ color: DOSHA_COLORS[prakriti.primaryDosha].color }}>
                  Your Prakriti Constitution
                </p>
                <h2 className="text-h2 font-display font-bold text-text-heading capitalize">
                  {prakriti.primaryDosha} — {prakriti.secondaryDosha}
                </h2>
              </div>
              <Link href="/prakriti/result">
                <Button variant="ghost" size="sm">View full result</Button>
              </Link>
            </div>

            <div className="flex gap-6">
              {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <ProgressRing
                    value={prakriti.balance[d]}
                    dosha={d}
                    variant="dosha"
                    size={64}
                    strokeWidth={6}
                    animate={!shouldReduce}
                  />
                  <span className="text-label font-semibold text-text-muted capitalize">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl bg-bg-subtle border border-dashed border-border-strong">
            <div className="flex-1">
              <h3 className="text-h4 font-semibold text-text-heading mb-1">Discover your Prakriti</h3>
              <p className="text-body-sm text-text-muted">Take the 20-question assessment to unlock your personalised wellness profile.</p>
            </div>
            <Link href="/prakriti/quiz">
              <Button variant="primary" size="sm">Take assessment</Button>
            </Link>
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div variants={fadeUp}>
          <h3 className="text-h3 font-display font-bold text-text-heading mb-5">Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div key={a.title}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all",
                  a.earned
                    ? "bg-brand-gold-pale border-brand-gold/25 hover:shadow-md hover:-translate-y-0.5"
                    : "bg-surface-card border-border-default opacity-45",
                )}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: a.earned ? 1 : 0.45, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  a.earned ? "bg-brand-gold/20" : "bg-bg-subtle",
                )}>
                  <svg className={cn("w-5 h-5", a.earned ? "text-brand-gold" : "text-text-disabled")}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-text-heading truncate">{a.title}</p>
                  <p className="text-label text-text-muted truncate">{a.desc}</p>
                </div>
                {a.earned && (
                  <svg className="w-4 h-4 text-brand-gold shrink-0 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div variants={fadeUp}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Account Settings", href: "/settings/account",       icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
            { label: "Subscription",     href: "/settings/subscription",  icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" },
            { label: "Notifications",    href: "/settings/notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
            { label: "Privacy",          href: "/settings/privacy",       icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-card border border-border-default text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <svg className="w-5 h-5 text-text-muted group-hover:text-brand-burgundy transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
              </svg>
              <span className="text-label font-medium text-text-muted group-hover:text-text-heading transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}