# LLM Microscope — Master Refinement Plan

**Date**: 2026-09-22  
**Status**: Active Implementation Plan  
**Objective**: Final Professional Polish of LLM Microscope  

---

## 1. Vision & Architecture Strategy

LLM Microscope serves as an authoritative, interactive scientific instrument. It combines two core modes into a unified experience:
1. **🔬 Transformer Architecture Deep-Dive (7 Stages)**:
   - Stage 1: Tokenization (BPE subwords, byte boundaries, vocab space)
   - Stage 2: Embedding Lookup & Positional Encodings
   - Stage 3: Self-Attention Q, K, V Projections (Input $\times$ Weight Matrices)
   - Stage 4: Attention Heatmap & Causal Masking (NxN interactive matrix)
   - Stage 5: Feed-Forward Network / MLP (Neuron graph, GELU gating, arithmetic breakdown)
   - Stage 6: Unembedding & Softmax (Dot product dictionary, temperature scaling)
   - Stage 7: Sampling & Token Selection (Top-K, temperature, dice roll, autoregressive feedback)
2. **⚡ Live Generation Loop (LM Studio / Web Worker / Trace Replay)**:
   - Dual-engine live inference (Local LM Studio endpoint on 1234, in-browser Transformers.js ONNX, Flight Recorder trace replay)
   - 5-stage live pipeline: Context -> Model Processing -> Probabilities -> Selection -> Append
   - Real-time token streaming with boundary inspection
   - Production telemetry & performance metrics (TTFT, tokens/sec, latency per token)
   - Playback buffer & speed controls (0.25x, 0.5x, 1x, 2x, LIVE, step)
   - Raw SSE event inspector with event filtering and copy tools

---

## 2. Phased Execution Roadmap

### Phase 1: Design System & Token Foundation
- [ ] Update `tailwind.config.js` and `index.css`:
  - Define root CSS variables for `--color-primary` (Emerald `16 185 129`), `--color-surface`, `--color-background`, `--color-border`.
  - Harmonize color palettes across the entire app so all components share the Obsidian Dark Observatory design language.
  - Add utility classes for accessible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-400`).
  - Add `@media (prefers-reduced-motion: reduce)` support.

### Phase 2: Dual-Mode Top Navigation & Header
- [ ] Refactor `App.tsx` and header navigation:
  - Add primary View Mode Switcher:
    - `🔬 Architecture Deep-Dive (7 Stages)`
    - `⚡ Live Generation Loop (Observatory)`
  - Add status indicators (active stage / LM Studio connection status, model badge).
  - Cleanly encapsulate both modes with zero state conflicts.

### Phase 3: Stage-by-Stage Walkthrough Refinement (Stages 1–7)
- [ ] **Stage 1 (Tokenization)**:
  - Add interactive token tester: allow user to type or select example prompts ("The cat sat on the", "unbelievable", "hello world") and see how BPE chunks change.
  - Elevate contrast of badge texts to WCAG AA 4.5:1+.
- [ ] **Stage 2 (Embedding & Position)**:
  - Enhance `VectorBar` with interactive tooltips for dimensions ($d_0 \dots d_7$), clear positive/negative bar styling, and sign formatting (`+` / `-`).
- [ ] **Stage 3 (Self-Attention QKV)**:
  - Improve `MatrixGrid` responsiveness with horizontal scroll container and sticky row labels.
  - Add keyboard accessible projection switchers with ARIA states.
- [ ] **Stage 4 (Attention Heatmap)**:
  - Add ARIA labels to heatmap grid buttons for screen-reader comprehension.
  - Enhance cell hover states and contrast on causal mask locks.
- [ ] **Stage 5 (Feed-Forward Network)**:
  - Fix SVG responsiveness in `NeuronGraph.tsx` (`viewBox="0 0 640 340"`, responsive width).
  - Add accessible labels to neurons and synapses.
- [ ] **Stage 6 (Softmax & Unembedding)**:
  - Fix numerical stability in temperature calculations (prevent NaN / Infinity on extreme T).
  - Prevent text/circle overlap on `SoftmaxCurve.tsx`.
  - Ensure table is responsive on mobile screens.
- [ ] **Stage 7 (Sampling & Output)**:
  - Debounce dice roll button to prevent timeout race conditions.
  - Add spring animation respecting reduced motion.

### Phase 4: Live Generation Observatory Polish
- [ ] Standardize `TokenPredictionLoop.tsx`, `GeneratedTextView.tsx`, `MetricsPanel.tsx`, `RawEventInspector.tsx`, and `PlaybackControls.tsx` to the Obsidian/Emerald design system.
- [ ] Fix the undefined `var(--color-primary)` CSS variable in `TokenPredictionLoop`.
- [ ] Add model/source switcher in Live Mode:
  - Option A: **Local LM Studio** (`http://127.0.0.1:1234`)
  - Option B: **In-Browser ONNX Model** (`Xenova/LaMini-GPT-124M` Web Worker)
  - Option C: **Showcase Flight Recorder** (Instant mock trace replay)
- [ ] Add "Resume Auto-scroll" button in `GeneratedTextView.tsx`.
- [ ] Add search/filter and "Copy JSON" functionality to `RawEventInspector.tsx`.

### Phase 5: Accessibility & Cross-Browser Verification
- [ ] Audit every interactive element with keyboard navigation (Tab / Shift-Tab / Enter / Space).
- [ ] Ensure all form inputs (`input[type="range"]`) have associated labels or `aria-label`.
- [ ] Verify color contrast on all text elements (minimum 4.5:1 for body, 3:1 for large text).
- [ ] Implement `useReducedMotion` hooks across Framer Motion animations.

### Phase 6: Build, Regression & Verification Pass
- [ ] Run `npm run build` (TypeScript check + Vite production build).
- [ ] Test mobile, tablet, and desktop breakpoints.
- [ ] Verify both Architecture Walkthrough and Live Observatory operate smoothly without memory leaks or race conditions.
