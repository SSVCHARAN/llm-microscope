import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FastForward, Sparkles } from 'lucide-react';
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
}

export const InputBar: React.FC<InputBarProps> = ({
  prompt,
  stages,
  activeStageIndex,
  onSelectStage,
  onNext,
  onPrev,
  onReset,
  isAutoPlaying,
  onToggleAutoPlay,
  speed,
  onChangeSpeed
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0C0C0C]/85 border-b border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3">
        {/* Top row: Brand + Prompt Display + Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Prompt showcase */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0]">Prompt</span>
              <span className="text-[13px] font-medium text-white tracking-tight">"{prompt}"</span>
              <span className="text-[11px] text-emerald-400 font-mono">→ ?</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Interactive Walkthrough</span>
            </div>
          </div>

          {/* Stepper and Playback Actions */}
          <div className="flex items-center gap-2">
            
            {/* Speed toggle */}
            <div className="flex p-0.5 bg-black/60 border border-white/[0.08] rounded-md text-[11px] font-mono">
              {(['slow', 'normal', 'fast'] as AutoPlaySpeed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-2 py-1 rounded capitalize transition-all ${
                    speed === s ? 'bg-white/20 text-white font-semibold' : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  {s === 'slow' ? '0.5×' : s === 'normal' ? '1×' : '2×'}
                </button>
              ))}
            </div>

            {/* Play / Pause */}
            <button
              onClick={onToggleAutoPlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all active:scale-[0.97] ${
                isAutoPlaying
                  ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.4)]'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>

            {/* Prev / Next buttons */}
            <button
              onClick={onPrev}
              disabled={activeStageIndex === 0}
              aria-label="Previous Stage"
              title="Previous Stage"
              className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] text-text-muted hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all focus-ring"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onNext}
              disabled={activeStageIndex === stages.length - 1}
              aria-label="Next Stage"
              title="Next Stage"
              className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] text-text-muted hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all focus-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              aria-label="Restart walkthrough from Stage 1"
              title="Restart from Stage 1"
              className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] text-text-muted hover:text-white hover:bg-white/[0.08] transition-all focus-ring"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
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
                className={`flex-1 min-w-[125px] flex items-center gap-2 py-1.5 px-2.5 rounded-md text-left transition-all border focus-ring ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold'
                    : isCompleted
                    ? 'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:text-white hover:bg-white/[0.04]'
                    : 'bg-transparent border-transparent text-text-muted hover:text-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-emerald-500 text-black font-bold'
                      : isCompleted
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.06] text-text-muted'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-medium truncate leading-tight">
                    {stg.title.split('(')[0].trim()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
