import React from 'react';
import { motion } from 'framer-motion';

interface VectorBarProps {
  label: string;
  sublabel?: string;
  vector: number[];
  colorTheme?: 'emerald' | 'cyan' | 'purple' | 'amber';
  maxVisibleDims?: number;
  dimensionLabel?: string;
}

export const VectorBar: React.FC<VectorBarProps> = ({
  label,
  sublabel,
  vector,
  colorTheme = 'emerald',
  maxVisibleDims = 8,
  dimensionLabel = '...[768-D]'
}) => {
  const displayedDims = vector.slice(0, maxVisibleDims);

  const getDimClasses = (val: number) => {
    if (val >= 0) {
      if (colorTheme === 'cyan') {
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-800 dark:text-cyan-200 shadow-sm';
      }
      if (colorTheme === 'amber') {
        return 'bg-amber-500/15 border-amber-500/40 text-amber-850 text-amber-900 dark:text-amber-200 shadow-sm';
      }
      if (colorTheme === 'purple') {
        return 'bg-purple-500/15 border-purple-500/40 text-purple-800 dark:text-purple-200 shadow-sm';
      }
      return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 shadow-sm';
    } else {
      return 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-200 shadow-sm';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-surface border border-border transition-colors duration-200">
      <div className="flex flex-col w-full sm:w-44 shrink-0">
        <span className="text-[12px] font-mono font-semibold text-text-main tracking-tight">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] font-mono text-text-muted">
            {sublabel}
          </span>
        )}
      </div>

      {/* Dimensions bar */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1 justify-start sm:justify-end" role="group" aria-label={`Vector components for ${label}`}>
        {displayedDims.map((val, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: idx * 0.04
            }}
            whileHover={{ scale: 1.15, y: -2 }}
            className={`px-2 py-1 rounded border font-mono text-[10px] text-center min-w-[46px] transition-all select-none cursor-default font-semibold ${getDimClasses(val)}`}
            title={`Coordinate Dimension d_${idx}: ${val.toFixed(4)}`}
            aria-label={`Dimension ${idx}: ${val.toFixed(4)}`}
          >
            {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
          </motion.div>
        ))}
        <span className="text-[10px] font-mono text-text-muted pl-1">
          {dimensionLabel}
        </span>
      </div>
    </div>
  );
};
