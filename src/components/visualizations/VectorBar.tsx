import React from 'react';
import { motion } from 'framer-motion';

interface VectorBarProps {
  label: string;
  sublabel?: string;
  vector: number[];
  colorTheme?: 'emerald' | 'cyan' | 'purple' | 'amber';
  maxVisibleDims?: number;
}

export const VectorBar: React.FC<VectorBarProps> = ({
  label,
  sublabel,
  vector,
  colorTheme = 'emerald',
  maxVisibleDims = 8
}) => {
  const displayedDims = vector.slice(0, maxVisibleDims);

  const getDimColor = (val: number) => {
    // Range roughly -1.5 to +1.5
    if (val > 0) {
      const intensity = Math.min(1, Math.max(0.15, val / 1.5));
      if (colorTheme === 'cyan') {
        return `bg-cyan-500/[${Math.round(intensity * 80)}%] text-cyan-200 border-cyan-400/40`;
      }
      if (colorTheme === 'amber') {
        return `bg-amber-500/[${Math.round(intensity * 80)}%] text-amber-200 border-amber-400/40`;
      }
      if (colorTheme === 'purple') {
        return `bg-purple-500/[${Math.round(intensity * 80)}%] text-purple-200 border-purple-400/40`;
      }
      return `bg-emerald-500/[${Math.round(intensity * 80)}%] text-emerald-200 border-emerald-400/40`;
    } else {
      const intensity = Math.min(1, Math.max(0.15, Math.abs(val) / 1.5));
      return `bg-rose-500/[${Math.round(intensity * 60)}%] text-rose-200 border-rose-400/30`;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-black/40 border border-white/[0.06]">
      <div className="flex flex-col w-40 shrink-0">
        <span className="text-[12px] font-mono font-semibold text-white tracking-tight">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] font-mono text-[#888]">
            {sublabel}
          </span>
        )}
      </div>

      {/* Dimensions bar */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1 justify-end">
        {displayedDims.map((val, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.15, y: -2 }}
            className={`px-2 py-1 rounded border font-mono text-[10px] text-center min-w-[46px] shadow-sm transition-all select-none cursor-default ${getDimColor(
              val
            )}`}
            title={`Dimension ${idx}: ${val.toFixed(4)}`}
          >
            {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
          </motion.div>
        ))}
        <span className="text-[10px] font-mono text-[#666] pl-1">
          ...[768-D]
        </span>
      </div>
    </div>
  );
};
