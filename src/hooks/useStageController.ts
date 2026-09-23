import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { STAGES_CONFIG, MOCK_DATA } from '../data/mockPipeline';
import { PipelineStageId, CandidateLogit } from '../types';
import { STAGE_PHASE_COUNTS } from '../types/autoplay';
import { BASE_PHASE_DURATION_MS, SPEED_MULTIPLIERS } from '../motion/tokens';

export type AutoPlaySpeed = 'slow' | 'normal' | 'fast';
export { STAGE_PHASE_COUNTS };

export function useStageController() {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<AutoPlaySpeed>('normal');
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  
  // Interactive inspection states
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(1); // default "cat"
  const [selectedHeadIndex, setSelectedHeadIndex] = useState<number>(1); // default semantic head
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topK, setTopK] = useState<number>(5);
  const [topP, setTopP] = useState<number>(0.90);
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);
  const [winnerToken, setWinnerToken] = useState<string>(MOCK_DATA.outputToken);

  // Timer ref for setTimeout chain (not setInterval)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStage = STAGES_CONFIG[activeStageIndex];
  const totalStages = STAGES_CONFIG.length;

  // ─── Derived autoplay values ─────────────────────────────────────
  const currentStagePhaseCount = STAGE_PHASE_COUNTS[currentStage.id] ?? 1;

  const speedMultiplier = useMemo(() => SPEED_MULTIPLIERS[speed], [speed]);

  const phaseDuration = useMemo(
    () => BASE_PHASE_DURATION_MS * speedMultiplier,
    [speedMultiplier],
  );

  // Global progress: 0.0 → 1.0 across all stages + phases
  const totalPhases = useMemo(
    () =>
      STAGES_CONFIG.reduce(
        (sum, s) => sum + (STAGE_PHASE_COUNTS[s.id] ?? 1),
        0,
      ),
    [],
  );

  const completedPhases = useMemo(() => {
    let count = 0;
    for (let i = 0; i < activeStageIndex; i++) {
      count += STAGE_PHASE_COUNTS[STAGES_CONFIG[i].id] ?? 1;
    }
    return count + currentPhase;
  }, [activeStageIndex, currentPhase]);

  const globalProgress = totalPhases > 0 ? completedPhases / totalPhases : 0;

  // ─── Navigation ──────────────────────────────────────────────────
  const goToStage = useCallback((index: number) => {
    if (index >= 0 && index < totalStages) {
      setActiveStageIndex(index);
      setCurrentPhase(0); // Reset phase on manual jump
    }
  }, [totalStages]);

  const nextStage = useCallback(() => {
    setActiveStageIndex((prev) => {
      if (prev < totalStages - 1) return prev + 1;
      setIsAutoPlaying(false);
      return prev;
    });
    setCurrentPhase(0);
  }, [totalStages]);

  const prevStage = useCallback(() => {
    setActiveStageIndex((prev) => Math.max(0, prev - 1));
    setCurrentPhase(0);
  }, []);

  const resetPipeline = useCallback(() => {
    setActiveStageIndex(0);
    setCurrentPhase(0);
    setIsAutoPlaying(false);
    setTemperature(0.7);
    setTopK(5);
    setTopP(0.90);
    setWinnerToken(MOCK_DATA.outputToken);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  // ─── Autoplay: setTimeout chain (replaces old setInterval) ───────
  useEffect(() => {
    if (!isAutoPlaying) {
      // Clear any pending timer when paused
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      const stageId = STAGES_CONFIG[activeStageIndex].id;
      const maxPhases = STAGE_PHASE_COUNTS[stageId] ?? 1;

      if (currentPhase < maxPhases - 1) {
        // Advance to next phase within current stage
        setCurrentPhase((prev) => prev + 1);
      } else if (activeStageIndex < totalStages - 1) {
        // Advance to next stage, reset phase
        setActiveStageIndex((prev) => prev + 1);
        setCurrentPhase(0);
      } else {
        // Reached the end of the final stage
        setIsAutoPlaying(false);
      }
    }, phaseDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAutoPlaying, activeStageIndex, currentPhase, phaseDuration, totalStages]);

  // ─── Dynamically calculate softmax probabilities ─────────────────
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
    // Phase-aware autoplay
    currentPhase,
    currentStagePhaseCount,
    globalProgress,
    totalPhases,
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
