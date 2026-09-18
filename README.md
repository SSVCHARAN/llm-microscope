# LLM Microscope

A premium, high-performance visualizer for language model token generation. Designed to deconstruct the autoregressive loop and expose exactly how an LLM thinks, token-by-token.

Built with **Design Engineering** principles (Framer Motion spring physics, Vercel design guidelines, and liquid glassmorphism), it avoids the generic "AI dashboard" look in favor of a clean, hardware-accelerated aesthetic.

## 🚀 The Dual-Engine Architecture
1. **Showcase Labs (Mock Mode):** A zero-friction Vercel deployment mode. Plays back high-fidelity "Flight Recorder Traces" (pre-recorded JSON logs) so anyone can experience the UI instantly without needing a backend.
2. **LM Studio (Live Local):** Connects directly to your local hardware via `http://127.0.0.1:1234`. Send prompts to a local LLM (like Qwen 0.5B or Gemma 2B) and watch live tokens, probabilities, and latencies stream in real-time.

## 🧠 The 5-Stage Visual Pipeline
- **Context Buffer:** Watch the prompt and previously generated tokens stack up as the context window.
- **Feed Forward Network:** An animated Dense Neural Network simulating the data flow through Input -> QKV -> Attention -> MLP during the inference stage.
- **Logprobs Heatmap:** Real-time GPU-accelerated progress bars exposing the exact probability distribution (e.g. why the model chose "ounces" over "bounces").
- **Token Selection:** The final chosen token is isolated and appended back into the loop.

## 🛠 Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Anti-Slop monochrome styling, Geist typography)
- **Motion:** Framer Motion (Hardware-accelerated transforms, layout animations, Apple-style spring physics)
- **API:** Fetch + SSE (Server-Sent Events) custom parsing

## ⚙️ Running Locally

1. **Start LM Studio**
   - Download a tiny model like `qwen2.5-0.5b-instruct`.
   - Start the Local Server on port `1234`.

2. **Start the Microscope**
   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`. Toggle to **LM Studio**, wait for the Green Connection Dot, and start prompting!
