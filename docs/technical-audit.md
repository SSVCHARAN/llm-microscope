# LLM Microscope — Comprehensive Technical Audit

**Date**: 2026-09-22  
**Status**: Complete Technical Baseline  
**Auditor**: Senior Frontend Engineer & AI/ML Engineer  

---

## 1. Architecture Overview

The codebase is built on:
- **React 18.3.1 + TypeScript 5.2.2 + Vite 5.2.11**
- **Tailwind CSS 3.4.3 + Framer Motion 13.3.0**
- **Dual Inference Engine**:
  1. Local LM Studio API (`/lmstudio/v1/chat/completions`) with SSE streaming and logprobs
  2. In-Browser Web Worker with `@huggingface/transformers` (Quantized ONNX `Xenova/LaMini-GPT-124M`)
  3. Pre-recorded Flight Recorder mock trace fallback (`src/data/mockTrace.json`)

---

## 2. Codebase Technical Findings & Risk Matrix

| ID | Module | Severity | Technical Issue | Remediation |
|:---|:---|:---|:---|:---|
| **TECH-01** | `App.tsx` / Routing | **CRITICAL** | The application shell only rendered `useStageController` without mounting or toggling `useMicroscope` / `usePipelineVisualizer`. | Build a unified top-level shell with clean state isolation for both **Architecture Mode** and **Live Generation Mode**. |
| **TECH-02** | `tailwind.config.js` / CSS | **HIGH** | `tailwind.config.js` uses blue primary (`#3b82f6`) while code expects emerald. `TokenPredictionLoop.tsx` references undefined CSS variable `rgba(var(--color-primary), ...)`. | Define consistent CSS variables (`--color-primary`, `--color-background`, etc.) in `index.css` and update Tailwind config with semantic tokens. |
| **TECH-03** | `SoftmaxStage.tsx` / Numerical Stability | **HIGH** | Logit exponentiation `Math.exp(item.logit / temp)` without subtracting `max(z/T)` in `tableTokens` can lead to `Infinity` or `NaN` at low temperatures ($T \le 0.05$). | Implement numerically stable softmax: $P(z_i) = \frac{e^{(z_i - \max z)/T}}{\sum_j e^{(z_j - \max z)/T}}$ across all calculation paths. |
| **TECH-04** | `NeuronGraph.tsx` / SVG Scalability | **HIGH** | Hardcoded SVG `width={640}` `height={340}` without responsive `viewBox` triggers horizontal scrollbars on mobile viewports (< 640px). | Add `viewBox="0 0 640 340"` and responsive styling (`w-full h-auto max-w-[640px]`). |
| **TECH-05** | `useMicroscope.ts` / Worker Lifecycle | **MEDIUM** | Global `worker` instance created outside React component without cleanup on HMR / unmount; error messages lack retry controls. | Ensure single worker instance with cleanup listeners and structured error recovery. |
| **TECH-06** | `lmstudio.ts` / SSE Stream Parser | **MEDIUM** | SSE parser splits on `\n` without handling multi-line SSE data or carriage returns (`\r\n`). Silent fallback to mock-model lacks explicit user warning. | Enhance buffer parsing for `\r\n`, and provide clear connectivity status indicators in the UI with manual endpoint retry. |
| **TECH-07** | `useStageController.ts` / Dice Roll | **MEDIUM** | `rollSamplingDice` uses raw `setTimeout` without clearing on component unmount or rapid button clicks, creating race conditions. | Add `isRollingRef` check and unmount cleanup to avoid setState on unmounted components. |
| **TECH-08** | Accessibility / A11y Attributes | **MEDIUM** | Sliders in `InputBar`, `SoftmaxStage`, `SamplingStage` lack `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. | Add complete ARIA attributes and visible focus states across all interactive elements. |

---

## 3. Deep-Dive Inspections

### 3.1 React & Component Lifecycles
- **Hook Dependencies**: `useStageController` memoizes `dynamicLogits` based on `[temperature, winnerToken]`, which is efficient and correct.
- **Re-renders**: Stage components are currently separated into dedicated files (`TokenizationStage`, `EmbeddingStage`, etc.). When switching stages, `AnimatePresence mode="wait"` mounts the active stage. This prevents background rendering of inactive stages.
- **State Coupling**: The live generation state in `useMicroscope` and the 7-stage architectural walkthrough state in `useStageController` are completely independent, allowing clean dual-mode tabs without state bleed.

### 3.2 Numerical & Mathematical Soundness
- **Transformer Dimensions**:
  - GPT-2 uses $d_{\text{model}} = 768$, 12 layers, 12 heads, $d_k = 64$.
  - For educational clarity, the walkthrough tracks $d = 4$ coordinates for the interactive matrix multiplications and neural graph, while explicitly noting that in full GPT-2, $d = 768$.
  - In `SoftmaxStage`, dot products of $x_{\text{final}} \times W_U$ mathematically match the logits:
    `(2.16 × 1.80) + (0.44 × 0.85) + (1.02 × 0.65) + (1.17 × 2.50) = 3.89 + 0.37 + 0.66 + 2.91 = +7.83` (Exact match).
  - This numerical integrity is exceptional and must be strictly preserved.

### 3.3 Streaming & Worker Architecture
- `src/worker.ts` handles Transformers.js with WebGPU / WASM fallbacks.
- `src/api/lmstudio.ts` connects via `/v1/chat/completions` with `stream: true`, `logprobs: true`, `top_logprobs: 10`.
- In `vite.config.ts`, the proxy `/lmstudio` redirects to `http://127.0.0.1:1234`, bypassing browser CORS issues.
- `usePipelineVisualizer.ts` manages a stage-by-stage pacing state machine (`idle` -> `context` -> `inference` -> `logits` -> `prob_receive` -> `selection` -> `append`) that animates tokens smoothly even when network chunks arrive quickly.

---

## 4. Remediation Checklist
- [x] Unify Tailwind colors and CSS variables (`--color-primary: 16 185 129`).
- [ ] Implement dual-mode navigation in `App.tsx` (Architecture Deep-Dive vs Live Generation Loop).
- [ ] Ensure numerical stability for all softmax computations under low temperatures.
- [ ] Fix responsive SVG viewBox scaling in `NeuronGraph.tsx`.
- [ ] Add ARIA accessibility attributes to all inputs, buttons, and visualizations.
- [ ] Polish live generation components (`TokenPredictionLoop`, `MetricsPanel`, `RawEventInspector`, `PlaybackControls`, `GeneratedTextView`) with Obsidian/Emerald design system.
- [ ] Verify build with `tsc && vite build` and test edge cases.
