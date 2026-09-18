import { useState, useEffect, useCallback } from 'react';
import { GenerationStep } from '../types';

export type PipelineStage = 'idle' | 'context' | 'inference' | 'logits' | 'prob_receive' | 'prob_reveal' | 'prob_identify' | 'prob_reorder' | 'prob_handoff' | 'selection' | 'token' | 'append';
export type PlaybackSpeed = '0.25x' | '0.5x' | '1x' | '2x' | 'LIVE';

const STAGES: PipelineStage[] = ['idle', 'context', 'inference', 'logits', 'prob_receive', 'prob_reveal', 'prob_identify', 'prob_reorder', 'prob_handoff', 'selection', 'token', 'append'];

export function usePipelineVisualizer(rawSteps: GenerationStep[], isGenerating: boolean) {
  const [visualizedSteps, setVisualizedSteps] = useState<GenerationStep[]>([]);
  const [currentAnimStep, setCurrentAnimStep] = useState<GenerationStep | null>(null);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [nextIndex, setNextIndex] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<PlaybackSpeed>('1x');
  
  // Visualization Metrics
  const [visStartTime, setVisStartTime] = useState<number | null>(null);
  const [visEndTime, setVisEndTime] = useState<number | null>(null);

  // Reset when starting a new generation
  useEffect(() => {
    if (isGenerating && rawSteps.length === 0) {
      setVisualizedSteps([]);
      setCurrentAnimStep(null);
      setStage('idle');
      setNextIndex(0);
      setIsPlaying(true);
      setVisStartTime(Date.now());
      setVisEndTime(null);
    }
  }, [isGenerating, rawSteps.length]);

  const queueLength = rawSteps.length - nextIndex;
  
  // Mark end time when caught up and model is done
  useEffect(() => {
    if (!isGenerating && rawSteps.length > 0 && queueLength === 0 && stage === 'idle') {
      if (!visEndTime) setVisEndTime(Date.now());
    } else {
      setVisEndTime(null);
    }
  }, [isGenerating, rawSteps.length, queueLength, stage, visEndTime]);

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
    if (currentStage === 'idle') return 50; // Quick poll when idle and playing
    
    let baseTime = 800;
    switch (speed) {
      case '0.25x': baseTime = 3200; break;
      case '0.5x': baseTime = 1600; break;
      case '1x': baseTime = 800; break;
      case '2x': baseTime = 400; break;
      case 'LIVE': return 20; // Blazing fast, essentially immediate
    }

    switch (currentStage) {
      case 'context': return baseTime * 0.15;
      case 'inference': return baseTime * 0.15;
      case 'logits': return baseTime * 0.15;
      case 'prob_receive': return baseTime * 0.5; // ~400ms at 1x
      case 'prob_reveal': return baseTime * 0.625; // ~500ms at 1x
      case 'prob_identify': return baseTime * 0.375; // ~300ms at 1x
      case 'prob_reorder': return baseTime * 0.75; // ~600ms at 1x
      case 'prob_handoff': return baseTime * 0.375; // ~300ms at 1x
      case 'selection': return baseTime * 0.15;
      case 'token': return baseTime * 0.10;
      case 'append': return baseTime * 0.05;
      default: return baseTime * 0.1;
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    
    // If we are idle and queue is empty, just wait.
    if (stage === 'idle' && queueLength === 0) {
      const timer = setTimeout(() => {}, 100);
      return () => clearTimeout(timer);
    }

    const delay = getDelayForStage(stage);
    const timer = setTimeout(() => {
      advancePhase();
    }, delay);

    return () => clearTimeout(timer);
  }, [stage, isPlaying, queueLength, speed, advancePhase]);

  const visualizationDuration = visStartTime 
    ? ((visEndTime || Date.now()) - visStartTime) / 1000 
    : 0;

  return {
    visualizedSteps,
    currentAnimStep,
    stage,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    requestStep: () => {
      setIsPlaying(false);
      advancePhase();
    },
    queueLength,
    baseTime: getDelayForStage('context') * (1/0.15), // estimate
    visualizationDuration,
    playbackStatus: isPlaying 
      ? (queueLength === 0 ? (isGenerating ? 'CAUGHT UP' : 'COMPLETE') : (queueLength > 0 && stage === 'idle' ? 'BUFFERING' : 'PLAYING'))
      : 'PAUSED'
  };
}
