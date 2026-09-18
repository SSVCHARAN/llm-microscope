import { useState, useEffect, useCallback, useRef } from 'react';
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
    // Determine the next state based on the current stage directly.
    // Avoid putting side effects (setNextIndex, setVisualizedSteps) inside a setStage functional updater,
    // because React Strict Mode will call the functional updater twice, skipping tokens!
    
    if (stage === 'idle') {
      if (nextIndex < rawSteps.length) {
        setCurrentAnimStep(rawSteps[nextIndex]);
        setStage('context');
      }
    } else if (stage === 'append') {
      if (currentAnimStep) {
        setVisualizedSteps(prev => {
          if (!prev.find(s => s.index === currentAnimStep.index)) {
            return [...prev, currentAnimStep];
          }
          return prev;
        });
      }
      setNextIndex(prev => prev + 1);
      setStage('idle');
    } else {
      const idx = STAGES.indexOf(stage);
      setStage(STAGES[idx + 1] as PipelineStage);
    }
  }, [stage, nextIndex, rawSteps, currentAnimStep]);

  const getDelayForStage = (currentStage: PipelineStage) => {
    if (currentStage === 'idle') return 50; 
    switch (currentStage) {
      case 'context': return 100;
      case 'inference': return 400; 
      case 'selection': return 300;
      case 'append': return 150;
      default: return 100;
    }
  };

  useEffect(() => {
    if (!isPlaying && queueLength > 0 && stage === 'idle') {
      return; 
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
