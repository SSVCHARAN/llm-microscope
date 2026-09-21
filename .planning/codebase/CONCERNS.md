# Architectural Concerns & Constraints

## 1. Browser WASM / WebGPU Limits
- **Firefox Sandbox**: Firefox enforces strict 2GB–4GB memory caps on WebAssembly instances. Loading unquantized models (>500MB) will trigger OOM failures during allocation.
- **Hardware Profile**: Target machine operates on an Intel HD 620 integrated GPU / i5 7200U. Models must remain in the ~120M–135M parameter range with 8-bit quantization (`decoder_model_merged_quantized.onnx`).

## 2. Vite Asset Fallback & 404s
- By default, Vite SPA dev server serves `index.html` (HTTP 200) for missing routes.
- When `transformers.js` attempts to probe for optional or missing shard configs (e.g. `preprocessor_config.json`), receiving HTML instead of 404 causes `protobuf parsing failed` or `SyntaxError: JSON.parse: unexpected character`.
- The strict 404 plugin in `vite.config.ts` must remain active for `/models/*`.

## 3. Autoregressive Loop Performance
- Step-by-step manual tensor concatenation `new Tensor('int64', new_input_data, [1, seq_len])` creates garbage and increases latency with long sequences. Sequence length should be capped (default: 30–50 tokens).
