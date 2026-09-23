/**
 * Reusable framer‑motion variant sets
 *
 * Variants propagate parent → child through the `variants` prop so
 * a single `animate="visible"` on a container cascades to all children.
 */
import type { Variants } from 'framer-motion';
import { STAGGER } from './tokens';

// ─── Container that staggers its children ─────────────────────────
export const staggerContainer = (
  staggerDelay: number = STAGGER.normal,
  delayChildren: number = 0.1,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// ─── Fade up entrance (children) ──────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

// ─── Horizontal bar growth (VectorBar / ProbabilityBar style) ─────
export const barGrow: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { type: 'spring', stiffness: 200, damping: 30 },
  },
};

// ─── Row‑by‑row reveal (Heatmap causal mask teaching) ─────────────
export const rowReveal = (rowIndex: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: rowIndex * STAGGER.normal,
      duration: 0.3,
      ease: 'easeOut',
    },
  },
});

// ─── Section reveal (generic section entrance) ────────────────────
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 30, delay: 0.05 },
  },
};
