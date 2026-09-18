# Architecture

## Core Concepts
The application is built as a single-page React application (SPA) running entirely locally. It communicates directly with the local LM Studio server via REST and SSE (Server-Sent Events) over HTTP.

### Separation of Concerns
1. **API Client (`src/api/lmstudio.ts`)**: Handles all network communication, SSE stream parsing, and error normalization. It isolates the HTTP concerns from the React lifecycle.
2. **State Management (`src/hooks/useMicroscope.ts`)**: Custom React hook that orchestrates the generation lifecycle, builds the token timeline, calculates cumulative latency, and handles metric extraction.
3. **Visualization (`src/components/`)**: Pure UI components that take state snapshots and render them efficiently.

### Stream Processing
- We utilize the standard OpenAI `/v1/chat/completions` endpoint exposed by LM Studio.
- Responses are processed using `TextDecoderStream` and manually parsing SSE lines to ensure we have zero third-party library dependencies for the core loop.
- The `logprobs` field is recursively parsed to extract the selected token and `top_logprobs`.

### Performance Architecture
- **Immutable Updates**: React state is appended immutably to create the generation step history.
- **Event Limits**: The raw event inspector caps its history to 100 events to prevent massive memory leaks on long generations.
- **Derived State**: Finding the currently displayed token is an implicit derivation rather than explicit duplicated state, minimizing render cycles.

## Project Structure
```
src/
  api/          # API communication and stream processing
  components/   # React visualization components
  hooks/        # Core state machine and side-effects
  types/        # TypeScript interfaces for API and state
```
