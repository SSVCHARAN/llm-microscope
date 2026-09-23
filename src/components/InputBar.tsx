import React from 'react';
import { Sparkles } from 'lucide-react';
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

export const InputBar: React.FC<InputBarProps> = ({
  prompt,
  stages,
  activeStageIndex,
  onSelectStage,
  isAutoPlaying,
  currentPhase,
  currentStagePhaseCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-surface/85 border-b border-border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
        {/* Top row: Brand + Prompt Display */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Prompt showcase */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-surface-raised border border-border shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Prompt</span>
              <span className="text-[13px] font-medium text-text-main tracking-tight">"{prompt}"</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">→ ?</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Interactive Walkthrough</span>
            </div>
          </div>
        </div>

        {/* Bottom row: Stage Progress Dots / Segmented Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Transformer stages">
          {stages.map((stg, idx) => {
            const isActive = idx === activeStageIndex;
            const isCompleted = idx < activeStageIndex;
            return (
              <button
                key={stg.id}
                onClick={() => onSelectStage(idx)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'step' : undefined}
                className={`relative flex-1 min-w-[125px] h-9 flex items-center px-2.5 rounded-lg text-left transition-all border focus-ring overflow-hidden ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-text-main shadow-[0_0_12px_rgba(5,150,105,0.15)] dark:shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold'
                    : isCompleted
                    ? 'bg-surface-raised border-border-subtle text-text-secondary hover:text-text-main hover:bg-surface-subtle'
                    : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <div className="flex items-center gap-2">
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
                  <div className="truncate">
                    <div className="text-[11px] font-medium truncate leading-tight">
                      {stg.title.split('(')[0].trim()}
                    </div>
                  </div>
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
      </div>
    </header>
  );
};
