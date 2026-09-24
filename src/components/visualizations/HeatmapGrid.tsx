import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { TokenItem } from '../../types';

interface HeatmapGridProps {
  tokens: TokenItem[];
  matrix: number[][];
  rawScores: number[][];
  activeHeadName: string;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  tokens,
  matrix,
  rawScores,
  activeHeadName
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({
    row: 2, // "sat"
    col: 1  // "cat"
  });

  const getCellColor = (weight: number, isMasked: boolean) => {
    if (isMasked) {
      return 'bg-slate-100/80 border-slate-200/70 text-slate-400 dark:bg-white/[0.01] dark:border-white/[0.04] dark:text-white/20';
    }
    if (weight > 0.7) {
      return 'bg-emerald-600 dark:bg-emerald-500/80 border-emerald-700 dark:border-emerald-400 text-white dark:text-black font-bold shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    }
    if (weight > 0.4) {
      return 'bg-emerald-500/30 dark:bg-emerald-500/50 border-emerald-500/40 dark:border-emerald-500/60 text-emerald-950 dark:text-white font-semibold';
    }
    if (weight > 0.15) {
      return 'bg-emerald-500/15 dark:bg-emerald-500/25 border-emerald-500/25 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-medium';
    }
    return 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/15 text-emerald-800/70 dark:text-emerald-400/60';
  };

  const activeRow = selectedCell?.row;
  const activeCol = selectedCell?.col;
  const selectedWeight = selectedCell ? matrix[selectedCell.row][selectedCell.col] : null;
  const selectedRaw = selectedCell ? rawScores[selectedCell.row][selectedCell.col] : null;
  const isSelectedMasked = selectedCell ? selectedCell.col > selectedCell.row : false;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Grid container */}
      <div className="flex flex-col gap-3 bg-surface border border-border rounded-xl p-3.5 sm:p-5 shadow-sm dark:shadow-2xl transition-colors duration-200 w-full lg:w-auto lg:shrink-0 max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-main font-semibold truncate">
              {activeHeadName}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 sm:hidden flex items-center gap-1 font-medium">
              <span>⇄</span>
              <span>Scroll</span>
            </span>
            <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
              Softmax(Q · K^T / √d_k)
            </span>
          </div>
        </div>

        {/* Column Headers (Keys) & Matrix Rows */}
        <div className="overflow-x-auto w-full max-w-full touch-pan-x pb-2 custom-scrollbar">
          <div className="inline-block min-w-max pb-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-20 sm:w-24 shrink-0 text-right pr-3 text-[10px] font-mono uppercase text-text-muted flex items-center justify-end">
                Keys →
              </div>
              {tokens.map((t, idx) => (
                <div
                  key={t.id}
                  className={`w-14 shrink-0 text-center font-mono text-[11px] px-1 py-0.5 rounded transition-colors ${
                    activeCol === idx ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-500/40' : 'text-text-secondary'
                  }`}
                >
                  {t.display}
                </div>
              ))}
              <div className="w-16 shrink-0 text-center text-[10px] font-mono text-text-muted">
                ∑ Row
              </div>
            </div>

            {/* Rows (Queries) */}
            <div className="flex flex-col gap-2">
              {tokens.map((qToken, rIdx) => {
                const isCurrentRow = activeRow === rIdx;
                const rowSum = matrix[rIdx].reduce((a, b) => a + b, 0);

                return (
                  <div key={qToken.id} className="flex items-center gap-2">
                    {/* Row Label (Query) */}
                    <div
                      className={`w-20 sm:w-24 shrink-0 text-right pr-3 font-mono text-[11px] truncate flex items-center justify-end gap-1.5 ${
                        isCurrentRow ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-text-secondary'
                      }`}
                    >
                      <span className="text-[9px] text-text-dim font-mono">Q{rIdx}:</span>
                      <span>{qToken.display}</span>
                    </div>

                    {/* Matrix Cells */}
                    {tokens.map((kToken, cIdx) => {
                      const isMasked = cIdx > rIdx;
                      const weight = matrix[rIdx][cIdx];
                      const isSelected = activeRow === rIdx && activeCol === cIdx;

                      return (
                        <motion.button
                          key={kToken.id}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: rIdx * 0.04 + cIdx * 0.02,
                            ease: 'easeOut'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                          aria-label={
                            isMasked
                              ? `Position ${rIdx} "${qToken.display}" attending to future position ${cIdx} "${kToken.display}": Causally Masked`
                              : `Attention weight from "${qToken.display}" to "${kToken.display}": ${(weight * 100).toFixed(0)}%`
                          }
                          aria-pressed={isSelected}
                          className={`w-14 shrink-0 h-11 rounded-lg border flex flex-col items-center justify-center font-mono text-[11px] transition-all relative focus-ring cursor-pointer ${
                            getCellColor(weight, isMasked)
                          } ${
                            isSelected ? 'ring-2 ring-emerald-600 dark:ring-white shadow-[0_0_16px_rgba(5,150,105,0.35)] dark:shadow-[0_0_16px_rgba(255,255,255,0.4)] z-10' : ''
                          }`}
                        >
                          {isMasked ? (
                            <Lock className="w-3 h-3 text-text-muted/70" />
                          ) : (
                            <>
                              <span>{(weight * 100).toFixed(0)}%</span>
                              <span className="text-[8px] opacity-80 font-sans leading-none mt-0.5">
                                {weight.toFixed(2)}
                              </span>
                            </>
                          )}
                        </motion.button>
                      );
                    })}

                    {/* Row Sum (Softmax constraint: must equal 100%) */}
                    <div className="w-16 shrink-0 text-center font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 py-1 rounded font-bold">
                      {(rowSum * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-border-subtle text-[11px] text-text-muted font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500/80" />
            <span>High Attention (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/20 dark:bg-emerald-500/25 border border-emerald-500/30" />
            <span>Low Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-text-dim" />
            <span>Causal Mask (Future)</span>
          </div>
        </div>
      </div>

      {/* Interactive Inspector Sidebar for Selected Cell */}
      <div className="flex-1 w-full max-w-full min-w-0 bg-surface border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
            Connection Inspector
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            Click any cell to inspect
          </span>
        </div>

        {selectedCell ? (
          <div className="flex flex-col gap-4">
            {/* Tokens involved */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border-subtle">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-text-muted">Query (Looking)</span>
                <span className="text-[14px] font-mono font-bold text-text-main">
                  "{tokens[selectedCell.row].display}" <span className="text-[10px] text-text-muted font-normal">at pos {selectedCell.row}</span>
                </span>
              </div>

              <span className="text-[16px] text-emerald-600 dark:text-emerald-400 font-mono">⟷</span>

              <div className="flex flex-col text-right">
                <span className="text-[9px] font-mono uppercase text-text-muted">Key (Target)</span>
                <span className="text-[14px] font-mono font-bold text-text-main">
                  "{tokens[selectedCell.col].display}" <span className="text-[10px] text-text-muted font-normal">at pos {selectedCell.col}</span>
                </span>
              </div>
            </div>

            {/* Status Breakdown */}
            {isSelectedMasked ? (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[12px] leading-relaxed flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Causally Masked (-∞):</strong> This target token occurs in the future relative to the query position. Autoregressive decoders set this score to negative infinity so the model cannot "see the future".
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center p-2 rounded bg-surface-raised border border-border-subtle text-[12px] font-mono">
                  <span className="text-text-muted">Dot Product (Q · K / √d):</span>
                  <span className="text-text-main font-semibold">{selectedRaw?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[12px] font-mono">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">Softmax Attention Weight:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[14px]">
                    {((selectedWeight || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="text-[12px] leading-relaxed text-text-secondary mt-1">
                  {selectedCell.row === 2 && selectedCell.col === 1 ? (
                    <span className="text-emerald-800 dark:text-emerald-300">
                      🎯 <strong>Semantic Binding Detected:</strong> The verb <code className="text-text-main font-semibold bg-surface-raised px-1 py-0.5 rounded">sat</code> pays <strong>74%</strong> of its attention directly to the noun <code className="text-text-main font-semibold bg-surface-raised px-1 py-0.5 rounded">cat</code>. This is how the model remembers <em>who</em> is doing the sitting!
                    </span>
                  ) : selectedCell.row === selectedCell.col ? (
                    <span>
                      Self-attention: The token retains its own identity and syntactic properties.
                    </span>
                  ) : (
                    <span>
                      The query retrieves context from preceding tokens to enrich its internal representation.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-[12px] text-text-muted font-mono">
            Select a grid cell above to view calculations
          </div>
        )}
      </div>
    </div>
  );
};
