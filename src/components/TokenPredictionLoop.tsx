import React, { useEffect, useState } from 'react';
import { GenerationStep } from '../types';
import { PipelineStage } from '../hooks/usePipelineVisualizer';
import { HyperText } from './HyperText';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Layers, Sparkles, Cpu, BarChart3, ArrowDown } from 'lucide-react';

interface Props {
  stage: PipelineStage;
  step: GenerationStep | null;
  promptTokens: number | null;
  visualizedSteps: GenerationStep[];
}

export function TokenPredictionLoop({ stage, step, promptTokens, visualizedSteps }: Props) {
  const [, setAnimKey] = useState(0);

  useEffect(() => {
    if (step) setAnimKey((prev) => prev + 1);
  }, [step?.index]);

  const formatProb = (p: number) => (p * 100).toFixed(1) + '%';

  // Pipeline stages: Context -> Model -> Probabilities -> Selection -> Append
  // When idle and a step is provided (static inspect or live stream fallback), treat all stages as completed
  const isStaticStep = stage === 'idle' && step !== null;
  const isContext = isStaticStep || stage === 'idle' || stage === 'context';
  const isModel = isStaticStep || stage === 'inference' || stage === 'logits';
  const isProbAny = isStaticStep || stage.startsWith('prob_');
  const isSelect = isStaticStep || stage === 'selection' || stage === 'token';
  const isAppend = isStaticStep || stage === 'append';

  // Helper to render recent context window
  const renderContext = (includeCurrentStep: boolean) => {
    const recent = visualizedSteps.slice(-5);
    const count = (promptTokens || 0) + visualizedSteps.length - recent.length;
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono bg-surface-raised p-3 rounded-lg border border-border shadow-inner">
        {count > 0 && (
          <span className="text-text-muted bg-surface-subtle px-2 py-1 rounded border border-border-subtle text-[10px] tracking-wider uppercase mr-1">
            +{count} tokens
          </span>
        )}
        {recent.map((s, i) => (
          <span
            key={i}
            className="text-text-main bg-surface hover:bg-surface-subtle transition-colors px-2 py-1 rounded border border-border"
          >
            {s.tokenText.replace(/\n/g, '↵') || '␣'}
          </span>
        ))}
        {includeCurrentStep && step && (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-emerald-800 dark:text-emerald-300 font-bold bg-primary-500/20 px-2 py-1 rounded border border-primary-500/40 shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            {step.tokenText.replace(/\n/g, '↵') || '␣'}
          </motion.span>
        )}
      </div>
    );
  };

  const Connector = ({ active, handoff = false }: { active: boolean; handoff?: boolean }) => (
    <div className="flex justify-center py-2 relative" aria-hidden="true">
      <div
        className={`w-0.5 h-6 transition-colors duration-500 relative overflow-hidden ${
          active ? 'bg-primary-500/30' : 'bg-border'
        }`}
      >
        <div
          className={`absolute top-0 left-0 w-full bg-primary-500 shadow-sm dark:shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all duration-300 ${
            active ? 'h-full' : 'h-0'
          }`}
        />
        {handoff && (
          <motion.div
            initial={{ top: -10 }}
            animate={{ top: 24 }}
            transition={{ duration: 0.35, ease: 'linear' }}
            className="absolute left-0 w-full h-2 bg-emerald-600 dark:bg-emerald-300 rounded-full shadow-[0_0_10px_rgba(5,150,105,0.8)] dark:shadow-[0_0_10px_rgba(16,185,129,1)]"
          />
        )}
      </div>
    </div>
  );

  const getStatusIcon = (isActive: boolean, isPast: boolean) => {
    if (isActive) return <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-sm dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]" />;
    if (isPast) return <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />;
    return <Circle className="w-3.5 h-3.5 text-text-muted/40" />;
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-0 shadow-sm dark:shadow-2xl relative overflow-hidden min-h-[700px] font-sans">
      {/* 1. CONTEXT BUFFER */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isContext ? 'opacity-100' : 'opacity-65'}`}>
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-mono font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isContext, !isContext)}
          <span className={isContext ? 'text-text-main font-bold' : 'text-text-muted'}>1. Context Buffer</span>
          <span className="ml-auto text-[10px] text-text-muted font-normal lowercase">Input tokens accumulated so far</span>
        </div>
        <div
          className={`transition-all duration-500 rounded-xl p-1.5 ${
            isContext ? 'bg-primary-500/[0.04] border border-primary-500/30' : 'border border-transparent'
          }`}
        >
          {renderContext(false)}
        </div>
      </div>

      <Connector active={isModel || isContext} />

      {/* 2. MODEL PROCESSING */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isModel ? 'opacity-100' : 'opacity-65'}`}>
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-mono font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isModel, isProbAny || isSelect || isAppend)}
          <span className={isModel ? 'text-text-main font-bold' : 'text-text-muted'}>2. Transformer Forward Pass</span>
          <span className="ml-auto text-[10px] text-text-muted font-normal lowercase">Attention & MLP layer computation</span>
        </div>
        <div className="bg-surface-raised border border-border rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-inner">
          <div
            className={`flex flex-col items-center gap-3 transition-all duration-700 ${
              isModel ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'
            }`}
          >
            {/* Context Vector representation */}
            <div className="flex items-center justify-between w-full max-w-[320px]">
              <div className={`text-[10px] font-mono tracking-wider uppercase ${isModel ? 'text-primary-600 dark:text-emerald-400 font-bold' : 'text-text-muted'}`}>
                Embedding Space (768-D)
              </div>
              <div className="flex gap-[2px]">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3.5 rounded-[1px] transition-colors duration-500 ${
                      isModel ? 'bg-primary-500/70 shadow-sm dark:shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'bg-surface-subtle border border-border-subtle'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Attention / MLP layers */}
            <div
              className={`w-full max-w-[320px] border rounded-lg p-2.5 text-center flex flex-col gap-1.5 transition-all duration-500 ${
                isModel && stage === 'inference'
                  ? 'border-primary-500/50 bg-primary-500/10 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] font-mono tracking-wider uppercase ${isModel && stage === 'inference' ? 'text-primary-700 dark:text-emerald-300 font-bold' : 'text-text-muted'}`}>
                  Transformer Blocks
                </span>
                <span className="text-[9px] font-mono text-text-muted">12 Heads × QKV</span>
              </div>
              <div className="flex justify-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm transition-colors duration-300 ${
                      isModel && stage === 'inference' ? 'bg-primary-500/80 animate-pulse' : 'bg-surface-subtle border border-border-subtle'
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Logits output representation */}
            <div className="flex items-center justify-between w-full max-w-[320px]">
              <div className={`text-[10px] font-mono tracking-wider uppercase ${isModel && stage === 'logits' ? 'text-primary-600 dark:text-emerald-400 font-bold' : 'text-text-muted'}`}>
                Vocabulary Logits (50,257)
              </div>
              <div className="flex gap-[2px] items-end h-5">
                {[4, 2, 8, 3, 5, 1, 10, 2, 6, 4].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-[1px] transition-all duration-500 ${
                      isModel && stage === 'logits' ? 'bg-primary-500 shadow-sm dark:shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-surface-subtle border border-border-subtle'
                    }`}
                    style={{ height: `${h * 10}%`, animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Connector active={isProbAny || isModel} />

      {/* 3. NEXT TOKEN PROBABILITIES */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isProbAny || isSelect || isAppend ? 'opacity-100' : 'opacity-65'}`}>
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-mono font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isProbAny, isSelect || isAppend)}
          <span className={isProbAny ? 'text-text-main font-bold' : 'text-text-muted'}>3. Next Token Probability Distribution</span>
          <span className="ml-auto text-[10px] text-text-muted font-normal lowercase">Live Top Candidates</span>
        </div>

        <div className="w-full bg-surface-raised border border-border rounded-xl p-3.5 relative shadow-inner">
          {!step ? (
            <div className="text-center text-xs text-text-muted py-6 font-mono">Waiting for model execution...</div>
          ) : (
            <div className="flex flex-col gap-1.5 relative">
              {step.alternatives.length === 1 && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 dark:text-emerald-400 bg-primary-500/10 px-2.5 py-1 rounded border border-primary-500/20 mb-1">
                  <Sparkles className="w-3 h-3 text-primary-500 shrink-0" />
                  <span>Model reasoning / thinking mode (logprobs omitted by engine)</span>
                </div>
              )}
              <div className="grid grid-cols-12 text-[10px] text-text-muted uppercase font-mono tracking-wider border-b border-border pb-1.5 px-1 mb-1">
                <div className="col-span-3">Candidate</div>
                <div className="col-span-2 text-right">Probability</div>
                <div className="col-span-2 text-right">Logprob</div>
                <div className="col-span-5 pl-4">Distribution Mass</div>
              </div>

              {(() => {
                const raw = [...step.alternatives];

                // If it's the reorder/handoff stage, or selection stage, ensure winner is at the top
                if (stage === 'prob_reorder' || stage === 'prob_handoff' || isSelect || isAppend) {
                  const winnerIndex = raw.findIndex((a) => a.token === step.tokenText);
                  if (winnerIndex > 0) {
                    const winner = raw.splice(winnerIndex, 1)[0];
                    raw.unshift(winner);
                  }
                }

                return (
                  <div className="flex flex-col gap-1.5 relative">
                    {raw.map((alt) => {
                      const isSelected = alt.token === step.tokenText;
                      const isWinnerFinal = isSelected && (isSelect || isAppend);
                      const isWinnerProb =
                        isSelected &&
                        (stage === 'prob_identify' || stage === 'prob_reorder' || stage === 'prob_handoff');
                      const isRevealPulse = stage === 'prob_reveal';

                      let rowClasses = 'border-transparent bg-surface/50';
                      if (isWinnerFinal) {
                        rowClasses = 'bg-primary-500/15 border-primary-500/40 shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]';
                      } else if (isWinnerProb) {
                        rowClasses = 'bg-primary-500/10 border-primary-500/30 shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                      } else if ((isSelect || isAppend) && !isSelected) {
                        rowClasses = 'border-transparent opacity-30';
                      } else if (isRevealPulse) {
                        rowClasses = 'border-border-strong bg-surface-subtle';
                      }

                      return (
                        <motion.div
                          layout
                          initial={false}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          key={alt.token}
                          className={`grid grid-cols-12 items-center text-xs font-mono px-2 py-1 rounded-lg transition-colors duration-300 border ${rowClasses}`}
                        >
                          <div className="col-span-3 truncate pl-1 relative">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold transition-colors duration-500 ${
                                isWinnerFinal ? 'bg-primary text-white dark:text-black shadow-sm' : 'bg-surface text-text-main border border-border'
                              }`}
                            >
                              {alt.token.replace(/\n/g, '↵') || ' '}
                            </span>
                          </div>
                          <div
                            className={`col-span-2 text-right transition-colors duration-500 tabular-nums ${
                              isWinnerFinal ? 'text-primary-600 dark:text-emerald-400 font-bold' : isRevealPulse ? 'text-text-main font-semibold' : 'text-text-main'
                            }`}
                          >
                            {formatProb(alt.probability)}
                          </div>
                          <div
                            className={`col-span-2 text-right text-[10px] transition-colors duration-500 tabular-nums ${
                              isRevealPulse ? 'text-text-secondary' : 'text-text-muted'
                            }`}
                          >
                            {alt.logProbability.toFixed(2)}
                          </div>
                          <div className="col-span-5 pl-4 pr-1">
                            <div className="h-1.5 w-full bg-surface-subtle border border-border-subtle rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                  isWinnerFinal || isWinnerProb
                                    ? 'bg-primary-500 shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                                    : isRevealPulse
                                    ? 'bg-slate-400 dark:bg-white/40'
                                    : 'bg-primary-500/30'
                                }`}
                                style={{
                                  width:
                                    isProbAny || isSelect || isAppend
                                      ? `${Math.max(1, alt.probability * 100)}%`
                                      : '0%'
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <Connector active={isSelect || isProbAny} handoff={stage === 'prob_handoff'} />

      {/* 4. TOKEN SELECTION */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isSelect || isAppend ? 'opacity-100' : 'opacity-65'}`}>
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-mono font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isSelect, isAppend)}
          <span className={isSelect ? 'text-text-main font-bold' : 'text-text-muted'}>4. Selected Token</span>
          <span className="ml-auto text-[10px] text-text-muted font-normal lowercase">Sampled Winner</span>
        </div>

        <div
          aria-live="polite"
          className={`p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${
            isSelect
              ? 'bg-primary-500/[0.08] border-primary-500/40 shadow-sm dark:shadow-[0_0_24px_rgba(16,185,129,0.15)]'
              : 'bg-surface-raised border-border shadow-inner'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start gap-1">
              {step && (
                <div className="text-[10px] text-primary-600 dark:text-emerald-400 font-bold uppercase tracking-wider font-mono">
                  <HyperText key={`label-${step.index}`} duration={300} className="font-mono font-normal">
                    {`TOKEN #${step.index}`}
                  </HyperText>
                </div>
              )}
              <div
                className={`text-xl font-mono px-3 py-1 rounded-lg transition-colors duration-300 ${
                  isSelect || isAppend
                    ? 'bg-surface text-text-main border border-primary-500/40 min-w-[3.5rem] text-center font-bold shadow-sm'
                    : 'text-text-muted/50 bg-surface-subtle'
                }`}
              >
                {(isSelect || isAppend) && step ? (
                  <HyperText key={`val-${step.index}`} duration={400} className="font-mono font-bold inline-block">
                    {step.tokenText.replace(/\n/g, '↵') || '␣'}
                  </HyperText>
                ) : (
                  <span className="text-sm italic text-text-muted">sampling...</span>
                )}
              </div>
            </div>
            {(isSelect || isAppend) && step && (
              <div className="flex flex-col text-xs font-mono text-text-muted">
                <span>Probability: <strong className="text-text-main">{formatProb(step.probability)}</strong></span>
                <span>Logprob Rank: <strong className="text-primary-600 dark:text-emerald-400">#{step.rank}</strong></span>
              </div>
            )}
          </div>
          {(isSelect || isAppend) && step && step.rank > 1 && (
            <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Sampled Alternate (#{step.rank})</span>
            </div>
          )}
        </div>
      </div>

      <Connector active={isAppend || isSelect} />

      {/* 5. ADD TO CONTEXT */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isAppend ? 'opacity-100' : 'opacity-65'}`}>
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-mono font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isAppend, false)}
          <span className={isAppend ? 'text-text-main font-bold' : 'text-text-muted'}>5. Append to Context Window</span>
          <span className="ml-auto text-[10px] text-text-muted font-normal lowercase">Autoregressive Loop</span>
        </div>
        <div
          className={`transition-all duration-500 rounded-xl p-2 ${
            isAppend ? 'bg-primary-500/[0.04] border border-primary-500/30 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border border-transparent'
          }`}
        >
          {isAppend ? renderContext(true) : renderContext(false)}
        </div>
      </div>
    </div>
  );
}
