# Testing Strategy

## Manual Validation Checklist
The following steps have been manually validated against a live instance of LM Studio running `gemma-4-e4b-it-heretic` locally.

1. [x] **API model discovery:** Automatically fetches and populates the model dropdown from `/v1/models`.
2. [x] **Request construction:** Properly constructs a payload with `stream: true`, `logprobs: true`, `top_logprobs: 10`, and `stream_options: { include_usage: true }`.
3. [x] **Stream parser:** Accurately reads byte chunks and parses `data: {...}` lines reliably.
4. [x] **Incremental token extraction:** Correctly pulls `delta.content` or `logprobs.content` text and builds the timeline sequentially.
5. [x] **Probability calculations:** Properly converts logprob strings/floats to percentages via `exp(logprob)`.
6. [x] **Token timeline creation:** Each generation step persists, and history can be selected via click.
7. [x] **Cancellation:** "Stop" button aborts the `AbortController` and gracefully terminates the stream without corrupting future queries.
8. [x] **Connection failure:** Gracefully catches connection errors if LM Studio is offline.
9. [x] **Completion handling:** Registers `[DONE]` event and halts timing execution, reading `usage` data if present.

## Testing Against the Real API
We purposefully avoided writing mock data generation where possible, favoring raw `curl` outputs to inspect and validate the precise SSE data structure produced by LM Studio (Gemma models via llama.cpp backend). 

For future automated testing, we recommend taking the raw output logs stored in the investigative phases and feeding them through a mocked `fetch` Response body.
