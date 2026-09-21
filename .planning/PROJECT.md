# PROJECT: LLM Microscope

## Vision & Purpose
An interactive, browser-native LLM visualizer and diagnostic tool ("microscope") that exposes the internal mechanics of autoregressive language generation in real-time. It visualizes:
- Feed Forward Network / simulated weights and transitions per generation step.
- Token Identity, alternative Top-K candidates, and exact log-probabilities / probabilities extracted from raw logits.
- Selected token animations with physics-based transitions (Framer Motion).
- Context array expansion and real-time decoded output streaming.
- Instruction template wrapping ("system prompts") for instruct-tuned models.

## Tech Stack
- **Runtime / Bundler**: Vite + React (TypeScript)
- **Styling & Animation**: Tailwind CSS + Framer Motion
- **Inference Engine**: Native in-browser Web Worker using `@huggingface/transformers` (Transformers.js ONNX runtime + WebGPU / WASM fallbacks)
- **Models**:
  - `Xenova/LaMini-GPT-124M` (current instruction-tuned model)
  - `Xenova/gpt2` (124M base foundation model)
  - Quantized ONNX weights cached locally in `public/models/` to accommodate browser memory limits (Firefox WASM sandbox)

## Architecture
- `src/worker.ts`: Dedicated Web Worker running Transformers.js causal language model inference loop. Computes logits, temperature scaling, top-k sampling, and streams step telemetry via `postMessage`.
- `src/hooks/useMicroscope.ts`: React hook managing worker lifecycle, generation triggers, token stream accumulation, and error/loading states.
- `src/hooks/usePipelineVisualizer.ts`: State machine coordinating step-by-step pipeline animations across multi-stage visualization (`inference` -> `logits` -> `prob_reveal` -> `selection` -> `append`).
- `src/App.tsx`: Main user interface presenting the prompt console, 4-stage pipeline visualization, and streaming final output.

## Operational Playbook
This repository adheres strictly to `AGENTS.md` (Unified Agentic Engineering Playbook).
- **Phase 1**: Context & Architectural Alignment before modifying code (`.planning/`, `/grill-me`, `gsd-plan-phase`).
- **Phase 2**: Autonomous Implementation Loop (`ralph-loop`, continuous test & lint checks).
- **Phase 3**: Code Review & Quality Gate (`code-review`, `autofix`).
- **Phase 4**: Verification & Handoff (`gsd-verify-work`).
