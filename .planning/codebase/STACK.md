# Technology Stack

## Core Technologies
- **Language**: TypeScript (strict mode)
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS, PostCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **ML / Neural Runtime**: `@huggingface/transformers` (v3+ / Transformers.js with ONNX Runtime Web)

## Hardware & Environment Targets
- **Target Browser**: Firefox / Chromium-based browsers
- **Compute Backend**: WebGPU with WebAssembly (WASM SIMD) fallback
- **Memory Constraint**: Conservative allocations targeting systems with integrated GPUs (e.g. Intel HD 620, i5 7200U, 16GB RAM, ~2GB WASM heap cap)
