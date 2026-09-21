import React, { useState } from 'react';
import { Eye, Layers } from 'lucide-react';
import { AttentionHeadData, TokenItem } from '../../types';
import { HeatmapGrid } from '../visualizations/HeatmapGrid';

interface AttentionHeatmapStageProps {
  tokens: TokenItem[];
  heads: AttentionHeadData[];
}

export const AttentionHeatmapStage: React.FC<AttentionHeatmapStageProps> = ({ tokens, heads }) => {
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(1); // default semantic head

  const currentHead = heads[selectedHeadIdx];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Head Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.08] bg-black/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
            Select Attention Head (12 Total in GPT-2):
          </span>
        </div>

        <div className="flex items-center gap-2">
          {heads.map((h, idx) => {
            const isSelected = selectedHeadIdx === idx;
            return (
              <button
                key={h.headIndex}
                onClick={() => setSelectedHeadIdx(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                    : 'bg-white/[0.04] text-[#A0A0A0] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {h.name.split(':')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Head Description */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/20 text-[12px] text-emerald-300 font-mono">
        <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{currentHead.description}</span>
      </div>

      {/* Heatmap Grid Component */}
      <HeatmapGrid
        tokens={tokens}
        matrix={currentHead.matrix}
        rawScores={currentHead.rawScores}
        activeHeadName={currentHead.name}
      />
    </div>
  );
};
