import { useState, useRef, useCallback } from 'react';
import { GenerationController, fetchModels } from '../api/lmstudio';
import { GenerationStep, GenerationMetrics, ApiEvent } from '../types';

export function useMicroscope() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  const [prompt, setPrompt] = useState('Why is the sky blue? Answer in one sentence.');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [metrics, setMetrics] = useState<GenerationMetrics>({
    timeToFirstToken: null,
    totalTime: null,
    generatedTokens: 0,
    promptTokens: null,
    tokensPerSecond: null,
    averageLatency: null,
    currentLatency: null
  });
  
  const [events, setEvents] = useState<ApiEvent[]>([]);
  
  const controllerRef = useRef<GenerationController | null>(null);
  
  const checkConnection = useCallback(async () => {
    try {
      const availableModels = await fetchModels();
      setModels(availableModels);
      setIsConnected(true);
      if (availableModels.length > 0 && (!selectedModel || selectedModel === 'mock-model')) {
        setSelectedModel(availableModels[0]);
      }
    } catch (e) {
      setIsConnected(false);
      setModels([]);
    }
  }, [selectedModel]);

  const startGeneration = useCallback(async () => {
    if (!selectedModel) return;
    
    // reset state
    setSteps([]);
    setEvents([]);
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

    const controller = new GenerationController();
    controllerRef.current = controller;
    
    let startTime = performance.now();
    let firstTokenTime: number | null = null;
    let lastTokenTime = startTime;
    let tokenCount = 0;
    
    controller.start({
      model: selectedModel,
      prompt
    }, {
      onStart: () => {
        startTime = performance.now();
        lastTokenTime = startTime;
      },
      onChunk: (text, logprobData) => {
        const now = performance.now();
        if (firstTokenTime === null) {
          firstTokenTime = now;
          setMetrics(m => ({ ...m, timeToFirstToken: now - startTime }));
        }
        
        const deltaLatency = now - lastTokenTime;
        const cumulativeLatency = now - startTime;
        lastTokenTime = now;
        
        tokenCount++;
        
        const probability = logprobData ? Math.exp(logprobData.logprob) : 0;
        
        const alternatives = logprobData?.top_logprobs.map(alt => ({
          token: alt.token,
          probability: Math.exp(alt.logprob),
          logProbability: alt.logprob
        })) || [];
        
        // Find rank of selected token
        let rank = 1;
        if (logprobData) {
          const sorted = [...alternatives].sort((a, b) => b.probability - a.probability);
          const foundIndex = sorted.findIndex(a => a.token === logprobData.token);
          if (foundIndex >= 0) {
            rank = foundIndex + 1;
          }
        }
        
        const newStep: GenerationStep = {
          index: tokenCount,
          tokenText: logprobData?.token || text, // Prefer token text from logprobs as it represents exactly what was selected
          probability,
          logProbability: logprobData?.logprob || 0,
          rank,
          alternatives,
          timestamp: now,
          deltaLatency,
          cumulativeLatency,
          isWhitespace: /^\s+$/.test(logprobData?.token || text)
        };
        
        setSteps(prev => [...prev, newStep]);
        setMetrics(m => ({
          ...m,
          generatedTokens: tokenCount,
          currentLatency: deltaLatency,
          averageLatency: cumulativeLatency / tokenCount,
          tokensPerSecond: tokenCount / (cumulativeLatency / 1000)
        }));
      },
      onUsage: (usage) => {
        setMetrics(m => ({
          ...m,
          promptTokens: usage.prompt_tokens,
          generatedTokens: usage.completion_tokens || m.generatedTokens
        }));
      },
      onEvent: (type, data) => {
        setEvents(prev => [...prev.slice(-99), {
          id: Math.random().toString(36).slice(2),
          type,
          data,
          timestamp: Date.now()
        }]);
      },
      onComplete: () => {
        setIsGenerating(false);
        const totalTime = performance.now() - startTime;
        setMetrics(m => ({ ...m, totalTime }));
      },
      onError: (err) => {
        setIsGenerating(false);
        setEvents(prev => [...prev, {
          id: Math.random().toString(36).slice(2),
          type: 'error',
          data: err.toString(),
          timestamp: Date.now()
        }]);
      }
    });
  }, [selectedModel, prompt]);
  
  const stopGeneration = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.stop();
      controllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  return {
    models,
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
    events
  };
}
