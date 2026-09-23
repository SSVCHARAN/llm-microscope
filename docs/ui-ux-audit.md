# LLM Microscope — Comprehensive UI/UX Audit

**Date**: 2026-09-22  
**Status**: Comprehensive Baseline Established  
**Auditor**: Senior UI/UX Designer & Accessibility Specialist  

---

## 1. Executive Summary & Educational Mission

LLM Microscope is an interactive educational observability instrument designed to reveal the inner mechanics of Transformer language models. Its core pedagogical value lies in demystifying how continuous numbers and statistical matrices transform raw text input into next-token predictions.

The product operates in two complementary dimensions:
1. **The Microscopic Forward-Pass (Architecture Walkthrough)**: Step-by-step mathematical decomposition of a single token generation step across 7 fundamental transformer phases (Tokenization, Embedding, QKV Projections, Attention Heatmap, Feed-Forward Network, Softmax & Logits, Sampling).
2. **The Macroscopic Generation Loop (Live Observatory)**: Real-time autoregressive stream observability connecting to local LM Studio instances (`http://127.0.0.1:1234`), in-browser ONNX Web Workers, or pre-recorded Flight Recorder traces, visualizing live logprobs, token boundaries, TTFT, throughput, and raw SSE events.

---

## 2. Priority Audit Findings

| ID | Category | Severity | Description | User Impact |
|:---|:---|:---|:---|:---|
| **UX-01** | Architecture / Mode | **CRITICAL** | Core Live LM Studio Observatory was disconnected in `App.tsx` when the 7-stage walkthrough was added. Both modes are essential. | Users cannot access the live LM Studio streaming instrument or flight recorder traces. |
| **UX-02** | Color & Design System | **HIGH** | Inconsistent color tokens: `tailwind.config.js` specifies blue (`#3b82f6`) while stage components use hardcoded `emerald-500`. Undefined CSS variable `rgba(var(--color-primary), ...)` in `TokenPredictionLoop`. | Visual dissonance between old and new components; broken CSS variables causing rendering defects. |
| **UX-03** | Typography & Contrast | **HIGH** | Muted text colors (`#666`, `#777`, `#888`, `white/20`) fail WCAG AA 4.5:1 contrast requirement against `#0C0C0C` background. | Readability barrier for users in non-optimal lighting conditions or with visual impairments. |
| **UX-04** | Responsive Scaling | **HIGH** | `NeuronGraph.tsx` has fixed `width={640}` and `height={340}` SVG without responsive `viewBox` scaling. Stage 4 Heatmap and Stage 6 Softmax tables overflow on mobile screens (< 640px). | Layout breaks and horizontal clipping on mobile devices and small tablets. |
| **UX-05** | Accessibility (A11y) | **HIGH** | Sliders lack explicit accessible labels (`aria-label` / `aria-valuenow`). Icon-only buttons lack `aria-label`. Interactive stage cells lack keyboard focus rings. No `prefers-reduced-motion` safeguards. | Non-compliant with WCAG 2.1 Level AA; unusable via screen readers and keyboard navigation. |
| **UX-06** | Interactive Feedback | **MEDIUM** | Stage stepper in `InputBar` lacks smooth scroll snapping and active-state visual momentum. Explainer cards lack `aria-expanded` state. | Users cannot easily scan stage status or understand collapsible container states. |
| **UX-07** | Data Visualization Polish| **MEDIUM** | `SoftmaxCurve` candidate points can visually collide when logits are clustered. Probability bars lack tabular number alignment. Matrix grids lack hover coordinate guides. | Impairs visual clarity and numerical comparison when exploring model weights. |
| **UX-08** | Educational Continuity | **LOW** | Jargon and formulas are rich, but transitions between stages could benefit from quick "What just happened" and "Where does this data go" breadcrumbs. | Cognitive friction for learners following the data flow from token embeddings to logits. |

---

## 3. Detailed Component & Section Analysis

### 3.1 Top Navigation & Mode Switcher
- **Current State**: Single fixed header showing "v2 Architecture Visualizer" and "GPT-2 / Transformer Architecture".
- **Defects**: No top-level tab or switch to toggle between the **7-Stage Architectural Walkthrough** and the **Live Autoregressive Observatory (LM Studio / Trace Replay)**.
- **Remediation**: Implement a unified Mode Switcher in the top bar:
  - 🔬 **Architecture Deep-Dive (7 Stages)**
  - ⚡ **Live Generation Loop (LM Studio / Web Worker / Trace)**
  Include active connection dot, latency badge, and model indicator.

### 3.2 Stage 1: Tokenization (BPE)
- **Current State**: Displays colored chips for "The", " cat", " sat", " on", " the", with token IDs and an inspector.
- **Defects**: Static prompt. User cannot experiment with subwords (e.g. typing "unbelievable" to see prefix chunking).
- **Remediation**: Provide an interactive subword tokenizer playground alongside the mock sequence, showing how spaces (`Ġ` / `␣`) change token IDs. Ensure 4.5:1 contrast on all chip tags.

### 3.3 Stage 2: Embedding & Positional Encoding
- **Current State**: Displays Token Embedding + Positional Encoding = Combined Vector.
- **Defects**: Numbers in `VectorBar` have small touch targets and lack tooltips for dimension indices ($d_0 \dots d_7$).
- **Remediation**: Add explicit coordinate tooltips, sign formatting (`+0.34`, `-0.72`), and accessible labels.

### 3.4 Stage 3: Self-Attention QKV Projections
- **Current State**: Search engine analogy (Query, Key, Value), projection switcher, and 4x4 matrix multiplication.
- **Defects**: Matrix overflows on viewports < 480px. Projection switcher buttons lack `aria-pressed`.
- **Remediation**: Wrap MatrixGrid in responsive scroll container with sticky headers. Add accessible tablist semantics and keyboard arrow navigation.

### 3.5 Stage 4: Attention Heatmap & Causal Masking
- **Current State**: 5x5 attention matrix with causal mask (upper right corner locked) and inspector card.
- **Defects**: Grid buttons lack `aria-label` describing relationship (e.g., `aria-label="Query 'sat' to Key 'cat': 74% attention"`). Muted lock icons have poor contrast.
- **Remediation**: Add descriptive ARIA attributes, improve lock icon contrast (`#94A3B8`), and add sticky headers on mobile view.

### 3.6 Stage 5: Feed-Forward Network (MLP)
- **Current State**: Jargon buster, context bridge, and 3-layer neural graph with arithmetic breakdown.
- **Defects**: Fixed SVG coordinates (`640x340`) cause horizontal page overflow on mobile devices. Synapse lines lack keyboard focusability.
- **Remediation**: Convert SVG to `viewBox="0 0 640 340"` with `w-full h-auto max-w-2xl`. Ensure neurons have minimum touch target and accessible names.

### 3.7 Stage 6: Unembedding, Logits & Softmax
- **Current State**: Step 1 dot product dictionary table, Step 2 conversion table, exponential curve, and temperature controls.
- **Defects**: Conversion table overflows horizontally on small screens. Softmax curve points lack collision avoidance for closely ranked tokens.
- **Remediation**: Add table horizontal scroll indicators, optimize cell padding, add accessible sliders with `aria-valuenow`, and clamp numerical exponentials cleanly.

### 3.8 Stage 7: Sampling & Output
- **Current State**: Top-K slider, dice roll button, and sequence output showcase.
- **Defects**: Rapid clicking triggers multiple timeouts in dice roll state. Top-K slider only allows 1-8 instead of explaining full scale.
- **Remediation**: Debounce dice roll trigger, add spring exit/enter animations respecting `prefers-reduced-motion`, and provide clear sampling mode comparisons.

### 3.9 Live Generation Microscope (LM Studio / Worker / Trace)
- **Current State**: Components exist in isolation (`TokenPredictionLoop`, `GeneratedTextView`, `MetricsPanel`, `RawEventInspector`, `PlaybackControls`), but disconnected from `App.tsx`.
- **Defects**: Disconnected; broken `--color-primary` CSS variables; inconsistent styling compared to v2 stages; lack of clear empty/error states when LM Studio is disconnected.
- **Remediation**: Re-integrate seamlessly as the "Live Generation Loop" mode. Harmonize styling with Obsidian/Emerald theme. Add LM Studio connection troubleshooting dialog with local URL instructions.

---

## 4. Typography & Spacing System Rules

1. **Font Families**:
   - Primary: `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `sans-serif`
   - Monospace (Telemetry & Tokens): `Geist Mono`, `JetBrains Mono`, `Fira Code`, `monospace`
2. **Type Scale**:
   - Section Title: `text-2xl font-bold tracking-tight text-white`
   - Subheading / Tagline: `text-[13px] font-mono uppercase tracking-wider text-emerald-400`
   - Body Copy: `text-[13px] leading-relaxed text-[#D4D4D8] max-w-4xl`
   - Metadata / Badges: `text-[10px] sm:text-[11px] font-mono tracking-wider`
   - Numeric Displays: `font-mono tabular-nums font-bold`
3. **Contrast Targets**:
   - Primary Text on Dark: `#FFFFFF` / `#F4F4F5` (Ratio: 18:1+)
   - Secondary Text on Dark: `#D4D4D8` / `#A1A1AA` (Ratio: 7:1+)
   - Muted Labels on Dark: `#94A3B8` / `#A3A3A3` (Ratio: 4.8:1+, meets AA)
   - Banned Low-Contrast: `#555`, `#666`, `#777`, `white/20` for textual content.

---

## 5. Motion & Physics Principles

1. All transitions must respect `prefers-reduced-motion`.
2. Subtle spring physics: `type: "spring", stiffness: 350, damping: 30`.
3. Duration cap: UI transitions ≤ 250ms; data animations ≤ 400ms.
4. Animate only hardware-accelerated properties: `transform` and `opacity`. Avoid animating `width`, `height`, `left`, `top`.
