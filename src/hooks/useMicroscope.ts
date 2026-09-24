import { useState, useRef, useCallback, useEffect } from 'react';
import { GenerationStep, GenerationMetrics, ApiEvent, TokenChoice } from '../types';
import { GenerationController, fetchModels } from '../api/lmstudio';

export type EngineType = 'trace' | 'lmstudio' | 'webworker';

export const ONNX_MODELS = [
  'HuggingFaceTB/SmolLM2-135M-Instruct'
];

export function useMicroscope() {
  const [engineType, setEngineType] = useState<EngineType>('trace');
  const [prompt, setPrompt] = useState('The cat sat on the');
  const [isGenerating, setIsGenerating] = useState(false);

  // LM Studio state
  const [lmStudioModels, setLmStudioModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('mock-model');
  const [isLmStudioConnected, setIsLmStudioConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);

  // Web Worker state
  const [selectedOnnxModel, setSelectedOnnxModel] = useState<string>('HuggingFaceTB/SmolLM2-135M-Instruct');
  const selectedOnnxModelRef = useRef<string>('HuggingFaceTB/SmolLM2-135M-Instruct');
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{ file: string; progress: number } | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  // Generation data
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [metrics, setMetrics] = useState<GenerationMetrics>({
    timeToFirstToken: null,
    totalTime: null,
    generatedTokens: 0,
    promptTokens: null,
    tokensPerSecond: null,
    averageLatency: null,
    currentLatency: null
  });

  // Refs for timings & lifecycle
  const startTimeRef = useRef<number>(0);
  const firstTokenTimeRef = useRef<number | null>(null);
  const tokenCountRef = useRef<number>(0);
  const lastTokenTimeRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const generationControllerRef = useRef<GenerationController | null>(null);

  // Helper to append events capped at 100
  const appendEvent = useCallback((type: string, data: any) => {
    const newEvent: ApiEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      data,
      timestamp: Date.now()
    };
    setEvents((prev) => [newEvent, ...prev].slice(0, 100));
  }, []);

  // Check LM Studio connection
  const checkConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      const models = await fetchModels();
      if (models.length > 0 && models[0] !== 'mock-model') {
        setLmStudioModels(models);
        setSelectedModel((prev) => (models.includes(prev) ? prev : models[0]));
        setIsLmStudioConnected(true);
        appendEvent('connection_success', { endpoint: 'http://127.0.0.1:1234', models });
      } else {
        setIsLmStudioConnected(false);
        setLmStudioModels(['mock-model']);
        setSelectedModel('mock-model');
      }
    } catch (e) {
      setIsLmStudioConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [appendEvent]);

  // Check LM Studio on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Initialize Web Worker when engineType === 'webworker'
  useEffect(() => {
    if (engineType !== 'webworker') return;
    if (workerRef.current) return;

    try {
      const w = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = w;

      w.postMessage({ action: 'load', modelId: selectedOnnxModelRef.current });

      w.onmessage = (event) => {
        const msg = event.data;

        if (msg.status === 'progress') {
          setLoadingProgress({ file: msg.file, progress: msg.progress });
        } else if (msg.status === 'ready') {
          setIsEngineReady(true);
          setLoadingProgress(null);
          setEngineError(null);
          appendEvent('worker_ready', { model: msg.model || selectedOnnxModelRef.current });
        } else if (msg.status === 'error') {
          setEngineError(msg.error);
          setLoadingProgress(null);
          setIsGenerating(false);
          appendEvent('worker_error', { error: msg.error });
        } else if (msg.status === 'init_context') {
          const contextSteps: GenerationStep[] = msg.tokens.map((t: any, i: number) => ({
            index: -msg.tokens.length + i,
            tokenText: t.text,
            probability: 1,
            logProbability: 0,
            rank: 1,
            alternatives: [],
            timestamp: performance.now(),
            deltaLatency: 0,
            cumulativeLatency: 0,
            isWhitespace: /^\s+$/.test(t.text)
          }));
          setSteps(contextSteps);
          setMetrics((m) => ({ ...m, promptTokens: msg.tokens.length }));
          appendEvent('init_context', { tokens: msg.tokens });
        } else if (msg.status === 'chunk') {
          const now = performance.now();
          if (firstTokenTimeRef.current === null) {
            firstTokenTimeRef.current = now;
          }
          const deltaLatency = lastTokenTimeRef.current > 0 ? now - lastTokenTimeRef.current : 0;
          const cumulativeLatency = now - startTimeRef.current;
          lastTokenTimeRef.current = now;
          tokenCountRef.current++;

          const newStep: GenerationStep = {
            index: tokenCountRef.current,
            tokenText: msg.token_text,
            probability: 1,
            logProbability: 0,
            rank: 1,
            alternatives: msg.alternatives || [
              { token: msg.token_text, probability: 1, logProbability: 0 },
              { token: `ID: ${msg.token_id}`, probability: 0, logProbability: -1 }
            ],
            timestamp: now,
            deltaLatency,
            cumulativeLatency,
            isWhitespace: /^\s+$/.test(msg.token_text)
          };

          setSteps((prev) => [...prev, newStep]);
          appendEvent('token_chunk', { token: msg.token_text, alternatives: msg.alternatives });

          setMetrics((m) => ({
            ...m,
            timeToFirstToken: firstTokenTimeRef.current !== null ? firstTokenTimeRef.current - startTimeRef.current : null,
            generatedTokens: tokenCountRef.current,
            currentLatency: deltaLatency,
            averageLatency: cumulativeLatency / Math.max(1, tokenCountRef.current),
            tokensPerSecond: tokenCountRef.current / (Math.max(1, cumulativeLatency) / 1000)
          }));
        } else if (msg.status === 'complete') {
          setIsGenerating(false);
          const totalTime = performance.now() - startTimeRef.current;
          setMetrics((m) => ({ ...m, totalTime }));
          appendEvent('generation_complete', { totalTokens: tokenCountRef.current, totalTimeMs: totalTime });
        }
      };
    } catch (e) {
      setEngineError(String(e));
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setIsEngineReady(false);
        setLoadingProgress(null);
      }
    };
  }, [engineType, appendEvent]);

  // Start generation across active engine
  const startGeneration = useCallback(() => {
    setSteps([]);
    setEngineError(null);
    setMetrics({
      timeToFirstToken: null,
      totalTime: null,
      generatedTokens: 0,
      promptTokens: null,
      tokensPerSecond: null,
      averageLatency: null,
      currentLatency: null
    });
    setIsGenerating(true);

    startTimeRef.current = performance.now();
    firstTokenTimeRef.current = null;
    lastTokenTimeRef.current = startTimeRef.current;
    tokenCountRef.current = 0;

    appendEvent('generation_start', { engine: engineType, prompt });

    // Mode 1: Web Worker
    if (engineType === 'webworker') {
      if (!workerRef.current || !isEngineReady) {
        setEngineError('Web Worker model is still loading into browser memory.');
        setIsGenerating(false);
        return;
      }
      workerRef.current.postMessage({
        action: 'generate',
        text: prompt,
        max_new_tokens: 30
      });
      return;
    }

    // Mode 2 & 3: LM Studio API or Trace Playback
    if (!generationControllerRef.current) {
      generationControllerRef.current = new GenerationController();
    }

    const targetModel = engineType === 'trace' ? 'mock-model' : selectedModel;

    generationControllerRef.current.start(
      {
        model: targetModel,
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 300
      },
      {
        onStart: () => {
          appendEvent('stream_started', { model: targetModel });
        },
        onChunk: (text: string, logprobData: TokenChoice | null) => {
          const tokenText = text || logprobData?.token || '';
          if (!tokenText) return;

          const now = performance.now();
          if (firstTokenTimeRef.current === null) {
            firstTokenTimeRef.current = now;
          }
          const deltaLatency = lastTokenTimeRef.current > 0 ? now - lastTokenTimeRef.current : 0;
          const cumulativeLatency = now - startTimeRef.current;
          lastTokenTimeRef.current = now;
          tokenCountRef.current++;

          const logprob = logprobData?.logprob ?? 0;
          const prob = logprobData ? Math.exp(logprob) : 1;

          let rank = 1;
          let alternatives = [{ token: tokenText, probability: prob, logProbability: logprob }];

          if (logprobData?.top_logprobs && logprobData.top_logprobs.length > 0) {
            alternatives = logprobData.top_logprobs.map((alt) => ({
              token: alt.token,
              probability: Math.exp(alt.logprob),
              logProbability: alt.logprob
            }));
            const foundRank = alternatives.findIndex((a) => a.token === tokenText);
            rank = foundRank >= 0 ? foundRank + 1 : 1;
          }

          const newStep: GenerationStep = {
            index: tokenCountRef.current,
            tokenText,
            probability: prob,
            logProbability: logprob,
            rank,
            alternatives,
            timestamp: now,
            deltaLatency,
            cumulativeLatency,
            isWhitespace: /^\s+$/.test(tokenText)
          };

          setSteps((prev) => [...prev, newStep]);

          setMetrics((m) => ({
            ...m,
            timeToFirstToken: firstTokenTimeRef.current !== null ? firstTokenTimeRef.current - startTimeRef.current : null,
            generatedTokens: tokenCountRef.current,
            currentLatency: deltaLatency,
            averageLatency: cumulativeLatency / Math.max(1, tokenCountRef.current),
            tokensPerSecond: tokenCountRef.current / (Math.max(1, cumulativeLatency) / 1000)
          }));
        },
        onUsage: (usage) => {
          if (usage.prompt_tokens !== undefined) {
            setMetrics((m) => ({ ...m, promptTokens: usage.prompt_tokens }));
          }
          appendEvent('usage_report', usage);
        },
        onEvent: (type, data) => {
          appendEvent(type, data);
        },
        onComplete: () => {
          setIsGenerating(false);
          const totalTime = performance.now() - startTimeRef.current;
          setMetrics((m) => ({ ...m, totalTime }));
          appendEvent('generation_complete', { totalTokens: tokenCountRef.current, totalTimeMs: totalTime });
        },
        onError: (err) => {
          setIsGenerating(false);
          setEngineError(err.message);
          appendEvent('stream_error', { message: err.message });
        }
      }
    );
  }, [engineType, isEngineReady, prompt, selectedModel, appendEvent]);

  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    if (generationControllerRef.current) {
      generationControllerRef.current.stop();
    }
    if (workerRef.current && engineType === 'webworker') {
      workerRef.current.postMessage({ action: 'stop' });
    }
    appendEvent('generation_aborted', {});
  }, [engineType, appendEvent]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const isConnected = engineType === 'lmstudio' ? isLmStudioConnected : engineType === 'webworker' ? isEngineReady : true;

  const models = engineType === 'lmstudio'
    ? lmStudioModels
    : engineType === 'webworker'
    ? ONNX_MODELS
    : ['Showcase Mock Trace'];

  const currentSelectedModel = engineType === 'webworker'
    ? selectedOnnxModel
    : engineType === 'lmstudio'
    ? selectedModel
    : 'mock-model';

  const handleSetSelectedModel = useCallback((model: string) => {
    if (engineType === 'webworker') {
      setSelectedOnnxModel(model);
      selectedOnnxModelRef.current = model;
      setIsEngineReady(false);
      setLoadingProgress({ file: model.split('/').pop() || model, progress: 0 });
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'load', modelId: model });
      }
    } else {
      setSelectedModel(model);
    }
  }, [engineType]);

  return {
    engineType,
    setEngineType,
    models,
    selectedModel: currentSelectedModel,
    setSelectedModel: handleSetSelectedModel,
    isConnected,
    isLmStudioConnected,
    isCheckingConnection,
    checkConnection,
    prompt,
    setPrompt,
    isGenerating,
    startGeneration,
    stopGeneration,
    steps,
    metrics,
    events,
    clearEvents,
    loadingProgress,
    isEngineReady,
    engineError
  };
}
