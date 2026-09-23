/**
 * Shared Motion Design Tokens
 *
 * Centralises spring physics, stagger delays, and transition presets
 * so every stage component uses a consistent animation vocabulary.
 */
import type { Transition } from 'framer-motion';

// ─── Spring Physics ───────────────────────────────────────────────
/** Natural, slightly bouncy entrance */
export const SPRING: Transition = { type: 'spring', stiffness: 300, damping: 25 };

/** Gentle entrance for text and educational content */
export const GENTLE_SPRING: Transition = { type: 'spring', stiffness: 200, damping: 30 };

/** Quick exit – 40 % faster than entrance */
export const EXIT_TWEEN: Transition = { duration: 0.15, ease: 'easeIn' };

/** Stage crossfade (used by AnimatePresence in App.tsx) */
export const CROSSFADE: Transition = { duration: 0.25, ease: 'easeInOut' };

// ─── Stagger Delays ──────────────────────────────────────────────
export const STAGGER = {
  /** Token cards, table rows */
  fast: 0.04,
  /** Educational points, vector components */
  normal: 0.08,
  /** Major section reveals */
  slow: 0.15,
} as const;

// ─── Reduced Motion Override ──────────────────────────────────────
/** Duration: 0 – skip all visual motion */
export const INSTANT: Transition = { duration: 0 };

// ─── Base Phase Duration ──────────────────────────────────────────
/** How long (ms) a single autoplay phase lasts at 1× speed */
export const BASE_PHASE_DURATION_MS = 3000;

// ─── Speed Multipliers ───────────────────────────────────────────
export const SPEED_MULTIPLIERS = {
  slow: 2.0,   // 2× longer
  normal: 1.0,
  fast: 0.5,   // 2× faster
} as const;
