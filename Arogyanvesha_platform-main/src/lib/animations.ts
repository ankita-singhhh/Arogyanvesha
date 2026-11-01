/**
 * Arogyanvesha — Animation Variants
 * Single source of truth for ALL Framer Motion variants.
 * No inline variants anywhere in component files — ever.
 * Every component imports from here.
 *
 * Rule: GPU-only properties only — transform + opacity.
 * NEVER animate: width, height, margin, padding, top, left.
 */

import type { Variants, Transition } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   SHARED TRANSITIONS
───────────────────────────────────────────────────────── */

export const transitions = {
  /** Standard page/card entrance — feels snappy not floaty */
  smooth: {
    duration: 0.25,
    ease: [0.16, 1, 0.3, 1],
  } satisfies Transition,

  /** Slightly slower for larger elements */
  relaxed: {
    duration: 0.4,
    ease: [0.16, 1, 0.3, 1],
  } satisfies Transition,

  /** Spring — modals, bottom sheets, interactive elements */
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } satisfies Transition,

  /** Bouncy spring — prakriti reveal, achievements */
  springBouncy: {
    type: "spring",
    stiffness: 300,
    damping: 25,
  } satisfies Transition,

  /** Toast spring — fast snap in */
  springFast: {
    type: "spring",
    stiffness: 500,
    damping: 35,
  } satisfies Transition,

  /** Exit — always faster than entrance */
  exit: {
    duration: 0.2,
    ease: [0.7, 0, 0.84, 0],
  } satisfies Transition,
} as const;

/* ─────────────────────────────────────────────────────────
   PAGE & LAYOUT VARIANTS
───────────────────────────────────────────────────────── */

/**
 * pageEnter — every page/route wraps its content in this
 * Applied via <motion.div variants={pageEnter} initial="hidden" animate="visible">
 */
export const pageEnter: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * fadeIn — simple opacity fade, no movement
 * Used for: overlays, backdrop, subtle reveals
 */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.smooth },
  exit:    { opacity: 0, transition: transitions.exit },
};

/* ─────────────────────────────────────────────────────────
   CARD & LIST VARIANTS
───────────────────────────────────────────────────────── */

/**
 * cardEnter — individual card entrance
 * Used with staggerContainer for card grids
 */
export const cardEnter: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * staggerContainer — wraps a list of cardEnter children
 * Children animate in sequence, 60ms apart
 *
 * Usage:
 *   <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *     {items.map(item => (
 *       <motion.div key={item.id} variants={cardEnter}>...</motion.div>
 *     ))}
 *   </motion.div>
 */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

/**
 * staggerContainerFast — tighter stagger for dense lists
 * Used in: notification list, search results
 */
export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

/**
 * scrollReveal — triggered by viewport intersection
 * Used with whileInView on landing page sections
 *
 * Usage:
 *   <motion.div
 *     variants={scrollReveal}
 *     initial="hidden"
 *     whileInView="visible"
 *     viewport={{ once: true, margin: "-80px" }}
 *   />
 */
export const scrollReveal: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.relaxed,
  },
};

/* ─────────────────────────────────────────────────────────
   MODAL & OVERLAY VARIANTS
───────────────────────────────────────────────────────── */

/**
 * modalOpen — desktop modal entrance/exit
 * Scale from 0.94 with spring feel
 */
export const modalOpen: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: transitions.exit,
  },
};

/**
 * bottomSheetOpen — mobile bottom sheet slides up from bottom
 * Used when viewport < md breakpoint
 */
export const bottomSheetOpen: Variants = {
  hidden:  { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: transitions.exit,
  },
};

/**
 * overlayBackdrop — modal/bottom sheet dark overlay
 */
export const overlayBackdrop: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

/* ─────────────────────────────────────────────────────────
   TOAST VARIANTS
───────────────────────────────────────────────────────── */

/**
 * toastEnter — slides in from right, snaps with spring
 * Max 3 toasts visible at once (enforced in ToastProvider)
 */
export const toastEnter: Variants = {
  hidden:  { opacity: 0, x: 120 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.springFast,
  },
  exit: {
    opacity: 0,
    x: 120,
    transition: { duration: 0.2 },
  },
};

/* ─────────────────────────────────────────────────────────
   SIDEBAR VARIANTS
───────────────────────────────────────────────────────── */

/**
 * sidebarCollapse — width transition for sidebar expand/collapse
 * Note: width animation is an exception to GPU-only rule —
 * sidebar collapse is a layout-level interaction, not decorative.
 * Labels fade independently via CSS opacity transition.
 */
export const sidebarCollapse = {
  expanded:  { width: 240 },
  collapsed: {
    width: 72,
    transition: { duration: 0.22, ease: "easeInOut" },
  },
};

/* ─────────────────────────────────────────────────────────
   PRAKRITI-SPECIFIC VARIANTS
───────────────────────────────────────────────────────── */

/**
 * prakritiReveal — staggered reveal of Dosha percentage cards
 * Uses custom prop (i) for per-card delay
 *
 * Usage:
 *   <motion.div
 *     variants={prakritiReveal}
 *     custom={index}
 *     initial="hidden"
 *     animate="visible"
 *   />
 */
export const prakritiReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.12,
      ...transitions.springBouncy,
    },
  }),
};

/**
 * prakritiAnalyzing — mandala rotation on the analyzing screen
 * Applied to the full-screen SVG mandala illustration
 */
export const prakritiAnalyzing = {
  rotate: {
    rotate: [0, 360],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
  pulse: {
    scale: [0.95, 1.05, 0.95],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * processingStep — fade in each step on the analyzing screen
 * Steps appear at 0s, 1.5s, 3s
 */
export const processingStep = (delaySeconds: number): Variants => ({
  hidden:  { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: delaySeconds,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
});

/* ─────────────────────────────────────────────────────────
   TOOLTIP VARIANTS
───────────────────────────────────────────────────────── */

export const tooltipEnter: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

/* ─────────────────────────────────────────────────────────
   ACCORDION VARIANTS
───────────────────────────────────────────────────────── */

export const accordionContent: Variants = {
  hidden:  { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] },
  },
};

/* ─────────────────────────────────────────────────────────
   REDUCED MOTION HELPER
   Every component using Framer Motion must call this.
   Pass the result as the variants prop when shouldReduce is true.
───────────────────────────────────────────────────────── */

/**
 * noAnimation — instant state change, no transition
 * Used when useReducedMotion() returns true
 *
 * Usage in component:
 *   const shouldReduce = useReducedMotion();
 *   const variants = shouldReduce ? noAnimation : pageEnter;
 */
export const noAnimation: Variants = {
  hidden:  {},
  visible: {},
  exit:    {},
};