import React, { useRef, useEffect } from 'react';
import { AutoPlaySpeed } from '../hooks/useStageController';
import { StageDefinition } from '../types';

interface InputBarProps {
  prompt: string;
  stages: StageDefinition[];
  activeStageIndex: number;
  onSelectStage: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  speed: AutoPlaySpeed;
  onChangeSpeed: (speed: AutoPlaySpeed) => void;
  currentPhase: number;
  currentStagePhaseCount: number;
}

export const STAGE_SHORT_LABELS: Record<string, string> = {
  tokenization: 'Tokenization',
  embedding: 'Embedding',
  attention_qkv: 'QKV Projections',
  attention_heatmap: 'Attention Map',
  feed_forward: 'Feed-Forward',
  softmax: 'Softmax',
  sampling: 'Sampling',
};

export const InputBar: React.FC<InputBarProps> = ({
  prompt,
  stages,
  activeStageIndex,
  onSelectStage,
  isAutoPlaying,
  currentPhase,
  currentStagePhaseCount
}) => {
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active stage tab smoothly into view when navigating
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeStageIndex]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-surface/85 border-b border-border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-colors duration-200">
      <div className="max-w-[90rem] mx-auto px-3 sm:px-5 lg:px-6 py-2 flex flex-col gap-2">
        {/* Compact prompt pill row with clear 7-stage awareness */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 h-7 px-3 rounded-lg bg-surface-raised border border-border shadow-sm min-w-0 max-w-[70%] sm:max-w-none">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted shrink-0">Prompt</span>
            <span className="text-[12px] font-medium text-text-main tracking-tight truncate">"{prompt}"</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0">→ ?</span>
          </div>

          {/* Subtle Stage Counter and Horizontal Swipe Indicator */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border font-medium text-text-main">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeStageIndex + 1}</span>
              <span className="text-text-muted">/7</span>
            </span>
            <span className="sm:hidden text-[10px] font-medium text-emerald-600/90 dark:text-emerald-400/90 flex items-center gap-0.5">
              <span>⇄</span>
              <span>7 Stages</span>
            </span>
          </div>
        </div>

        {/* Stage stepper — compact tabs with subtle horizontal scroll indication */}
        <div className="relative w-full">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1 overflow-x-auto touch-pan-x custom-scrollbar pb-1 sm:pb-0"
            role="tablist"
            aria-label="Transformer stages"
          >
            {stages.map((stg, idx) => {
              const isActive = idx === activeStageIndex;
              const isCompleted = idx < activeStageIndex;
              const shortLabel = STAGE_SHORT_LABELS[stg.id] || stg.title.split('(')[0].trim();
              return (
                <button
                  key={stg.id}
                  ref={isActive ? activeTabRef : undefined}
                  onClick={() => onSelectStage(idx)}
                  role="tab"
                  title={stg.title}
                  aria-selected={isActive}
                  aria-current={isActive ? 'step' : undefined}
                  className={`relative shrink-0 sm:shrink sm:flex-1 min-w-fit sm:min-w-0 h-8 flex items-center px-2.5 sm:px-2 rounded-lg text-left transition-all border focus-ring overflow-hidden ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-text-main shadow-[0_0_12px_rgba(5,150,105,0.15)] dark:shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold'
                      : isCompleted
                      ? 'bg-surface-raised border-border-subtle text-text-secondary hover:text-text-main hover:bg-surface-subtle'
                      : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0 transition-colors ${
                        isActive
                          ? 'bg-primary text-black font-bold shadow-sm'
                          : isCompleted
                          ? 'bg-slate-200 dark:bg-white/20 text-text-secondary dark:text-white font-medium'
                          : 'bg-slate-100 dark:bg-white/[0.06] text-text-dim'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium whitespace-nowrap leading-tight">
                      {shortLabel}
                    </span>
                  </div>

                  {/* Phase progress bar — only visible on active tab during autoplay */}
                  {isActive && isAutoPlaying && currentStagePhaseCount > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200 dark:bg-white/[0.06]">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 ease-out"
                        style={{ width: `${((currentPhase + 1) / currentStagePhaseCount) * 100}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subtle right-edge fade mask on mobile to hint at scrollable stages */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-surface to-transparent sm:hidden"
          />
        </div>
      </div>
    </header>
  );
};
