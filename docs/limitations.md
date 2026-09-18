# Known Limitations

This section documents limitations based on the real behavior of the local LM Studio endpoint.

## Token IDs
- **Unsupported**: The LM Studio OpenAI-compatible `/v1/chat/completions` endpoint does not expose raw integer token IDs. It exposes the token text and the byte representation (`[84, 104, 101]`). The UI explicitly marks Token IDs as unsupported.

## Context Usage / Prompt Tokens during Streaming
- **Supported via Workaround**: In standard OpenAI streams, the `usage` block is typically sent in the final chunk if `stream_options: { include_usage: true }` is specified. We enable this option and extract `prompt_tokens` once the generation completes. Live context usage is not available mid-stream.

## Probabilities & Sampling Configuration
- If sampling parameters (like high temperature, `top_p`, `top_k`) are adjusted, the displayed log probabilities represent the pre-sampling / normalized post-sampling distribution exposed by the API, but not necessarily the exact hidden internal state.
- Probabilities are displayed by simply taking the exponent of the log probability (`p = Math.exp(logprob)`).

## Virtualization
- The generated text view and timeline view currently render all tokens simultaneously. For extremely long generations (e.g. 5,000+ tokens), this may lead to high DOM node counts and slight degradation in responsiveness.

## Backend
- There is no separate backend proxy. The app relies on CORS being enabled in LM Studio, or it relies on local network permissiveness. LM Studio typically enables permissive CORS on the local API by default.
