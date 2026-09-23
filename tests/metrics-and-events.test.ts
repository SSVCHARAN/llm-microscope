import test from 'node:test';
import assert from 'node:assert/strict';

interface GenerationMetrics {
  timeToFirstToken: number | null;
  totalTime: number | null;
  generatedTokens: number;
  tokensPerSecond: number | null;
  averageLatency: number | null;
  currentLatency: number | null;
}

function calculateMetrics(
  startTime: number,
  tokenTimestamps: number[]
): GenerationMetrics {
  if (tokenTimestamps.length === 0) {
    return {
      timeToFirstToken: null,
      totalTime: null,
      generatedTokens: 0,
      tokensPerSecond: null,
      averageLatency: null,
      currentLatency: null
    };
  }

  const ttft = tokenTimestamps[0] - startTime;
  const lastTimestamp = tokenTimestamps[tokenTimestamps.length - 1];
  const totalDurationMs = lastTimestamp - startTime;
  const generatedTokens = tokenTimestamps.length;

  const latencies: number[] = [];
  latencies.push(ttft);
  for (let i = 1; i < tokenTimestamps.length; i++) {
    latencies.push(tokenTimestamps[i] - tokenTimestamps[i - 1]);
  }

  const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const currentLatency = latencies[latencies.length - 1];
  const tokensPerSecond = totalDurationMs > 0 ? (generatedTokens / totalDurationMs) * 1000 : 0;

  return {
    timeToFirstToken: ttft,
    totalTime: totalDurationMs,
    generatedTokens,
    tokensPerSecond: Number(tokensPerSecond.toFixed(1)),
    averageLatency: Math.round(averageLatency),
    currentLatency: Math.round(currentLatency)
  };
}

test('Metrics - Calculates TTFT, totalTime, throughput, and average latency correctly', () => {
  const startTime = 1000;
  // Tokens emitted at 1050 (TTFT = 50ms), 1100 (+50ms), 1150 (+50ms), 1200 (+50ms)
  const tokenTimestamps = [1050, 1100, 1150, 1200];

  const metrics = calculateMetrics(startTime, tokenTimestamps);

  assert.equal(metrics.timeToFirstToken, 50);
  assert.equal(metrics.totalTime, 200);
  assert.equal(metrics.generatedTokens, 4);
  assert.equal(metrics.averageLatency, 50);
  assert.equal(metrics.currentLatency, 50);
  // 4 tokens in 200ms = 20 tokens/sec
  assert.equal(metrics.tokensPerSecond, 20.0);
});

test('Event Buffer - Truncates at max size (100 events) without memory leak', () => {
  const MAX_EVENTS = 100;
  let eventBuffer: number[] = [];

  for (let i = 0; i < 250; i++) {
    eventBuffer = [...eventBuffer.slice(-MAX_EVENTS + 1), i];
  }

  assert.equal(eventBuffer.length, MAX_EVENTS);
  assert.equal(eventBuffer[0], 150);
  assert.equal(eventBuffer[MAX_EVENTS - 1], 249);
});

test('SSE Chunk Parsing - Extracts text from content, reasoning_content, and thought variants', () => {
  function extractChunkText(choice: any): string {
    const delta = choice.delta || {};
    return delta.content && delta.reasoning_content
      ? `${delta.reasoning_content}${delta.content}`
      : (delta.content ?? delta.reasoning_content ?? delta.reasoning ?? delta.thought ?? choice.text ?? '');
  }

  // Standard model chunk
  assert.equal(extractChunkText({ delta: { content: 'hello' } }), 'hello');

  // Gemma / DeepSeek reasoning model chunk
  assert.equal(extractChunkText({ delta: { reasoning_content: 'Thinking' } }), 'Thinking');
  assert.equal(extractChunkText({ delta: { reasoning: 'step 1' } }), 'step 1');
  assert.equal(extractChunkText({ delta: { thought: 'ponder' } }), 'ponder');

  // Legacy completions chunk
  assert.equal(extractChunkText({ text: 'completion text' }), 'completion text');

  // Empty delta
  assert.equal(extractChunkText({ delta: {} }), '');
});

