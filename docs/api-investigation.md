# API Investigation

## Tested Endpoints
- `GET /api/v1/models` (LM Studio specific)
- `GET /v1/models` (OpenAI compatible)
- `POST /v1/chat/completions` (OpenAI compatible)

## Actual Requests & Responses
- `GET /v1/models` provides a list of models with their `id`s.
- `POST /v1/chat/completions` accepts `stream: true`, `logprobs: true`, `top_logprobs: <N>`, and `stream_options: {"include_usage": true}`.
- The streaming response format is standard OpenAI SSE format `data: {...}`.
- Each chunk contains `choices[0].delta.content`.
- When `logprobs: true` is passed, each chunk contains `choices[0].logprobs.content`. This is an array with objects of structure:
  ```json
  {
    "token": "...",
    "logprob": -0.33,
    "bytes": [32, 97],
    "top_logprobs": [
      {
        "token": "...",
        "logprob": -0.33,
        "bytes": [32, 97]
      }
    ]
  }
  ```
- Streaming responses with `include_usage: true` include a final chunk with a `usage` block containing `prompt_tokens`, `completion_tokens`, and `total_tokens`.

## Supported Features
- Streaming: Yes
- Token-level text data: Yes
- Token log probabilities: Yes
- Top candidates and their log probabilities: Yes (via `top_logprobs`)
- Low latency chunking: Yes
- Usage data: Yes (via `stream_options.include_usage`)
- Finish reasons: Yes
- Model identifiers: Yes

## Unsupported Features
- `token_id` (integer) is NOT directly provided in the `/v1/chat/completions` logprobs response (we get token text and bytes, but not the dictionary IDs). We will report token IDs as unavailable.

## Chosen Endpoint
- `POST /v1/chat/completions`
- **Why**: It is the standard interface that reliably supports streaming generation with log probabilities, candidate tokens, and usage metrics in LM Studio.

## Tokenizer Strategy
The API does not expose a `/tokenize` endpoint or provide token IDs in the chat completion stream. The token boundaries are implicitly defined by the stream chunks when `logprobs` are enabled (one chunk = one token, typically). We will visualize tokenization using the stream chunks directly, and report Token IDs as "Unsupported by API".
