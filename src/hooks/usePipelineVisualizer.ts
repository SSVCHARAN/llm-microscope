import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Refs for stable execution without effect dependency churn
  const rawStepsRef = useRef(rawSteps);
  rawStepsRef.current = rawSteps;

  const nextIndexRef = useRef(nextIndex);
  nextIndexRef.current = nextIndex;

  const currentAnimStepRef = useRef(currentAnimStep);
  currentAnimStepRef.current = currentAnimStep;

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

  const queueLength = Math.max(0, rawSteps.length - nextIndex);
  
  // Mark end time when caught up and model is done
  useEffect(() => {
    if (!isGenerating && rawSteps.length > 0 && queueLength === 0 && stage === 'idle') {
      if (!visEndTime) setVisEndTime(Date.now());
    } else {
      setVisEndTime(null);
    }
  }, [isGenerating, rawSteps.length, queueLength, stage, visEndTime]);

  const advancePhase = useCallback(() => {
    setStage((currentStage) => {
      if (currentStage === 'idle') {
        const steps = rawStepsRef.current;
        const idx = nextIndexRef.current;
        if (idx < steps.length) {
          setCurrentAnimStep(steps[idx]);
          return 'context';
        }
        return 'idle';
      } else if (currentStage === 'append') {
        const animStep = currentAnimStepRef.current;
        if (animStep) {
          setVisualizedSteps((prev) => {
            if (!prev.find((s) => s.index === animStep.index)) {
              return [...prev, animStep];
            }
            return prev;
          });
        }
        setNextIndex((prev) => prev + 1);
        return 'idle';
      } else {
        const idx = STAGES.indexOf(currentStage);
        return STAGES[idx + 1] as PipelineStage;
      }
    });
  }, []);

  const jumpToLive = useCallback(() => {
    const steps = rawStepsRef.current;
    if (steps.length > 0) {
      setVisualizedSteps(steps);
      setNextIndex(steps.length);
      setCurrentAnimStep(steps[steps.length - 1]);
      setStage('idle');
    }
  }, []);

  const getDelayForStage = (currentStage: PipelineStage) => {
    if (currentStage === 'idle') return 30; // Quick wake-up poll when idle
    
    if (speed === 'LIVE') {
      return 5; // Near instantaneous in LIVE mode
    }

    let baseTime = 900;
    switch (speed) {
      case '0.25x': baseTime = 3200; break;
      case '0.5x': baseTime = 1600; break;
      case '1x': baseTime = 900; break;
      case '2x': baseTime = 450; break;
    }

    switch (currentStage) {
      case 'context': return baseTime * 0.35; // ~315ms at 1x - clearly highlight context buffer
      case 'inference': return baseTime * 0.40; // ~360ms at 1x - show 768-D vectors and transformer computation
      case 'logits': return baseTime * 0.30; // ~270ms at 1x - show vocabulary logits
      case 'prob_receive': return baseTime * 0.40; // ~360ms at 1x
      case 'prob_reveal': return baseTime * 0.50; // ~450ms at 1x
      case 'prob_identify': return baseTime * 0.35; // ~315ms at 1x
      case 'prob_reorder': return baseTime * 0.55; // ~495ms at 1x
      case 'prob_handoff': return baseTime * 0.30; // ~270ms at 1x
      case 'selection': return baseTime * 0.35; // ~315ms at 1x - show winning candidate pick
      case 'token': return baseTime * 0.30; // ~270ms at 1x - show token
      case 'append': return baseTime * 0.25; // ~225ms at 1x - append to sequence
      default: return baseTime * 0.15;
    }
  };

  // Main animation timer: Advances stage when active
  useEffect(() => {
    if (!isPlaying) return;
    
    // If we are idle and queue is empty, do nothing until new tokens arrive
    if (stage === 'idle' && nextIndex >= rawStepsRef.current.length) {
      return;
    }

    const delay = getDelayForStage(stage);
    const timer = setTimeout(() => {
      advancePhase();
    }, delay);

    return () => clearTimeout(timer);
  }, [stage, isPlaying, speed, advancePhase]);

  // Wake up visualizer when idle and new tokens arrive in queue (stable boolean trigger)
  const hasQueuedTokens = rawSteps.length > nextIndex;
  useEffect(() => {
    if (!isPlaying) return;
    if (stage === 'idle' && hasQueuedTokens) {
      const timer = setTimeout(() => {
        advancePhase();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [hasQueuedTokens, isPlaying, stage, advancePhase]);

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
    jumpToLive,
    queueLength,
    baseTime: getDelayForStage('context') * (1/0.15), // estimate
    visualizationDuration,
    playbackStatus: isPlaying 
      ? (queueLength === 0 ? (isGenerating ? 'CAUGHT UP' : 'COMPLETE') : (queueLength > 0 && stage === 'idle' ? 'BUFFERING' : 'PLAYING'))
      : 'PAUSED'
  };
}
