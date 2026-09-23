import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Layers, Sparkles, Network } from 'lucide-react';
import { AttentionHeadData, TokenItem, AttentionOutputData } from '../../types';
import { HeatmapGrid } from '../visualizations/HeatmapGrid';
import { VectorBar } from '../visualizations/VectorBar';

interface AttentionHeatmapStageProps {
  tokens: TokenItem[];
  heads: AttentionHeadData[];
  attentionOutput: AttentionOutputData;
  phase?: number;
}

export const AttentionHeatmapStage: React.FC<AttentionHeatmapStageProps> = ({
  tokens,
  heads,
  attentionOutput,
  phase
}) => {
  const showAll = phase === undefined;
  const showPhase2 = showAll || (phase !== undefined && phase >= 2);
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(1); // default semantic head

  // Educational Autoplay: Phase 0 shows Head 0 (Positional/Syntactic), Phase 1 switches to Head 1 (Semantic Core)
  useEffect(() => {
    if (phase === undefined) return;
    if (phase === 0) {
      setSelectedHeadIdx(0);
    } else if (phase >= 1) {
      setSelectedHeadIdx(1);
    }
  }, [phase]);

  const currentHead = heads[selectedHeadIdx];

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Head Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-main font-semibold">
            Select Attention Head (12 Total in GPT-2):
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Attention Heads">
          {heads.map((h, idx) => {
            const isSelected = selectedHeadIdx === idx;
            return (
              <button
                key={h.headIndex}
                role="tab"
                aria-selected={isSelected}
                aria-label={`Select ${h.name}`}
                onClick={() => setSelectedHeadIdx(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-all focus-ring ${
                  isSelected
                    ? 'bg-primary text-white dark:text-black font-bold shadow-[0_0_16px_rgba(5,150,105,0.3)] dark:shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                    : 'bg-surface-raised text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                {h.name.split(':')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Head Description */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-[12px] text-emerald-800 dark:text-emerald-300 font-mono">
        <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{currentHead.description}</span>
      </div>

      {/* Heatmap Grid Component */}
      <HeatmapGrid
        tokens={tokens}
        matrix={currentHead.matrix}
        rawScores={currentHead.rawScores}
        activeHeadName={currentHead.name}
      />

      {/* Critical Educational Bridge: How Attention Output connects to Stage 5 */}
      {showPhase2 && (
        <motion.div
          data-autoplay-focal={phase === 2 ? 'true' : undefined}
          initial={!showAll ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-surface p-6 shadow-sm dark:shadow-2xl transition-colors duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px] font-mono uppercase tracking-wider text-text-main font-bold">
                Connecting Stage 4 to Stage 5: The Attention Output Vector (z)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
              z = ∑ (Attention_Weight_j × Value_Vector_j)
            </span>
          </div>

          <p className="text-[12px] leading-relaxed text-text-secondary">
            The attention heatmap percentages above are used to multiply the <strong>Value vectors (V)</strong> from Stage 3. For the last token <code className="text-text-main bg-surface-raised px-1 py-0.5 rounded border border-border-subtle">"{attentionOutput.tokenText}"</code> (which is responsible for predicting the next word), the model gathers context from previous tokens based on row 4 of the heatmap:
          </p>

          {/* Breakdown chips */}
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {attentionOutput.breakdown.map((item) => (
              <div
                key={item.sourceToken}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised border border-border shadow-sm"
              >
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{Math.round(item.weight * 100)}%</span>
                <span className="text-text-main">of V("{item.sourceToken}")</span>
              </div>
            ))}
          </div>

          {/* Dynamic Context Synthesis Equation */}
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-raised border border-border font-mono text-[11px]">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Weighted Context Synthesis Formula:</span>
            <div className="text-cyan-800 dark:text-cyan-300 font-bold overflow-x-auto py-1">
              z = (0.54 × V["cat"]) + (0.24 × V["sat"]) + (0.12 × V[" on"]) + (0.06 × V["the"]) + (0.04 × V["The"])
            </div>
            <span className="text-[10px] text-text-muted">
              Because "cat" receives 54% of the attention, its Value vector dominates the final context vector entering Stage 5!
            </span>
          </div>

          {/* Resulting z vector */}
          <VectorBar
            label="Attention Context Vector (z)"
            sublabel='Weighted sum of all retrieved Value vectors for token " the"'
            vector={attentionOutput.attentionContextVector}
            colorTheme="cyan"
            maxVisibleDims={4}
            dimensionLabel="[4-D]"
          />

          {/* Bridge Callout */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-[12px] text-text-secondary">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-text-main uppercase text-[11px]">
                What happens to this vector in Stage 5?
              </span>
              <p className="leading-relaxed">
                In <strong>Stage 5 (Feed-Forward Network)</strong>, this Attention Context Vector <code className="text-emerald-700 dark:text-emerald-300 font-semibold">z</code> is added to the token's original vector via Residual Connection (<code className="text-text-main bg-surface-raised px-1 py-0.5 rounded border border-border-subtle">x_orig + z</code>) to produce the exact 4 values <code className="text-text-main bg-surface-raised px-1 py-0.5 rounded border border-border-subtle">[+0.72, -0.45, +1.14, -0.88]</code>. Those 4 values become the <strong>Input Nodes (x₁, x₂, x₃, x₄)</strong> in the Stage 5 neural graph!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
