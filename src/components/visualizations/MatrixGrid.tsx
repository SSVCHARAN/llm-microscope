import React from 'react';
import { motion } from 'framer-motion';

interface MatrixGridProps {
  matrix: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  title?: string;
  subtitle?: string;
  highlightRow?: number;
  highlightCol?: number;
  showValues?: boolean;
  valueFormatter?: (val: number) => string;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  matrix,
  rowLabels,
  colLabels,
  title,
  subtitle,
  highlightRow,
  highlightCol,
  showValues = true,
  valueFormatter = (v) => (v === -Infinity ? '-∞' : v.toFixed(2))
}) => {
  const numRows = matrix.length;
  const numCols = matrix[0]?.length || 0;

  // Compute color based on value
  const getCellBg = (val: number, isRowHighlight: boolean) => {
    if (val === -Infinity) return 'bg-white/[0.01] border-white/[0.02] text-white/20';
    if (val === 0) return 'bg-white/[0.03] border-white/[0.04] text-[#777]';
    
    // Normal normalized positive range [0..1]
    if (val > 0) {
      const alpha = Math.min(1, Math.max(0.1, val));
      if (isRowHighlight) {
        return `bg-emerald-500/[${Math.round(alpha * 70)}%] border-emerald-500/40 text-white`;
      }
      return val > 0.5 
        ? 'bg-emerald-500/40 border-emerald-500/50 text-white font-semibold'
        : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300';
    }

    // Negative values
    return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-black/50 p-4 shadow-inner">
      {(title || subtitle) && (
        <div className="flex flex-col gap-0.5 mb-2">
          {title && <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-white">{title}</span>}
          {subtitle && <span className="text-[11px] font-mono text-[#A0A0A0]">{subtitle}</span>}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Column labels */}
          {colLabels && (
            <div className="flex pl-16 mb-1 gap-1.5">
              {colLabels.map((lbl, cIdx) => (
                <div
                  key={cIdx}
                  className={`w-14 text-center text-[10px] font-mono truncate transition-colors ${
                    highlightCol === cIdx ? 'text-emerald-400 font-bold' : 'text-[#A0A0A0]'
                  }`}
                  title={lbl}
                >
                  {lbl}
                </div>
              ))}
            </div>
          )}

          {/* Matrix rows */}
          <div className="flex flex-col gap-1.5">
            {matrix.map((row, rIdx) => {
              const isRowActive = highlightRow === rIdx;
              return (
                <div key={rIdx} className="flex items-center gap-1.5">
                  {/* Row Label */}
                  {rowLabels && (
                    <div
                      className={`w-14 text-right pr-2 text-[10px] font-mono truncate shrink-0 transition-colors ${
                        isRowActive ? 'text-emerald-400 font-bold' : 'text-[#A0A0A0]'
                      }`}
                      title={rowLabels[rIdx]}
                    >
                      {rowLabels[rIdx]}
                    </div>
                  )}

                  {/* Row Cells */}
                  <div className="flex gap-1.5">
                    {row.map((val, cIdx) => {
                      const isColActive = highlightCol === cIdx;
                      return (
                        <motion.div
                          key={cIdx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (rIdx * numCols + cIdx) * 0.015 }}
                          className={`w-14 h-9 rounded-md border flex items-center justify-center font-mono text-[11px] transition-all select-none ${
                            getCellBg(val, isRowActive)
                          } ${isRowActive && isColActive ? 'ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : ''}`}
                        >
                          {showValues ? valueFormatter(val) : ''}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
