import React from 'react';
import { StageDefinition } from '../types';

interface StageHeaderProps {
  stage: StageDefinition;
}

export const StageHeader: React.FC<StageHeaderProps> = ({ stage }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          STAGE 0{stage.stepNumber} OF 07
        </span>
        <span className="text-[12px] font-mono text-[#A0A0A0] tracking-tight">
          TRANSFORMER_INTERNAL_PIPELINE
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {stage.title}
        </h2>
        <p className="text-[13px] font-medium text-emerald-400/90 tracking-wide">
          {stage.tagline}
        </p>
      </div>

      <p className="text-[13px] leading-relaxed text-[#A0A0A0] max-w-4xl mt-1">
        {stage.summary}
      </p>
    </div>
  );
};
