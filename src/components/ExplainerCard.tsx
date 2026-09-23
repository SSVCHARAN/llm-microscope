import React, { useState } from 'react';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { StageDefinition } from '../types';

interface ExplainerCardProps {
  stage: StageDefinition;
}

export function ExplainerCard({ stage }: ExplainerCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#111317] backdrop-blur-md p-5 shadow-xl font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between cursor-pointer select-none text-left w-full focus-ring rounded-lg py-1"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
            Architecture Mechanics & Theory
          </h3>
        </div>
        <div className="text-text-muted hover:text-white p-1 rounded transition-colors flex items-center gap-1 text-[11px] font-mono">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.06]">
          {/* Step points */}
          <div className="flex flex-col gap-2.5">
            {stage.howItWorks.map((step, idx) => (
              <div key={idx} className="text-[13px] leading-relaxed text-text-secondary font-sans flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Key insight callout box */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 flex items-start gap-3 mt-1 shadow-sm">
            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400">
                Key Pedagogical Insight
              </span>
              <p className="text-[13px] leading-relaxed text-text-main font-medium">
                {stage.keyInsight}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
