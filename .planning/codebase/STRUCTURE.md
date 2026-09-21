# Repository Structure

```
├── AGENTS.md                          # Unified Agentic Engineering Playbook
├── .planning/                         # Persistent memory bank and specs
│   ├── PROJECT.md                     # Vision, tech stack, and roadmap
│   └── codebase/                      # Architecture, stack, conventions, concerns
├── public/                            # Static assets and local model weights
│   └── models/                        # Quantized ONNX weights & tokenizer configs
│       └── Xenova/
│           ├── gpt2/
│           └── LaMini-GPT-124M/
├── src/                               # Frontend source
│   ├── App.tsx                        # Main UI layout & pipeline panels
│   ├── main.tsx                       # React root entrypoint
│   ├── index.css                      # Tailwind stylesheet & custom utilities
│   ├── types.ts                       # Shared TypeScript interfaces
│   ├── worker.ts                      # Isolated Web Worker for ONNX inference
│   └── hooks/
│       ├── useMicroscope.ts           # Worker lifecycle & generation state
│       └── usePipelineVisualizer.ts   # Animation timing state machine
├── package.json                       # Project scripts and dependencies
├── tsconfig.json                      # TypeScript configuration
└── vite.config.ts                     # Bundler config with strict 404 handler for models
```
