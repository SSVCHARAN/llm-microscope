import { useState, useRef, useCallback, useEffect } from 'react';
import { GenerationStep, GenerationMetrics, ApiEvent } from '../types';

let worker: Worker | null = null;
if (typeof window !== 'undefined') {
  worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
}

export function useMicroscope() {
  const [prompt, setPrompt] = useState('The quick brown fox');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{file: string, progress: number} | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [metrics, setMetrics] = useState<GenerationMetrics>({
    timeToFirstToken: null, totalTime: null, generatedTokens: 0,
    promptTokens: null, tokensPerSecond: null, averageLatency: null, currentLatency: null
  });

  const startTimeRef = useRef<number>(0);
  const tokenCountRef = useRef<number>(0);
  const lastTokenTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!worker) return;
    
    worker.postMessage({ action: 'load' });

    worker.onmessage = (event) => {
      const msg = event.data;
      
      if (msg.status === 'progress') {
        setLoadingProgress({ file: msg.file, progress: msg.progress });
      } 
      else if (msg.status === 'ready') {
        setIsEngineReady(true);
        setLoadingProgress(null);
        setEngineError(null);
      }
      else if (msg.status === 'error') {
        setEngineError(msg.error);
        setLoadingProgress(null);
        setIsGenerating(false);
      }
      else if (msg.status === 'init_context') {
        const contextSteps = msg.tokens.map((t: any, i: number) => ({
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
        setMetrics(m => ({ ...m, promptTokens: msg.tokens.length }));
      }
      else if (msg.status === 'chunk') {
        const now = performance.now();
        const deltaLatency = now - lastTokenTimeRef.current;
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
        
        setSteps(prev => [...prev, newStep]);
        setMetrics(m => ({
          ...m,
          generatedTokens: tokenCountRef.current,
          currentLatency: deltaLatency,
          averageLatency: cumulativeLatency / tokenCountRef.current,
          tokensPerSecond: tokenCountRef.current / (cumulativeLatency / 1000)
        }));
      }
      else if (msg.status === 'complete') {
        setIsGenerating(false);
        setMetrics(m => ({ ...m, totalTime: performance.now() - startTimeRef.current }));
      }
    };
  }, []);

  const startGeneration = useCallback(() => {
    if (!isEngineReady || !worker) return;
    
    setSteps([]);
    setEngineError(null);
    setMetrics({
      timeToFirstToken: null, totalTime: null, generatedTokens: 0,
      promptTokens: null, tokensPerSecond: null, averageLatency: null, currentLatency: null
    });
    setIsGenerating(true);

    startTimeRef.current = performance.now();
    lastTokenTimeRef.current = startTimeRef.current;
    tokenCountRef.current = 0;
    
    worker.postMessage({
      action: 'generate',
      text: prompt,
      max_new_tokens: 30
    });
  }, [isEngineReady, prompt]);
  
  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const checkConnection = useCallback(() => {}, []);
  const setSelectedModel = useCallback(() => {}, []);
  const isConnected = isEngineReady;
  const selectedModel = 'Xenova/LaMini-GPT-124M';

  return {
    models: [selectedModel],
    selectedModel,
    setSelectedModel,
    isConnected,
    checkConnection,
    prompt,
    setPrompt,
    isGenerating,
    startGeneration,
    stopGeneration,
    steps,
    metrics,
    events: [],
    loadingProgress,
    isEngineReady,
    engineError
  };
}
