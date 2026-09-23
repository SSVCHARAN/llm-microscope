import React from 'react';
import { StageDefinition } from '../types';

interface StageHeaderProps {
  stage: StageDefinition;
}

export const StageHeader: React.FC<StageHeaderProps> = ({ stage }) => {
  return (
    <div className="flex flex-col gap-2.5 font-sans">
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          STAGE 0{stage.stepNumber} OF 07
        </span>
        <span className="text-[11px] font-mono text-text-muted tracking-wide uppercase">
          TRANSFORMER_INTERNAL_PIPELINE
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {stage.title}
        </h2>
        <p className="text-[14px] font-semibold text-emerald-400 tracking-wide font-mono">
          {stage.tagline}
        </p>
      </div>

      <p className="text-[13px] sm:text-[14px] leading-relaxed text-text-secondary max-w-4xl mt-0.5">
        {stage.summary}
      </p>
    </div>
  );
};
