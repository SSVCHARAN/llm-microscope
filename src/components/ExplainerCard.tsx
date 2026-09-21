import React, { useState } from 'react';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { StageDefinition } from '../types';

interface ExplainerCardProps {
  stage: StageDefinition;
}

export const ExplainerCard: React.FC<ExplainerCardProps> = ({ stage }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#111111]/80 backdrop-blur-md p-4 shadow-lg">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[12px] font-mono uppercase tracking-wider font-semibold text-white">
            Architecture Mechanics
          </h3>
        </div>
        <button 
          className="text-[#A0A0A0] hover:text-white p-1 rounded hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle explainer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 pt-2 border-t border-white/[0.06]">
          {/* Step points */}
          <div className="flex flex-col gap-2">
            {stage.howItWorks.map((step, idx) => (
              <div key={idx} className="text-[12px] leading-relaxed text-[#B0B0B0] font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 mt-1.5 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Key insight callout box */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3 flex items-start gap-2.5 mt-1">
            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
                Key Insight
              </span>
              <p className="text-[12px] leading-relaxed text-[#EDEDED]">
                {stage.keyInsight}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
