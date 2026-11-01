"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { Accordion } from "@/components/ui/Accordion";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────
   BOTANICAL SVG DECORATIONS
───────────────────────────────────────────────────────── */

function LeafLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M100 280 C100 280 20 200 10 120 C0 40 60 10 100 10 C140 10 160 60 150 120 C140 180 100 280 100 280Z" fill="var(--color-sage)" opacity="0.15"/>
      <path d="M100 280 C100 280 100 150 100 10" stroke="var(--color-sage)" strokeWidth="1.5" opacity="0.3"/>
      <path d="M100 120 C80 100 40 90 20 80" stroke="var(--color-sage)" strokeWidth="1" opacity="0.25"/>
      <path d="M100 160 C120 140 150 130 170 120" stroke="var(--color-sage)" strokeWidth="1" opacity="0.25"/>
      <path d="M100 200 C75 185 45 175 25 165" stroke="var(--color-sage)" strokeWidth="1" opacity="0.2"/>
    </svg>
  );
}

function LeafRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M100 280 C100 280 180 200 190 120 C200 40 140 10 100 10 C60 10 40 60 50 120 C60 180 100 280 100 280Z" fill="var(--color-sage)" opacity="0.15"/>
      <path d="M100 280 C100 280 100 150 100 10" stroke="var(--color-sage)" strokeWidth="1.5" opacity="0.3"/>
      <path d="M100 120 C120 100 160 90 180 80" stroke="var(--color-sage)" strokeWidth="1" opacity="0.25"/>
      <path d="M100 160 C80 140 50 130 30 120" stroke="var(--color-sage)" strokeWidth="1" opacity="0.25"/>
    </svg>
  );
}

function FloralAccent({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="8" fill="var(--color-brand-gold)" opacity="0.6"/>
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 60 + 12 * Math.cos(rad);
        const y1 = 60 + 12 * Math.sin(rad);
        const x2 = 60 + 32 * Math.cos(rad);
        const y2 = 60 + 32 * Math.sin(rad);
        const cpx = 60 + 22 * Math.cos(rad + 0.4);
        const cpy = 60 + 22 * Math.sin(rad + 0.4);
        return (
          <path key={i} d={`M${x1} ${y1} Q${cpx} ${cpy} ${x2} ${y2}`}
            stroke="var(--color-brand-gold)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   PREMIUM NAVBAR
───────────────────────────────────────────────────────── */
function NavLink({
  item,
  active,
  onClick,
}: {
  item: { label: string; href: string };
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const lit = active || hovered;
  return (
    <motion.a
      href={item.href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center px-3.5 py-2"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      aria-current={active ? "page" : undefined}
    >
      <motion.span
        className="text-[13px] font-medium leading-none"
        style={{ fontFamily: "var(--font-body)" }}
        animate={{ color: lit ? "var(--color-brand-burgundy)" : "var(--color-text-muted)" }}
        transition={{ duration: 0.2 }}
      >
        {item.label}
      </motion.span>
      <AnimatePresence>
        {lit && (
          <motion.span
            key="line"
            className="absolute bottom-[3px] h-[1.5px] rounded-full"
            style={{ background: "var(--color-brand-gold)" }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "60%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.a>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round"
      className="w-5 h-5" aria-hidden="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.g key="x"
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </motion.g>
        ) : (
          <motion.g key="bars"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <line x1="4" y1="7"  x2="20" y2="7"  />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function Navbar() {
  const prefersReduced = useReducedMotion();
  const [activeHref, setActiveHref] = React.useState("#");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 80], [0.72, 0.94]);
  const blurPx    = useTransform(scrollY, [0, 80], [16, 28]);
  const shadowOp  = useTransform(scrollY, [0, 80], [0.06, 0.18]);
  const padY      = useTransform(scrollY, [0, 80], [16, 8]);
  const barScale  = useTransform(scrollY, [0, 80], [1, 0.985]);

  const NAV = [
    { label: "Home",           href: "#"         },
    { label: "About",          href: "#about"    },
    { label: "Features",       href: "#features" },
    { label: "Ancient Wisdom", href: "#wisdom"   },
    { label: "Pricing",        href: "#pricing"  },
    { label: "Contact",        href: "#contact"  },
  ];

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.div
        className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
        style={{ paddingTop: padY }}
        initial={prefersReduced ? false : { y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="pointer-events-auto w-full"
          style={{
            maxWidth: "1320px",
            marginInline: "clamp(12px, 3vw, 32px)",
            scale: barScale,
          }}
        >
          <motion.div
            className="relative flex items-center justify-between px-4 sm:px-5 lg:px-7 rounded-[var(--radius-pill)] border border-white/55 overflow-hidden"
            style={{
              height: "64px",
              backgroundColor: `rgba(250,247,242,${bgOpacity.get()})`,
              backdropFilter: `blur(${blurPx.get()}px)`,
              WebkitBackdropFilter: `blur(${blurPx.get()}px)`,
              boxShadow: `0 4px 32px rgba(104,35,50,${shadowOp.get()}), 0 1px 0 rgba(255,255,255,0.65) inset`,
            }}
          >
            <div
              className="absolute inset-0 rounded-[var(--radius-pill)] pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)" }}
            />

            <Link href="/" className="relative z-10 flex items-center gap-3 group flex-shrink-0" aria-label="Arogyanvesha home">
              <motion.div
                className="relative w-9 h-9 flex-shrink-0"
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.div
                  className="absolute -inset-[2px] rounded-full"
                  style={{ background: "conic-gradient(from 0deg, var(--color-brand-gold), var(--color-brand-gold-light), var(--color-brand-gold))", opacity: 0.55 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                />
                <div className="absolute inset-[2px] rounded-full overflow-hidden">
                  <Image src="/images/logo/logo.jpeg" alt="Arogyanvesha" fill sizes="36px" className="object-cover" priority />
                </div>
              </motion.div>
              <div className="flex flex-col leading-none select-none">
                <motion.span
                  className="text-[14px] font-bold tracking-[0.1em] leading-none"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-brand-burgundy)" }}
                  whileHover={{ color: "var(--color-brand-burgundy-light)" }}
                  transition={{ duration: 0.2 }}
                >
                  AROGYANVESHA
                </motion.span>
                <span className="text-[9.5px] tracking-[0.05em] mt-[3px] leading-none" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                  Where AI Meets Ayurvedic Healing
                </span>
              </div>
            </Link>

            <nav className="relative z-10 hidden lg:flex items-center gap-0.5" aria-label="Primary navigation">
              {NAV.map((item) => (
                <NavLink key={item.href} item={item} active={activeHref === item.href} onClick={() => setActiveHref(item.href)} />
              ))}
            </nav>

            <div className="relative z-10 hidden lg:flex items-center gap-2.5 flex-shrink-0">
              <Link href="/login">
                <motion.button
                  className="h-10 px-5 rounded-[var(--radius-pill)] text-[13px] font-medium border"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-body)", borderColor: "var(--color-border-default)", background: "transparent" }}
                  whileHover={{ backgroundColor: "var(--color-bg-canvas)", borderColor: "var(--color-brand-gold)", color: "var(--color-text-heading)", y: -1, boxShadow: "var(--shadow-xs)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Log In
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  className="h-10 px-6 rounded-[var(--radius-pill)] text-[13px] font-semibold text-white relative overflow-hidden"
                  style={{ fontFamily: "var(--font-body)", background: "linear-gradient(135deg, var(--color-brand-burgundy) 0%, var(--color-brand-burgundy-deep) 100%)", boxShadow: "var(--shadow-burgundy)" }}
                  whileHover={{ y: -2, scale: 1.03, boxShadow: "0 6px 28px rgba(104,35,50,0.45), 0 0 0 2px rgba(212,175,55,0.4)" }}
                  whileTap={{ scale: 0.97, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-[var(--radius-pill)]"
                    style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)", backgroundSize: "200% 100%", backgroundPosition: "-100% 0" }}
                    whileHover={{ backgroundPosition: "200% 0" }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10">Sign Up</span>
                </motion.button>
              </Link>
            </div>

            <motion.button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="relative z-10 lg:hidden w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)]"
              style={{ color: "var(--color-text-body)" }}
              whileHover={{ backgroundColor: "var(--color-bg-subtle)" }}
              whileTap={{ scale: 0.92 }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <HamburgerIcon open={mobileOpen} />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(45,36,24,0.4)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed inset-x-3 top-3 z-50 lg:hidden overflow-hidden"
              style={{
                borderRadius: "var(--radius-2xl)",
                background: "rgba(250,247,242,0.97)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "var(--shadow-xl)",
              }}
              initial={{ opacity: 0, scale: 0.93, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-border-default)" }}>
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden" style={{ boxShadow: "0 0 0 2px var(--color-brand-gold)" }}>
                    <Image src="/images/logo/logo.jpeg" alt="Arogyanvesha" fill sizes="32px" className="object-cover" />
                  </div>
                  <span className="text-[13px] font-bold tracking-[0.08em]" style={{ fontFamily: "var(--font-display)", color: "var(--color-brand-burgundy)" }}>
                    AROGYANVESHA
                  </span>
                </Link>
                <motion.button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>
              <nav className="px-3 py-3">
                {NAV.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => { setActiveHref(item.href); setMobileOpen(false); }}
                    className="flex items-center justify-between w-full px-4 py-3.5 group"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      fontFamily: "var(--font-body)",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: activeHref === item.href ? "var(--color-brand-burgundy)" : "var(--color-text-body)",
                      background: activeHref === item.href ? "var(--color-bg-subtle)" : "transparent",
                    }}
                    initial={prefersReduced ? false : { opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ backgroundColor: "var(--color-bg-subtle)", color: "var(--color-brand-burgundy)", x: 3 }}
                  >
                    {item.label}
                    <svg className="w-4 h-4 opacity-30" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.a>
                ))}
              </nav>
              <motion.div
                className="px-4 pb-5 pt-2 flex flex-col gap-2.5 border-t"
                style={{ borderColor: "var(--color-border-default)" }}
                initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV.length * 0.045 + 0.05, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    className="w-full h-12 text-[14px] font-medium border"
                    style={{ borderRadius: "var(--radius-pill)", fontFamily: "var(--font-body)", color: "var(--color-text-body)", borderColor: "var(--color-border-default)", background: "var(--color-surface-card)" }}
                    whileHover={{ borderColor: "var(--color-brand-gold)", color: "var(--color-text-heading)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Log In
                  </motion.button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    className="w-full h-12 text-[14px] font-semibold text-white relative overflow-hidden"
                    style={{ borderRadius: "var(--radius-pill)", fontFamily: "var(--font-body)", background: "linear-gradient(135deg, var(--color-brand-burgundy) 0%, var(--color-brand-burgundy-deep) 100%)", boxShadow: "var(--shadow-burgundy)" }}
                    whileHover={{ y: -1, boxShadow: "0 6px 28px rgba(104,35,50,0.45), 0 0 0 2px rgba(212,175,55,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign Up — It&apos;s Free
                  </motion.button>
                </Link>
                <p className="text-center text-[10px] tracking-[0.1em] mt-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                  आरोग्यं परमं भाग्यम्
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────── */

function HeroSection({ shouldReduce }: { shouldReduce: boolean }) {
  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0, 500], [0, -40]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.75]);
  const girlY       = useTransform(scrollY, [0, 500], [0, -20]);
  const glowScale   = useTransform(scrollY, [0, 400], [1, 1.05]);

  const PILLS = [
    { label: "Prakriti Analysis", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z", pos: "absolute -left-[60px] top-[18%]", delay: 0.55, float: "float" },
    { label: "AI Health Assistant", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", pos: "absolute -right-[60px] top-[18%]", delay: 0.65, float: "float-delayed" },
    { label: "Diet & Yoga", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z", pos: "absolute -left-[60px] bottom-[22%]", delay: 0.75, float: "float" },
    { label: "Herbs & Remedies", icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18", pos: "absolute -right-[60px] bottom-[22%]", delay: 0.85, float: "float-delayed" },
  ];

  const BADGES = [
    { icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18", label: "Ayurveda Rooted" },
    { icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", label: "AI Powered" },
    { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Doctor Verified" },
    { icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z", label: "Privacy First" },
  ];

  return (
    <section className="relative overflow-hidden pt-[68px]" style={{ minHeight: "100svh" }}>
      <div className="absolute inset-0 z-0">
        <Image src="/images/backgrounds/cream-texture.png" alt="" fill sizes="100vw" className="object-cover" priority aria-hidden="true" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 62% 45%, rgba(212,175,55,0.08) 0%, rgba(104,35,50,0.04) 55%, transparent 100%)" }} />
      </div>

      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 z-[1] pointer-events-none w-[480px] h-[480px] opacity-[0.018]">
        <Image src="/images/illustrations/lotus-watermark.png" alt="" fill sizes="480px" className="object-contain" aria-hidden="true" priority/>
      </div>

      <motion.div className="absolute top-14 left-0 w-28 h-52 z-[2] pointer-events-none"
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <Image src="/images/illustrations/leaf-left.png" alt="" fill sizes="180px" className="object-contain object-left-top" aria-hidden="true" />
      </motion.div>

      <motion.div className="absolute top-16 right-0 w-24 h-44 z-[2] pointer-events-none"
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <Image src="/images/illustrations/leaf-right.png" alt="" fill sizes="160px" className="object-contain object-right-top" aria-hidden="true" />
      </motion.div>

      <motion.div className="absolute inset-0 z-[3] pointer-events-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.9 }}>
        <Image src="/images/illustrations/sparkles.png" alt="" fill priority
          className="object-cover"
          style={{ opacity: 0.35, maskImage: "linear-gradient(to right, transparent 0%, transparent 38%, black 55%, black 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, transparent 38%, black 55%, black 100%)" }}
          aria-hidden="true" />
      </motion.div>

      <div className="absolute top-[30%] left-[20%] w-72 h-72 rounded-full pointer-events-none z-[4]"
        style={{ background: "var(--color-brand-gold)", opacity: 0.04, filter: "blur(72px)" }} />
      <div className="absolute bottom-[20%] right-[30%] w-56 h-56 rounded-full pointer-events-none z-[4]"
        style={{ background: "var(--color-brand-burgundy)", opacity: 0.04, filter: "blur(72px)" }} />

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-8 h-full">
        <div
          className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4"
          style={{ minHeight: "calc(100svh - 68px)", paddingTop: "48px", paddingBottom: "48px" }}
        >
          {/* LEFT — copy */}
          <motion.div
            className="lg:w-[44%] w-full text-center lg:text-left flex flex-col justify-center"
            style={{ y: shouldReduce ? 0 : heroY, opacity: shouldReduce ? 1 : heroOpacity }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-5 px-4 py-2 self-center lg:self-start"
              style={{ borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(212,175,55,0.35)", boxShadow: "var(--shadow-xs)", backdropFilter: "blur(8px)" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="w-2 h-2 rounded-full pulse-glow flex-shrink-0" style={{ background: "var(--color-brand-gold)" }} />
              <span style={{ fontSize: "13px", fontFamily: "var(--font-body)", color: "var(--color-text-body)", fontWeight: 500 }}>
                AI-Powered Ayurvedic Wellness
              </span>
            </motion.div>

            <motion.h1
              style={{ fontFamily: "var(--font-display)", marginBottom: "20px", lineHeight: 1.1, letterSpacing: "-0.01em" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
            >
              <span className="block" style={{ fontSize: "clamp(2.4rem,3.6vw,3.75rem)", color: "var(--color-text-heading)" }}>
                Ancient Wisdom.
              </span>
              <span className="block" style={{ fontSize: "clamp(2.4rem,3.6vw,3.75rem)", color: "var(--color-brand-burgundy)" }}>
                AI Intelligence.
              </span>
              <span className="block italic text-gradient-gold" style={{ fontSize: "clamp(2rem,3vw,3.1rem)" }}>
                Personalized for You.
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto lg:mx-0"
              style={{ fontSize: "var(--text-body-lg)", lineHeight: "var(--leading-relaxed)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", maxWidth: "420px", marginBottom: "28px" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.36 }}
            >
              Discover your Prakriti, balance your Doshas, and embark on a holistic
              wellness journey powered by Ayurveda and AI.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              style={{ marginBottom: "28px" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.46 }}
            >
              <Link href="/signup">
                <motion.button
                  className="inline-flex items-center gap-2.5 font-semibold relative overflow-hidden flex-shrink-0"
                  style={{ height: "54px", paddingInline: "32px", borderRadius: "var(--radius-xl)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-inverted)", background: "linear-gradient(135deg, var(--color-brand-burgundy) 0%, var(--color-brand-burgundy-deep) 100%)", boxShadow: "var(--shadow-burgundy)" }}
                  whileHover={{ y: -3, boxShadow: "0 10px 36px rgba(104,35,50,0.45), 0 0 0 2px rgba(212,175,55,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.span
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)", backgroundSize: "200% 100%", backgroundPosition: "-100% 0", borderRadius: "var(--radius-xl)" }}
                    whileHover={{ backgroundPosition: "200% 0" }}
                    transition={{ duration: 0.5 }}
                  />
                  <svg className="w-[18px] h-[18px] relative z-10 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/>
                  </svg>
                  <span className="relative z-10">Discover Your Prakriti</span>
                </motion.button>
              </Link>

              <a href="#features">
                <motion.button
                  className="inline-flex items-center gap-2 font-semibold flex-shrink-0"
                  style={{ height: "54px", paddingInline: "28px", borderRadius: "var(--radius-xl)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-heading)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-sm)" }}
                  whileHover={{ y: -2, background: "rgba(255,255,255,0.92)", borderColor: "var(--color-brand-burgundy)", boxShadow: "var(--shadow-md)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Explore Features
                  <motion.svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                  </motion.svg>
                </motion.button>
              </a>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center gap-x-5 gap-y-2.5 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.62 }}
            >
              {BADGES.map((badge, i) => (
                <motion.div key={badge.label} className="flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.68 + i * 0.07, duration: 0.35 }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-brand-gold)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon}/>
                  </svg>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontWeight: 500 }}>{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — arch composition (desktop/tablet only) */}
          <motion.div
            className="lg:w-[56%] w-full relative items-center justify-center hidden lg:flex"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.95, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative" style={{ width: "min(420px, 90vw)" }}>
              <motion.div
                className="absolute pointer-events-none"
                style={{ inset: "-32px", zIndex: 0, scale: glowScale, opacity: 0.9 }}
              >
                <Image src="/images/hero/glow.png" alt="" fill sizes="640px" className="object-contain" priority loading="eager" aria-hidden="true" />
              </motion.div>

              <div className="relative w-full aspect-[3/4]" style={{ zIndex: 10 }}>
                <Image src="/images/hero/golden-arch.png" alt="" fill sizes="600px" className="object-contain" priority aria-hidden="true" />

                <div className="absolute left-1/2 top-[5%] -translate-x-1/2" style={{ zIndex: 15 }}>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-[4px] border-[#D4AF37] bg-[#6B1E2D] shadow-2xl flex items-center justify-center">
                    <Image src="/images/logo/logo.jpeg" alt="Arogyanvesha Logo" fill sizes="96px" className="object-cover" priority />
                  </div>
                </div>

                <motion.div
                  className="absolute inset-0 flex items-end justify-center pb-32"
                  style={{ zIndex: 11, y: shouldReduce ? 0 : girlY, transform: "translateY(-100px)" }}
                  animate={shouldReduce ? {} : { y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div style={{ width: "55%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)", filter: "blur(20px)" }} />
                  </div>
                  <div className="relative" style={{ width: "72%", height: "88%", zIndex: 12 }}>
                    <Image src="/images/hero/meditating-girl.png" alt="Meditating woman representing Ayurvedic wellness" fill sizes="(max-width: 768px) 80vw, 500px" className="object-contain object-bottom" priority />
                  </div>
                </motion.div>

                {PILLS.map((pill) => (
                  <motion.div
                    key={pill.label}
                    className={pill.pos}
                    style={{ zIndex: 20 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: pill.delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className={cn("flex flex-col items-center gap-2.5 text-center", pill.float)}
                      style={{ width: "104px", padding: "14px 12px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "var(--shadow-card)" }}
                      whileHover={{ y: -5, boxShadow: "var(--shadow-card-hover)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg style={{ width: "18px", height: "18px", color: "var(--color-brand-gold)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={pill.icon} />
                        </svg>
                      </div>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--color-text-heading)", fontWeight: 600, lineHeight: 1.3 }}>
                        {pill.label}
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────────────────── */

function StatsBar({ shouldReduce }: { shouldReduce: boolean }) {
  const stats = [
    { value: "50,000+", label: "Active Users"      },
    { value: "5,000+",  label: "Ayurvedic Texts"   },
    { value: "200+",    label: "Herbs Catalogued"   },
    { value: "4.9★",    label: "App Rating"         },
    { value: "98%",     label: "Satisfaction Rate"  },
  ];

  return (
    <section className="relative py-0 overflow-hidden" style={{ background: "var(--color-bg-canvas)" }}>
      {/* Top rule */}
      <div className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)" }} />

      <div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-10">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x divide-[rgba(212,175,55,0.15)]"
          variants={shouldReduce ? {} : { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center gap-1 text-center lg:px-8"
              variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            >
              <span
                className="font-bold leading-none"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)", color: "var(--color-brand-burgundy)" }}
              >
                {stat.value}
              </span>
              <span
                className="font-medium"
                style={{ fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)" }} />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FEATURES SECTION
───────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    title: "Prakriti Analysis",
    description: "Discover your unique Ayurvedic constitution through our clinician-validated 20-question assessment. Understand your Vata, Pitta, and Kapha balance.",
    gradientFrom: "rgba(168,148,215,0.12)",
    gradientTo: "rgba(168,148,215,0.04)",
    iconBg: "rgba(168,148,215,0.15)",
    iconColor: "var(--color-dosha-vata, #8064a2)",
    borderColor: "rgba(168,148,215,0.2)",
    tag: "Core Feature",
  },
  {
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    title: "AI Health Assistant",
    description: "Our AI Vaidya analyses 5,000+ Ayurvedic texts to give you personalised, evidence-backed health recommendations tailored to your unique constitution.",
    gradientFrom: "rgba(104,35,50,0.08)",
    gradientTo: "rgba(104,35,50,0.02)",
    iconBg: "rgba(104,35,50,0.1)",
    iconColor: "var(--color-brand-burgundy)",
    borderColor: "rgba(104,35,50,0.12)",
    tag: "AI Powered",
  },
  {
    icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    title: "Personalised Yoga",
    description: "Expert yoga sequences and meditation practices curated specifically for your Dosha type, health goals, and current season.",
    gradientFrom: "rgba(126,154,131,0.12)",
    gradientTo: "rgba(126,154,131,0.04)",
    iconBg: "rgba(126,154,131,0.15)",
    iconColor: "var(--color-sage, #5a7a5e)",
    borderColor: "rgba(126,154,131,0.2)",
    tag: "Video Library",
  },
  {
    icon: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z",
    title: "Skin Analysis",
    description: "AI-powered skin assessment identifies your skin type and imbalances, recommending Ayurvedic treatments, herbs, and lifestyle changes.",
    gradientFrom: "rgba(56,116,172,0.08)",
    gradientTo: "rgba(56,116,172,0.02)",
    iconBg: "rgba(56,116,172,0.1)",
    iconColor: "var(--color-status-info, #3874ac)",
    borderColor: "rgba(56,116,172,0.12)",
    tag: "AI Vision",
  },
  {
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    title: "Ancient Wisdom Vault",
    description: "Explore curated articles, seasonal guides, and classical texts from Charaka Samhita and Ashtanga Hridayam, translated for modern readers.",
    gradientFrom: "rgba(212,175,55,0.1)",
    gradientTo: "rgba(212,175,55,0.03)",
    iconBg: "rgba(212,175,55,0.12)",
    iconColor: "var(--color-brand-gold)",
    borderColor: "rgba(212,175,55,0.18)",
    tag: "500+ Articles",
  },
  {
    icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
    title: "Herb Encyclopedia",
    description: "200+ Ayurvedic herbs with detailed profiles, preparation methods, Dosha effects, contraindications, and AI-powered herb pairing recommendations.",
    gradientFrom: "rgba(76,153,100,0.1)",
    gradientTo: "rgba(76,153,100,0.03)",
    iconBg: "rgba(76,153,100,0.12)",
    iconColor: "var(--color-dosha-kapha, #3d7a52)",
    borderColor: "rgba(76,153,100,0.18)",
    tag: "200+ Herbs",
  },
] as const;

function FeaturesSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section id="features" className="relative overflow-hidden" style={{ background: "var(--color-bg-base)", paddingTop: "96px", paddingBottom: "96px" }}>
      <LeafLeft className="absolute left-0 top-1/4 w-32 h-48 opacity-20 pointer-events-none" />
      <LeafRight className="absolute right-0 bottom-1/4 w-32 h-48 opacity-20 pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
        >
          <div
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5"
            style={{ borderRadius: "var(--radius-pill)", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}
          >
            <FloralAccent className="w-4 h-4" />
            <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-brand-gold)", fontFamily: "var(--font-body)" }}>
              Everything You Need
            </span>
          </div>
          <h2
            className="font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--color-text-heading)", marginBottom: "16px", lineHeight: 1.15 }}
          >
            Your Complete Wellness Toolkit
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-muted)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7, fontFamily: "var(--font-body)" }}>
            Six powerful modules working in harmony — like the six tastes of Ayurveda —
            to transform every dimension of your wellbeing.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative flex flex-col gap-5 p-7 rounded-2xl overflow-hidden cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${f.gradientFrom} 0%, ${f.gradientTo} 100%)`,
                border: `1px solid ${f.borderColor}`,
                backdropFilter: "blur(4px)",
              }}
              variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07 } } }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(104,35,50,0.1), 0 4px 20px rgba(0,0,0,0.06)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Decorative orb */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none opacity-[0.06]"
                style={{ background: f.iconColor, filter: "blur(24px)" }} />

              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: f.iconBg }}
                >
                  <svg style={{ width: "26px", height: "26px", color: f.iconColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <span
                  className="flex-shrink-0 font-semibold"
                  style={{ fontSize: "11px", letterSpacing: "0.04em", color: "var(--color-text-muted)", padding: "4px 10px", borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", fontFamily: "var(--font-body)" }}
                >
                  {f.tag}
                </span>
              </div>

              <div className="flex-1">
                <h3
                  className="font-semibold mb-3"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--color-text-heading)", lineHeight: 1.3 }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.7, fontFamily: "var(--font-body)" }}>
                  {f.description}
                </p>
              </div>

              <Link href="/signup" className="mt-auto">
                <span
                  className="inline-flex items-center gap-1.5 font-semibold transition-all duration-200 group-hover:gap-2.5"
                  style={{ fontSize: "13px", color: f.iconColor, fontFamily: "var(--font-body)" }}
                >
                  Explore feature
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   ANCIENT WISDOM SECTION
───────────────────────────────────────────────────────── */

function WisdomSection({ shouldReduce }: { shouldReduce: boolean }) {
  const wisdomCards = [
    {
      icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25",
      title: "Doshas",
      subtitle: "Understand Vata, Pitta & Kapha balance",
      iconBg: "rgba(168,148,215,0.14)",
      iconColor: "var(--color-dosha-vata, #8064a2)",
    },
    {
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5",
      title: "Dinacharya",
      subtitle: "Daily rituals for a balanced life",
      iconBg: "rgba(212,175,55,0.12)",
      iconColor: "var(--color-brand-gold)",
    },
    {
      icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25",
      title: "Ritucharya",
      subtitle: "Seasonal guidance for every quarter",
      iconBg: "rgba(126,154,131,0.14)",
      iconColor: "var(--color-sage, #5a7a5e)",
    },
  ];

  return (
    <section
      id="wisdom"
      className="relative overflow-hidden"
      style={{
        background: "var(--color-bg-canvas)",
        paddingTop: "96px",
        paddingBottom: "96px",
      }}
    >
      {/* Subtle background blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <circle cx="650" cy="120" r="300" fill="var(--color-brand-gold)" />
          <circle cx="100" cy="480" r="200" fill="var(--color-brand-burgundy)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* ── LEFT — text + wisdom cards ── */}
          <motion.div
            className="flex-1 min-w-0"
            variants={
              shouldReduce
                ? {}
                : {
                    hidden: { opacity: 0, x: -36 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                  }
            }
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5"
              style={{
                borderRadius: "var(--radius-pill)",
                background: "rgba(104,35,50,0.06)",
                border: "1px solid rgba(104,35,50,0.12)",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--color-brand-burgundy)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Ancient Wisdom
              </span>
            </div>

            {/* Heading */}
            <h2
              className="font-bold"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 3vw, 2.75rem)",
                color: "var(--color-text-heading)",
                lineHeight: 1.15,
                marginBottom: "20px",
              }}
            >
              5,000 Years of Healing.
              <br />
              <span style={{ color: "var(--color-brand-burgundy)" }}>Now in Your Pocket.</span>
            </h2>

            {/* Body */}
            <p
              style={{
                fontSize: "var(--text-body-lg)",
                color: "var(--color-text-muted)",
                lineHeight: 1.75,
                marginBottom: "36px",
                fontFamily: "var(--font-body)",
                maxWidth: "440px",
              }}
            >
              Explore timeless Ayurvedic knowledge curated for today&apos;s lifestyle.
              Learn, apply, and live in harmony through the three pillars of
              Ayurvedic daily practice.
            </p>

            {/* Wisdom cards */}
            <div className="flex flex-col gap-3">
              {wisdomCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    backdropFilter: "blur(8px)",
                  }}
                  whileHover={{
                    x: 4,
                    boxShadow: "0 8px 30px rgba(104,35,50,0.08)",
                    background: "rgba(255,255,255,0.95)",
                  }}
                  initial={shouldReduce ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: card.iconBg }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px", color: card.iconColor }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-semibold"
                      style={{
                        fontSize: "14px",
                        color: "var(--color-text-heading)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {card.title}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 flex-shrink-0 ml-auto opacity-30"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT — AI promo card ── */}
          <motion.div
            className="flex-1 min-w-0 w-full"
            variants={
              shouldReduce
                ? {}
                : {
                    hidden: { opacity: 0, x: 36 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                  }
            }
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(150deg, #7A2838 0%, #5C1828 30%, #3D0E1A 65%, #220810 100%)",
                boxShadow:
                  "0 40px 100px rgba(104,35,50,0.38), 0 12px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* ── Top-right gold orb ── */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "-60px",
                  right: "-60px",
                  width: "320px",
                  height: "320px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 45%, transparent 72%)",
                  filter: "blur(24px)",
                }}
              />

              {/* ── Bottom-left burgundy orb ── */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: "-40px",
                  left: "-40px",
                  width: "240px",
                  height: "240px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(180,60,80,0.2) 0%, transparent 70%)",
                  filter: "blur(32px)",
                }}
              />

              {/* ── Subtle noise texture overlay ── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat",
                  backgroundSize: "160px 160px",
                  opacity: 0.022,
                  mixBlendMode: "overlay",
                }}
              />

              {/* ── Top inner highlight line ── */}
              <div
                className="absolute top-0 inset-x-0 pointer-events-none"
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 35%, rgba(255,255,255,0.12) 50%, rgba(212,175,55,0.35) 65%, transparent 100%)",
                }}
              />

              <div className="relative p-8 lg:p-10">

                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5"
                  style={{
                    borderRadius: "var(--radius-pill)",
                    background: "rgba(212,175,55,0.10)",
                    border: "1px solid rgba(212,175,55,0.22)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "var(--color-brand-gold)",
                      boxShadow: "0 0 8px rgba(212,175,55,0.9)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "var(--color-brand-gold)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    AI Meets Ayurveda
                  </span>
                </div>

                {/* ── Brain image — blended into card ── */}
                <motion.div
                  className="relative w-full mb-6"
                  animate={shouldReduce ? {} : { y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                  style={{ minHeight: "260px" }}
                >
                  {/*
                    Layer 0 — large warm radial behind image, same hue as card,
                    erases the sense of a separate rectangle.
                  */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      inset: "-20%",
                      background:
                        "radial-gradient(ellipse 80% 70% at 50% 52%, rgba(212,175,55,0.22) 0%, rgba(180,60,70,0.12) 38%, transparent 70%)",
                      filter: "blur(28px)",
                    }}
                  />

                  {/*
                    Layer 1 — inner tight glow directly under brain,
                    simulates emitted light from the illustration.
                  */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "55%",
                      height: "55%",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(255,210,100,0.28) 0%, rgba(212,175,55,0.10) 55%, transparent 80%)",
                      filter: "blur(14px)",
                    }}
                  />

                  {/*
                    Image wrapper:
                    - mix-blend-mode: screen removes the white background
                      of the PNG and lets the brain glow look native to the card.
                    - No border-radius, no box-shadow — it should appear borderless.
                  */}
                  <div
                    className="relative mx-auto"
                    style={{
                      width: "min(320px, 90%)",
                      aspectRatio: "1 / 1",
                      mixBlendMode: "screen",
                    }}
                  >
                    <Image
                      src="/images/dashboard/ai-brain.png"
                      alt="AI brain representing the fusion of artificial intelligence and Ayurvedic wisdom"
                      fill
                      sizes="(max-width: 768px) 80vw, 320px"
                      className="object-contain"
                    />
                  </div>

                  {/*
                    Layer 2 — bottom fade-out so the brain dissolves
                    smoothly into the card instead of sitting on top of it.
                  */}
                  <div
                    className="absolute bottom-0 inset-x-0 pointer-events-none"
                    style={{
                      height: "45%",
                      background:
                        "linear-gradient(to top, #3D0E1A 0%, rgba(61,14,26,0.7) 40%, transparent 100%)",
                    }}
                  />
                </motion.div>

                {/* Heading */}
                <h3
                  className="font-bold mb-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  Intelligence Rooted in Tradition
                </h3>

                {/* Body */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(212,175,55,0.68)",
                    lineHeight: 1.75,
                    marginBottom: "28px",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Our AI analyses 5,000+ Ayurvedic texts, modern research, and your
                  unique biometric data to give recommendations that truly work for
                  your constitution.
                </p>

                {/* CTA */}
                <Link href="/signup">
                  <motion.button
                    className="inline-flex items-center gap-2 font-semibold"
                    style={{
                      height: "48px",
                      paddingInline: "24px",
                      borderRadius: "var(--radius-xl)",
                      background:
                        "linear-gradient(135deg, var(--color-brand-gold) 0%, var(--color-brand-gold-muted) 100%)",
                      color: "#2D1B0E",
                      fontSize: "14px",
                      fontFamily: "var(--font-body)",
                      boxShadow:
                        "0 4px 20px rgba(212,175,55,0.38), 0 1px 0 rgba(255,255,255,0.15) inset",
                    }}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 10px 36px rgba(212,175,55,0.52)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    Chat with AI Vaidya
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────────── */

function HowItWorksSection({ shouldReduce }: { shouldReduce: boolean }) {
  const steps = [
    {
      num: "01",
      title: "Discover Your Prakriti",
      desc: "Complete our AI-enhanced 20-question assessment to identify your unique Dosha balance and health constitution.",
      icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
      iconBg: "rgba(168,148,215,0.14)",
      iconColor: "var(--color-dosha-vata, #8064a2)",
    },
    {
      num: "02",
      title: "Get Personalised Guidance",
      desc: "Our AI Vaidya creates a tailored wellness plan — diet, yoga, herbs, and daily routines — based on your Prakriti.",
      icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
      iconBg: "rgba(212,175,55,0.12)",
      iconColor: "var(--color-brand-gold)",
    },
    {
      num: "03",
      title: "Track Your Transformation",
      desc: "Monitor your Arogya Score, log your Dinacharya routine, and watch your wellness improve week over week.",
      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
      iconBg: "rgba(126,154,131,0.14)",
      iconColor: "var(--color-sage, #5a7a5e)",
    },
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-bg-base)", paddingTop: "96px", paddingBottom: "96px" }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <h2
            className="font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--color-text-heading)", marginBottom: "12px", lineHeight: 1.15 }}
          >
            Begin in Three Steps
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            Start free in minutes. No prior knowledge of Ayurveda required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative flex flex-col gap-5 p-8 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", backdropFilter: "blur(8px)" }}
              variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.12 } } }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(104,35,50,0.08)" }}
              transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
            >
              {/* Step number */}
              <div
                className="absolute -top-4 left-8 font-bold"
                style={{ fontFamily: "var(--font-display)", fontSize: "56px", lineHeight: 1, color: "var(--color-brand-burgundy)", opacity: 0.06, userSelect: "none" }}
              >
                {step.num}
              </div>

              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-16 -right-4 w-8 h-px"
                  style={{ background: "linear-gradient(to right, rgba(212,175,55,0.3), transparent)", zIndex: 1 }}
                />
              )}

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: step.iconBg }}>
                <svg style={{ width: "28px", height: "28px", color: step.iconColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                </svg>
              </div>

              <div>
                <p
                  className="font-bold mb-2"
                  style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-brand-gold)", fontFamily: "var(--font-body)" }}
                >
                  Step {step.num}
                </p>
                <h3
                  className="font-semibold mb-3"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--color-text-heading)", lineHeight: 1.3 }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.7, fontFamily: "var(--font-body)" }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-14"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.5 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <Link href="/signup">
            <motion.button
              className="inline-flex items-center gap-2.5 font-semibold text-white relative overflow-hidden"
              style={{ height: "56px", paddingInline: "40px", borderRadius: "var(--radius-xl)", fontFamily: "var(--font-body)", fontSize: "15px", background: "linear-gradient(135deg, var(--color-brand-burgundy) 0%, var(--color-brand-burgundy-deep) 100%)", boxShadow: "0 8px 32px rgba(104,35,50,0.3)" }}
              whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(104,35,50,0.45), 0 0 0 2px rgba(212,175,55,0.35)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)", backgroundSize: "200% 100%", backgroundPosition: "-100% 0", borderRadius: "var(--radius-xl)" }}
                whileHover={{ backgroundPosition: "200% 0" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">Begin your journey — it&apos;s free</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Yoga Instructor, Mumbai",
    initials: "PS",
    dosha: "Vata-Pitta",
    avatarBg: "rgba(168,148,215,0.15)",
    avatarColor: "var(--color-dosha-vata, #8064a2)",
    quote: "Arogyanvesha completely transformed how I understand my body. The Prakriti analysis was spot-on and the daily routine tracker keeps me accountable every single day.",
    stars: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Software Engineer, Bangalore",
    initials: "RM",
    dosha: "Pitta-Kapha",
    avatarBg: "rgba(214,96,77,0.12)",
    avatarColor: "var(--color-dosha-pitta, #c9512e)",
    quote: "As a tech professional with a Pitta constitution, the stress management recommendations and Pitta-balancing yoga sessions have genuinely transformed my energy and focus.",
    stars: 5,
  },
  {
    name: "Anjali Nair",
    role: "Nutritionist, Chennai",
    initials: "AN",
    dosha: "Kapha-Vata",
    avatarBg: "rgba(76,153,100,0.12)",
    avatarColor: "var(--color-dosha-kapha, #3d7a52)",
    quote: "The herb encyclopedia is exceptional. I recommend Arogyanvesha to all my clients — the Ayurvedic knowledge base is comprehensive yet beautifully accessible.",
    stars: 5,
  },
];

function TestimonialsSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-bg-canvas)", paddingTop: "96px", paddingBottom: "96px" }}>
      <LeafRight className="absolute right-0 top-8 w-36 h-52 opacity-15 pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <h2
            className="font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--color-text-heading)", marginBottom: "12px", lineHeight: 1.15 }}
          >
            Real People, Real Transformations
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            Loved by 50,000+ wellness seekers across India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="flex flex-col gap-6 p-7 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", backdropFilter: "blur(8px)" }}
              variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: "0 16px 48px rgba(104,35,50,0.09)" }}
              transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <svg key={si} className="w-4 h-4" style={{ color: "var(--color-brand-gold)" }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>

              <p
                className="flex-1"
                style={{ fontSize: "15px", color: "var(--color-text-body)", lineHeight: 1.75, fontFamily: "var(--font-body)", fontStyle: "italic" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                  style={{ background: t.avatarBg, color: t.avatarColor, fontSize: "13px", fontFamily: "var(--font-display)" }}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold" style={{ fontSize: "14px", color: "var(--color-text-heading)", fontFamily: "var(--font-body)" }}>{t.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{t.role}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span
                    className="font-medium"
                    style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-pill)", background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
                  >
                    {t.dosha}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PRICING
───────────────────────────────────────────────────────── */

const PLANS = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    desc: "Begin your Ayurvedic journey",
    badge: null,
    popular: false,
    gold: false,
    features: ["Prakriti assessment (once)", "10 AI Vaidya messages/month", "Basic herb encyclopedia", "5 yoga sessions/month", "Daily routine tracker"],
    cta: "Get started free",
  },
  {
    name: "Pro",
    price: { monthly: 499, annual: 399 },
    desc: "For dedicated wellness seekers",
    badge: "Most Popular",
    popular: true,
    gold: false,
    features: ["Unlimited AI Vaidya chat", "Full herb encyclopedia (200+)", "Unlimited yoga sessions", "Skin analysis (10/month)", "Quarterly Prakriti reassessment", "PDF health reports", "Priority support"],
    cta: "Start Pro free trial",
  },
  {
    name: "Elite",
    price: { monthly: 999, annual: 799 },
    desc: "Complete holistic wellness suite",
    badge: "Best Value",
    popular: false,
    gold: true,
    features: ["Everything in Pro", "Unlimited skin analyses", "Custom yoga sequence builder", "Monthly practitioner session", "Family account (4 members)", "Dedicated wellness coach", "Early feature access"],
    cta: "Start Elite free trial",
  },
] as const;

function PricingSection({ shouldReduce }: { shouldReduce: boolean }) {
  const [annual, setAnnual] = React.useState(false);

  return (
    <section id="pricing" className="relative overflow-hidden" style={{ background: "var(--color-bg-base)", paddingTop: "96px", paddingBottom: "96px" }}>
      <LeafLeft className="absolute left-0 bottom-0 w-40 h-60 opacity-15 pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <h2
            className="font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--color-text-heading)", marginBottom: "12px", lineHeight: 1.15 }}
          >
            Invest in Your Wellness
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", marginBottom: "32px" }}>
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Toggle */}
          <div
            className="inline-flex items-center gap-1 p-1"
            style={{ borderRadius: "var(--radius-pill)", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className="font-medium transition-all duration-200"
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-pill)",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
                background: !annual ? "#fff" : "transparent",
                color: !annual ? "var(--color-text-heading)" : "var(--color-text-muted)",
                boxShadow: !annual ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className="font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-pill)",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
                background: annual ? "#fff" : "transparent",
                color: annual ? "var(--color-text-heading)" : "var(--color-text-muted)",
                boxShadow: annual ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Annual
              <span
                className="font-bold"
                style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "var(--radius-pill)", background: "rgba(76,153,100,0.12)", color: "var(--color-status-success, #2d7a3a)", fontFamily: "var(--font-body)" }}
              >
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <motion.div
                key={plan.name}
                className="flex flex-col gap-7 p-7 rounded-2xl"
                style={{
                  background: plan.popular
                    ? "linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(104,35,50,0.03) 100%)"
                    : plan.gold
                    ? "linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(212,175,55,0.04) 100%)"
                    : "rgba(255,255,255,0.75)",
                  border: plan.popular
                    ? "2px solid rgba(104,35,50,0.22)"
                    : plan.gold
                    ? "2px solid rgba(212,175,55,0.28)"
                    : "1px solid rgba(0,0,0,0.07)",
                  boxShadow: plan.popular
                    ? "0 8px 40px rgba(104,35,50,0.12)"
                    : plan.gold
                    ? "0 8px 40px rgba(212,175,55,0.1)"
                    : "none",
                  transform: plan.popular ? "scale(1.03)" : "scale(1)",
                  backdropFilter: "blur(4px)",
                }}
                variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                {/* Plan header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-text-heading)" }}>{plan.name}</h3>
                    {plan.badge && (
                      <span
                        className="font-bold flex-shrink-0"
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.05em",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-pill)",
                          background: plan.popular ? "var(--color-brand-burgundy)" : "var(--color-brand-gold)",
                          color: plan.popular ? "#fff" : "#2D1B0E",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{plan.desc}</p>
                </div>

                {/* Price */}
                <div>
                  {price === 0 ? (
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>Free</p>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span style={{ fontSize: "1rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", marginBottom: "6px" }}>₹</span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{price}</span>
                      <span style={{ fontSize: "1rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", marginBottom: "6px" }}>/mo</span>
                    </div>
                  )}
                  {annual && price > 0 && (
                    <p style={{ fontSize: "12px", color: "var(--color-status-success, #2d7a3a)", marginTop: "4px", fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      Save ₹{(plan.price.monthly - price) * 12}/year
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link href="/signup">
                  <motion.button
                    className="w-full font-semibold"
                    style={{
                      height: "48px",
                      borderRadius: "var(--radius-xl)",
                      fontSize: "14px",
                      fontFamily: "var(--font-body)",
                      background: plan.popular
                        ? "linear-gradient(135deg, var(--color-brand-burgundy) 0%, var(--color-brand-burgundy-deep) 100%)"
                        : plan.gold
                        ? "var(--color-brand-gold)"
                        : "transparent",
                      color: plan.popular ? "#fff" : plan.gold ? "#2D1B0E" : "var(--color-text-heading)",
                      border: !plan.popular && !plan.gold ? "1.5px solid rgba(0,0,0,0.14)" : "none",
                      boxShadow: plan.popular ? "0 4px 20px rgba(104,35,50,0.25)" : plan.gold ? "0 4px 20px rgba(212,175,55,0.25)" : "none",
                    }}
                    whileHover={{ y: -2, boxShadow: plan.popular ? "0 8px 32px rgba(104,35,50,0.4)" : plan.gold ? "0 8px 32px rgba(212,175,55,0.4)" : "0 4px 16px rgba(0,0,0,0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-status-success, #2d7a3a)" }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <span style={{ fontSize: "13px", color: "var(--color-text-body)", fontFamily: "var(--font-body)", lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  { id: "q1", trigger: "What is Prakriti and why does it matter?", content: "Prakriti is your unique Ayurvedic mind-body constitution determined at birth by the balance of three energies — Vata (air & space), Pitta (fire & water), and Kapha (earth & water). Understanding your Prakriti helps you make personalised choices about diet, lifestyle, and sleep that work with your nature rather than against it." },
  { id: "q2", trigger: "Is the AI Vaidya a replacement for a doctor?", content: "No. Arogyanvesha is a wellness companion, not a medical service. Our AI Vaidya provides general Ayurvedic guidance based on classical texts. It is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical conditions." },
  { id: "q3", trigger: "How accurate is the Prakriti assessment?", content: "Our 20-question assessment is designed in consultation with certified Ayurvedic practitioners and validated against classical Prakriti evaluation methods. While no digital assessment perfectly replaces an in-person evaluation, results provide a strong personalisation foundation." },
  { id: "q4", trigger: "Can I use Arogyanvesha with no Ayurveda knowledge?", content: "Absolutely. Arogyanvesha is designed for complete beginners. All Sanskrit terms are explained in plain language, and the AI Vaidya guides you through everything step by step." },
  { id: "q5", trigger: "Is my health data private and secure?", content: "Yes. Your health data is encrypted at rest and in transit. We comply with DPDPA regulations and never sell your personal data. You can export or delete your data at any time from Settings." },
  { id: "q6", trigger: "What is the difference between Pro and Elite?", content: "Pro gives unlimited AI chat, full herb encyclopedia, unlimited yoga, and quarterly Prakriti reassessments. Elite adds unlimited skin analyses, custom yoga builder, monthly practitioner session, family accounts for 4 members, and a dedicated wellness coach." },
  { id: "q7", trigger: "Can I cancel my subscription anytime?", content: "Yes. Cancel anytime from Settings → Subscription. You retain access to paid features until the end of your billing period. No cancellation fees." },
  { id: "q8", trigger: "What languages is Arogyanvesha available in?", content: "Currently English and Hindi. Tamil, Telugu, Kannada, and Malayalam are coming soon. Sanskrit terms are labelled in both Devanagari and Roman transliteration." },
];

function FAQSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section id="faq" className="relative overflow-hidden" style={{ background: "var(--color-bg-canvas)", paddingTop: "96px", paddingBottom: "96px" }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <h2
            className="font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--color-text-heading)", marginBottom: "12px", lineHeight: 1.15 }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            Everything you need to know before you begin.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <Accordion items={FAQ_ITEMS} type="single" variant="default" />
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────────────────── */

function CTABanner({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #682332 0%, #4A1520 55%, #2D0A12 100%)", paddingTop: "96px", paddingBottom: "96px" }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)", filter: "blur(48px)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <LeafLeft className="absolute left-0 top-0 w-48 h-72 opacity-[0.07]" />
        <LeafRight className="absolute right-0 bottom-0 w-48 h-72 opacity-[0.07]" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-8 text-center">
        <motion.div
          variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16,1,0.3,1] } } }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5"
            style={{ borderRadius: "var(--radius-pill)", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: "var(--color-brand-gold)" }} />
            <span style={{ fontSize: "12px", letterSpacing: "0.08em", fontWeight: 600, color: "rgba(212,175,55,0.85)", fontFamily: "var(--font-body)" }}>
              Join 50,000+ Wellness Seekers
            </span>
          </div>

          <h2
            className="font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 5vw, 4rem)", color: "#fff", lineHeight: 1.1, marginBottom: "20px" }}
          >
            Begin Your Wellness Journey
            <span
              className="block"
              style={{ background: "linear-gradient(135deg, var(--color-brand-gold) 0%, #f0d060 50%, var(--color-brand-gold) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Today
            </span>
          </h2>

          <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: "rgba(212,175,55,0.65)", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.75, fontFamily: "var(--font-body)" }}>
            Free to start. No credit card required. Personalised for your unique Prakriti.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <motion.button
                className="inline-flex items-center gap-2.5 font-semibold"
                style={{ height: "56px", paddingInline: "36px", borderRadius: "var(--radius-xl)", fontFamily: "var(--font-body)", fontSize: "15px", background: "var(--color-brand-gold)", color: "#2D1B0E", boxShadow: "0 4px 24px rgba(212,175,55,0.35)" }}
                whileHover={{ y: -3, boxShadow: "0 10px 40px rgba(212,175,55,0.55)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Create Your Free Account
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                className="inline-flex items-center gap-2.5 font-semibold"
                style={{ height: "56px", paddingInline: "36px", borderRadius: "var(--radius-xl)", fontFamily: "var(--font-body)", fontSize: "15px", color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}
                whileHover={{ y: -2, background: "rgba(255,255,255,0.14)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>

          <p style={{ marginTop: "24px", fontSize: "12px", color: "rgba(212,175,55,0.5)", fontFamily: "var(--font-body)", letterSpacing: "0.04em" }}>
            No credit card · Cancel anytime · DPDPA compliant
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────── */

function Footer() {
  const links = {
    Product: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "How it works", href: "#" }, { label: "FAQ", href: "#faq" }],
    Company: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }],
    Legal: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Cookie Policy", href: "/cookies" }, { label: "DPDPA", href: "/dpdpa" }],
  };

  const socialIcons: Record<string, string> = {
    Twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    Instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    YouTube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    LinkedIn: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  };

  return (
    <footer style={{ background: "var(--color-charcoal, #1C1C1C)", color: "#fff" }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}
              >
                <span style={{ color: "var(--color-brand-gold)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "16px" }}>A</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)", fontSize: "14px", letterSpacing: "0.08em" }}>AROGYANVESHA</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Where AI Meets Ayurvedic Healing</p>
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: "280px", marginBottom: "24px", fontFamily: "var(--font-body)" }}>
              Bridging 5,000 years of Ayurvedic wisdom with modern technology to help you
              live in harmony with your true nature.
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {Object.entries(socialIcons).map(([name, d]) => (
                <motion.a
                  key={name}
                  href="#"
                  aria-label={name}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}
                  whileHover={{ background: "rgba(212,175,55,0.15)", color: "var(--color-brand-gold)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d={d} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <h4 style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: "16px", fontFamily: "var(--font-body)" }}>
                {cat}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="transition-colors duration-150"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sanskrit motto + divider */}
        <div className="text-center mb-8">
          <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "rgba(212,175,55,0.35)", letterSpacing: "0.05em" }}>
            आरोग्यं परमं भाग्यम्
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
            © {new Date().getFullYear()} Arogyanvesha. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", textAlign: "center" }}>
            ⚕️ For educational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection shouldReduce={shouldReduce} />
      <FeaturesSection shouldReduce={shouldReduce} />
      {false && <StatsBar shouldReduce={shouldReduce} />}
      <WisdomSection shouldReduce={shouldReduce} />
      <HowItWorksSection shouldReduce={shouldReduce} />
      <PricingSection shouldReduce={shouldReduce} />
      {false && <TestimonialsSection shouldReduce={shouldReduce} />}
      <FAQSection shouldReduce={shouldReduce} />
      <CTABanner shouldReduce={shouldReduce} />
      <Footer />
    </div>
  );
}
