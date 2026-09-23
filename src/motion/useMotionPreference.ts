/**
 * Reduced‑motion preference helper
 *
 * Wraps framer‑motion's `useReducedMotion()` into a convenience hook
 * that returns transition overrides so stage components can write:
 *
 *   const { transition } = useMotionPreference();
 *   <motion.div transition={transition(SPRING)} />
 */
import { useReducedMotion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { INSTANT } from './tokens';

export function useMotionPreference() {
  const shouldReduce = useReducedMotion() ?? false;

  return {
    /** true when the OS/browser requests reduced motion */
    shouldReduce,

    /** Returns `INSTANT` when reduced motion is active, otherwise the supplied transition */
    transition: (normal: Transition): Transition =>
      shouldReduce ? INSTANT : normal,

    /**
     * For `initial` prop: return `false` (skip entrance animation)
     * when reduced motion is active.
     */
    initial: <T>(normal: T): T | false =>
      shouldReduce ? false : normal,
  };
}
