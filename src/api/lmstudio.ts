import { TokenChoice } from '../types/index.ts';
import mockTraceData from '../data/mockTrace.json';

let resolvedApiBase = '/lmstudio';

export function getApiBase(): string {
  return resolvedApiBase;
}

export async function fetchModels(): Promise<string[]> {
  const candidateBases = ['/lmstudio', 'http://127.0.0.1:1234'];
  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/v1/models`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          resolvedApiBase = base;
          return data.data.map((m: any) => m.id);
        }
      }
    } catch {
      // Continue to next candidate
    }
  }
  return ['mock-model'];
}

export interface StreamCallbacks {
  onStart: () => void;
  onChunk: (text: string, logprobData: TokenChoice | null) => void;
  onUsage: (usage: any) => void;
  onEvent: (type: string, data: any) => void;
  onComplete: () => void;
  onError: (err: Error) => void;
}

export interface GenerationParams {
  model: string;
  prompt: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  seed?: number;
}

export class GenerationController {
  private abortController: AbortController | null = null;

  async start(params: GenerationParams, callbacks: StreamCallbacks) {
    this.abortController = new AbortController();
    
    if (params.model === 'mock-model') {
      this.generateMock(params, callbacks);
      return;
    }

    try {
      const res = await fetch(`${getApiBase()}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: this.abortController.signal,
        body: JSON.stringify({
          model: params.model,
          messages: [{ role: 'user', content: params.prompt }],
          stream: true,
          stream_options: { include_usage: true },
          logprobs: true,
          top_logprobs: 10,
          temperature: params.temperature ?? 0.7,
          top_p: params.top_p ?? 1.0,
          max_tokens: params.max_tokens,
          seed: params.seed,
        })
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status} ${res.statusText}`);
      }

      callbacks.onStart();

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIdx;
        while ((newlineIdx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);

          if (!line) continue;

          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              callbacks.onEvent('stream_done', { type: 'done' });
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              callbacks.onEvent('chunk', parsed);

              if (parsed.usage) {
                callbacks.onUsage(parsed.usage);
              }

              if (parsed.choices && parsed.choices.length > 0) {
                const choice = parsed.choices[0];
                const delta = choice.delta || {};
                const text =
                  delta.content && delta.reasoning_content
                    ? `${delta.reasoning_content}${delta.content}`
                    : (delta.content ?? delta.reasoning_content ?? delta.reasoning ?? delta.thought ?? choice.text ?? '');
                
                let tokenLogprob: TokenChoice | null = null;
                if (choice.logprobs?.content?.length > 0) {
                  tokenLogprob = choice.logprobs.content[0];
                }

                if (text || tokenLogprob) {
                  callbacks.onChunk(text, tokenLogprob);
                }
              }
            } catch (e) {
              console.warn('Failed to parse SSE line', line, e);
              callbacks.onEvent('parse_error', { line, error: String(e) });
            }
          }
        }
      }
      callbacks.onComplete();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onEvent('aborted', {});
      } else {
        callbacks.onError(err);
      }
    } finally {
      this.abortController = null;
    }
  }

  private async generateMock(params: GenerationParams, callbacks: StreamCallbacks) {
    callbacks.onStart();
    let tokenCount = 0;
    
    const streamLoop = async () => {
      for (const step of mockTraceData) {
        if (!this.abortController) return;
        
        // Simulate realistic latency (~60-90ms per token for flight recorder mock stream)
        await new Promise(r => setTimeout(r, 60 + Math.random() * 30));
        if (!this.abortController) return;
        
        const tokenText = step.tokenText;
        const logprobData = step.logprobData ? {
          token: step.logprobData.token,
          logprob: step.logprobData.logprob,
          bytes: [],
          top_logprobs: step.logprobData.top_logprobs.map((alt: any) => ({
            token: alt.token,
            logprob: alt.logprob,
            bytes: []
          }))
        } : null;
        
        callbacks.onEvent('chunk', { mock: true, token: tokenText });
        callbacks.onChunk(tokenText, logprobData);
        
        tokenCount++;
      }
      
      if (this.abortController) {
        callbacks.onUsage({ prompt_tokens: 24, completion_tokens: tokenCount });
        callbacks.onEvent('stream_done', { type: 'done' });
        callbacks.onComplete();
        this.abortController = null;
      }
    };
    
    streamLoop();
  }

  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
