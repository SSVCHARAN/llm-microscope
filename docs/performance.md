# Performance Decisions

Building a tool that traces a high-throughput stream of tokens requires careful performance considerations so that the visualization tool itself doesn't become the bottleneck.

## Streaming vs Polling
We rely exclusively on Server-Sent Events (SSE) streaming rather than polling. We do not fetch the full generated response repeatedly. We parse exactly the delta chunk as it arrives.

## String Concatenation & Diffing
We do not perform expensive string diffing to figure out what was generated. The API gives us exactly the newly selected token in the SSE delta, which we directly map to a `GenerationStep` record.

## Memory & State Management
- **Raw Events Buffer**: We cap the raw SSE event list to the last 100 events to prevent massive memory usage.
- **Stable References**: The timeline is updated by simply appending to an array. 

## Renders
To prevent cascading re-renders, the token timeline maps each step to a specific React Node. Currently, virtualization is not implemented since the typical test sizes (hundreds of tokens) do not stress modern DOMs enough to justify the complexity overhead of a virtualized list, but it is an identified architectural improvement for very long sessions (e.g. >10,000 tokens).
