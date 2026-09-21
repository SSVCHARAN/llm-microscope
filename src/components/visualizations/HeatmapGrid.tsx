import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, HelpCircle } from 'lucide-react';
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
      return 'bg-white/[0.01] border-white/[0.04] text-white/20';
    }
    if (weight > 0.7) {
      return 'bg-emerald-500/80 border-emerald-400 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    }
    if (weight > 0.4) {
      return 'bg-emerald-500/50 border-emerald-500/60 text-white font-semibold';
    }
    if (weight > 0.15) {
      return 'bg-emerald-500/25 border-emerald-500/30 text-emerald-300';
    }
    return 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400/60';
  };

  const activeRow = selectedCell?.row;
  const activeCol = selectedCell?.col;
  const selectedWeight = selectedCell ? matrix[selectedCell.row][selectedCell.col] : null;
  const selectedRaw = selectedCell ? rawScores[selectedCell.row][selectedCell.col] : null;
  const isSelectedMasked = selectedCell ? selectedCell.col > selectedCell.row : false;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Grid container */}
      <div className="flex flex-col gap-3 bg-black/60 border border-white/[0.08] rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
              {activeHeadName}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#A0A0A0]">
            Softmax(Q · K^T / √d_k)
          </span>
        </div>

        {/* Column Headers (Keys) */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="flex items-center pl-24 mb-2 gap-2">
              <div className="text-[10px] font-mono uppercase text-[#A0A0A0] pr-2">Keys →</div>
              {tokens.map((t, idx) => (
                <div
                  key={t.id}
                  className={`w-14 text-center font-mono text-[11px] px-1 py-0.5 rounded transition-colors ${
                    activeCol === idx ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-[#A0A0A0]'
                  }`}
                >
                  {t.display}
                </div>
              ))}
              <div className="w-16 text-center text-[10px] font-mono text-[#A0A0A0]">
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
                      className={`w-24 text-right pr-3 font-mono text-[11px] truncate flex items-center justify-end gap-1.5 ${
                        isCurrentRow ? 'text-emerald-400 font-bold' : 'text-[#A0A0A0]'
                      }`}
                    >
                      <span className="text-[9px] text-[#666] font-mono">Q{rIdx}:</span>
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
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                          className={`w-14 h-11 rounded-lg border flex flex-col items-center justify-center font-mono text-[11px] transition-all relative ${
                            getCellColor(weight, isMasked)
                          } ${
                            isSelected ? 'ring-2 ring-white shadow-[0_0_16px_rgba(255,255,255,0.4)] z-10' : ''
                          }`}
                        >
                          {isMasked ? (
                            <Lock className="w-3 h-3 text-[#555]" />
                          ) : (
                            <>
                              <span>{(weight * 100).toFixed(0)}%</span>
                              <span className="text-[8px] opacity-75 font-sans leading-none mt-0.5">
                                {weight.toFixed(2)}
                              </span>
                            </>
                          )}
                        </motion.button>
                      );
                    })}

                    {/* Row Sum (Softmax constraint: must equal 100%) */}
                    <div className="w-16 text-center font-mono text-[11px] text-emerald-400/80 bg-emerald-500/[0.05] border border-emerald-500/10 py-1 rounded">
                      {(rowSum * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#A0A0A0] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/80" />
            <span>High Attention (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/25" />
            <span>Low Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#555]" />
            <span>Causal Mask (Future)</span>
          </div>
        </div>
      </div>

      {/* Interactive Inspector Sidebar for Selected Cell */}
      <div className="flex-1 w-full bg-[#111111] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Connection Inspector
          </span>
          <span className="text-[10px] font-mono text-[#888]">
            Click any cell to inspect
          </span>
        </div>

        {selectedCell ? (
          <div className="flex flex-col gap-4">
            {/* Tokens involved */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/[0.06]">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-[#888]">Query (Looking)</span>
                <span className="text-[14px] font-mono font-bold text-white">
                  "{tokens[selectedCell.row].display}" <span className="text-[10px] text-[#888] font-normal">at pos {selectedCell.row}</span>
                </span>
              </div>

              <span className="text-[16px] text-emerald-400 font-mono">⟷</span>

              <div className="flex flex-col text-right">
                <span className="text-[9px] font-mono uppercase text-[#888]">Key (Target)</span>
                <span className="text-[14px] font-mono font-bold text-white">
                  "{tokens[selectedCell.col].display}" <span className="text-[10px] text-[#888] font-normal">at pos {selectedCell.col}</span>
                </span>
              </div>
            </div>

            {/* Status Breakdown */}
            {isSelectedMasked ? (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[12px] leading-relaxed flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Causally Masked (-∞):</strong> This target token occurs in the future relative to the query position. Autoregressive decoders set this score to negative infinity so the model cannot "see the future".
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center p-2 rounded bg-white/[0.03] border border-white/[0.05] text-[12px] font-mono">
                  <span className="text-[#A0A0A0]">Dot Product (Q · K / √d):</span>
                  <span className="text-white font-semibold">{selectedRaw?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[12px] font-mono">
                  <span className="text-emerald-300">Softmax Attention Weight:</span>
                  <span className="text-emerald-400 font-bold text-[14px]">
                    {((selectedWeight || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="text-[12px] leading-relaxed text-[#A0A0A0] mt-1">
                  {selectedCell.row === 2 && selectedCell.col === 1 ? (
                    <span className="text-emerald-300">
                      🎯 <strong>Semantic Binding Detected:</strong> The verb <code className="text-white">sat</code> pays <strong>74%</strong> of its attention directly to the noun <code className="text-white">cat</code>. This is how the model remembers <em>who</em> is doing the sitting!
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
          <div className="text-center py-8 text-[12px] text-[#666] font-mono">
            Select a grid cell above to view calculations
          </div>
        )}
      </div>
    </div>
  );
};
