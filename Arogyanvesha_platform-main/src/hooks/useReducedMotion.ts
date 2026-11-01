import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Returns true when the user has requested reduced motion.
 * Wraps Framer Motion's hook so we have a single import path.
 *
 * Every animated component must call this and skip animations
 * when it returns true.
 *
 * Usage:
 *   const shouldReduce = useReducedMotion();
 *   const variants = shouldReduce ? noAnimation : pageEnter;
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}