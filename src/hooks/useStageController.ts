import { useState, useEffect, useCallback, useMemo } from 'react';
import { STAGES_CONFIG, MOCK_DATA } from '../data/mockPipeline';
import { PipelineStageId, CandidateLogit } from '../types';

export type AutoPlaySpeed = 'slow' | 'normal' | 'fast';

export function useStageController() {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<AutoPlaySpeed>('normal');
  
  // Interactive inspection states
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(1); // default "cat"
  const [selectedHeadIndex, setSelectedHeadIndex] = useState<number>(1); // default semantic head
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topK, setTopK] = useState<number>(5);
  const [topP, setTopP] = useState<number>(0.90);
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);
  const [winnerToken, setWinnerToken] = useState<string>(MOCK_DATA.outputToken);

  const currentStage = STAGES_CONFIG[activeStageIndex];
  const totalStages = STAGES_CONFIG.length;

  const goToStage = useCallback((index: number) => {
    if (index >= 0 && index < totalStages) {
      setActiveStageIndex(index);
    }
  }, [totalStages]);

  const nextStage = useCallback(() => {
    setActiveStageIndex((prev) => {
      if (prev < totalStages - 1) return prev + 1;
      setIsAutoPlaying(false);
      return prev;
    });
  }, [totalStages]);

  const prevStage = useCallback(() => {
    setActiveStageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const resetPipeline = useCallback(() => {
    setActiveStageIndex(0);
    setIsAutoPlaying(false);
    setTemperature(0.7);
    setTopK(5);
    setTopP(0.90);
    setWinnerToken(MOCK_DATA.outputToken);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  // Speed intervals (ms)
  const speedInterval = useMemo(() => {
    switch (speed) {
      case 'slow': return 3500;
      case 'normal': return 2000;
      case 'fast': return 1000;
    }
  }, [speed]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev < totalStages - 1) {
          return prev + 1;
        } else {
          setIsAutoPlaying(false);
          return prev;
        }
      });
    }, speedInterval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, speedInterval, totalStages]);

  // Dynamically calculate softmax probabilities when user tweaks temperature
  const dynamicLogits: CandidateLogit[] = useMemo(() => {
    const temp = Math.max(0.05, temperature);
    // Scaled logits
    const scaled = MOCK_DATA.logits.map((item) => ({
      ...item,
      scaledLogit: item.logit / temp
    }));
    const maxVal = Math.max(...scaled.map((s) => s.scaledLogit));
    const exps = scaled.map((s) => Math.exp(s.scaledLogit - maxVal));
    const sumExp = exps.reduce((acc, v) => acc + v, 0);

    return scaled.map((item, idx) => {
      const prob = exps[idx] / sumExp;
      return {
        rank: idx + 1,
        token: item.token,
        display: item.display,
        logit: item.logit,
        scaledLogit: item.scaledLogit,
        expVal: exps[idx],
        probability: prob,
        logprob: Math.log(Math.max(1e-9, prob)),
        isWinner: item.token === winnerToken
      };
    });
  }, [temperature, winnerToken]);

  // Roll dice animation for sampling
  const rollSamplingDice = useCallback(() => {
    setIsDiceRolling(true);
    setTimeout(() => {
      // Pick based on dynamic probabilities
      const pool = dynamicLogits.slice(0, topK);
      const poolSum = pool.reduce((acc, c) => acc + c.probability, 0);
      let rand = Math.random() * poolSum;
      let selected = pool[0];
      for (const cand of pool) {
        if (rand <= cand.probability) {
          selected = cand;
          break;
        }
        rand -= cand.probability;
      }
      setWinnerToken(selected.token);
      setIsDiceRolling(false);
    }, 600);
  }, [dynamicLogits, topK]);

  return {
    activeStageIndex,
    currentStage,
    stages: STAGES_CONFIG,
    totalStages,
    goToStage,
    nextStage,
    prevStage,
    resetPipeline,
    isAutoPlaying,
    toggleAutoPlay,
    speed,
    setSpeed,
    // Interactive states
    mockData: MOCK_DATA,
    selectedTokenIndex,
    setSelectedTokenIndex,
    selectedHeadIndex,
    setSelectedHeadIndex,
    temperature,
    setTemperature,
    topK,
    setTopK,
    topP,
    setTopP,
    dynamicLogits,
    winnerToken,
    isDiceRolling,
    rollSamplingDice
  };
}
