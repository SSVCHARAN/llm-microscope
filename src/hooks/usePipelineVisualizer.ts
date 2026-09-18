import { useState, useEffect, useCallback } from 'react';
import { GenerationStep } from '../types';

export type PipelineStage = 'idle' | 'context' | 'inference' | 'selection' | 'append';

const STAGES: PipelineStage[] = ['idle', 'context', 'inference', 'selection', 'append'];

export function usePipelineVisualizer(rawSteps: GenerationStep[], isGenerating: boolean) {
  const [visualizedSteps, setVisualizedSteps] = useState<GenerationStep[]>([]);
  const [currentAnimStep, setCurrentAnimStep] = useState<GenerationStep | null>(null);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [nextIndex, setNextIndex] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(true);

  // Reset when starting a new generation
  useEffect(() => {
    if (isGenerating && rawSteps.length === 0) {
      setVisualizedSteps([]);
      setCurrentAnimStep(null);
      setStage('idle');
      setNextIndex(0);
      setIsPlaying(true);
    }
  }, [isGenerating, rawSteps.length]);

  const queueLength = rawSteps.length - nextIndex;

  const advancePhase = useCallback(() => {
    setStage(currentStage => {
      if (currentStage === 'idle') {
        if (nextIndex < rawSteps.length) {
          setCurrentAnimStep(rawSteps[nextIndex]);
          return 'context';
        }
        return 'idle'; // Nothing to process
      }
      if (currentStage === 'append') {
        setVisualizedSteps(prev => {
          if (currentAnimStep && !prev.find(s => s.index === currentAnimStep.index)) {
            return [...prev, currentAnimStep];
          }
          return prev;
        });
        setNextIndex(prev => prev + 1);
        return 'idle';
      }
      const idx = STAGES.indexOf(currentStage);
      return STAGES[idx + 1] as PipelineStage;
    });
  }, [nextIndex, rawSteps, currentAnimStep]);

  const getDelayForStage = (currentStage: PipelineStage) => {
    if (currentStage === 'idle') return 50; 
    
    // Very snappy timings for a clear, rapid flow
    switch (currentStage) {
      case 'context': return 100;
      case 'inference': return 400; // Time for the network animation to flow
      case 'selection': return 300;
      case 'append': return 150;
      default: return 100;
    }
  };

  useEffect(() => {
    if (!isPlaying && queueLength > 0 && stage === 'idle') {
      return; // Paused at idle
    }
    if (!isPlaying && stage !== 'idle') {
      // Allow current token to finish its loop even if paused
    }

    const delay = getDelayForStage(stage);
    const timer = setTimeout(() => {
      advancePhase();
    }, delay);

    return () => clearTimeout(timer);
  }, [stage, isPlaying, queueLength, advancePhase]);

  return {
    visualizedSteps,
    currentAnimStep,
    stage,
    isPlaying,
    setIsPlaying
  };
}
