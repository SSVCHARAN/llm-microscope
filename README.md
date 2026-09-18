# LLM Microscope

A local, high-performance visualization instrument for investigating language model token generation in real-time. Designed to observe the generative process token-by-token directly from your local inference engine.

## Features
- **Live Stream Visualization**: Watch tokens stream in, coupled with their latency and probability data.
- **Top Candidates Tracking**: If the API exposes logprobs, see exactly what alternate tokens were considered and their rank.
- **Token Boundaries**: Distinctly highlights exactly how text is chunked into tokens.
- **Metrics Dashboard**: Tracks time-to-first-token, tokens/second, overall completion time, and context usage.
- **Raw Event Inspector**: Peek behind the scenes at the precise SSE HTTP stream data.

## Architecture
Built as a lightweight React Single Page Application (SPA).
- **Vite** + **React** + **TypeScript** + **Tailwind CSS**.
- **No Heavy Backends**: Runs completely in the browser and connects locally directly to your LM Studio server.
- **Native Streaming**: Hand-written SSE parser using `TextDecoderStream` rather than bulky SDKs to ensure precise control over chunk timing and probability extraction.

## Prerequisites
- Node.js (v18+)
- LM Studio (v0.2.20+) running locally on port 1234.
- A model loaded in LM Studio.

## Setup & Running

1. Enable the Local Server in LM Studio:
   - Open LM Studio.
   - Go to the "Local Server" tab.
   - Ensure the server is started on `http://127.0.0.1:1234`.
   - Ensure CORS is enabled (usually default).

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser (usually `http://localhost:5173`).

## Known Limitations
- Token IDs (integer mappings) are not provided by the standard LM Studio `/v1/chat/completions` endpoint, so they are not visualized.
- Context usage stats (`prompt_tokens`) are only exposed at the *end* of the stream, per standard OpenAI stream configuration.

## Educational Note
Token probabilities show information exposed by the inference API. They do not expose hidden chain-of-thought or private internal reasoning. This tool is an observational lens into the final output distribution and timing of the model.
