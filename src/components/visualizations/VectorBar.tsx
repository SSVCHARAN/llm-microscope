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

  const getDimStyle = (val: number) => {
    // Range roughly -1.5 to +1.5
    const intensity = Math.min(1, Math.max(0.2, Math.abs(val) / 1.5));
    if (val >= 0) {
      if (colorTheme === 'cyan') {
        return {
          backgroundColor: `rgba(6, 182, 212, ${0.15 + intensity * 0.45})`,
          borderColor: 'rgba(6, 182, 212, 0.45)',
          color: '#a5f3fc'
        };
      }
      if (colorTheme === 'amber') {
        return {
          backgroundColor: `rgba(245, 158, 11, ${0.15 + intensity * 0.45})`,
          borderColor: 'rgba(245, 158, 11, 0.45)',
          color: '#fde68a'
        };
      }
      if (colorTheme === 'purple') {
        return {
          backgroundColor: `rgba(168, 85, 247, ${0.15 + intensity * 0.45})`,
          borderColor: 'rgba(168, 85, 247, 0.45)',
          color: '#e9d5ff'
        };
      }
      return {
        backgroundColor: `rgba(16, 185, 129, ${0.15 + intensity * 0.45})`,
        borderColor: 'rgba(16, 185, 129, 0.45)',
        color: '#a7f3d0'
      };
    } else {
      return {
        backgroundColor: `rgba(244, 63, 94, ${0.15 + intensity * 0.45})`,
        borderColor: 'rgba(244, 63, 94, 0.45)',
        color: '#fecdd3'
      };
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-surface border border-surface-border">
      <div className="flex flex-col w-40 shrink-0">
        <span className="text-[12px] font-mono font-semibold text-text tracking-tight">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] font-mono text-text-muted">
            {sublabel}
          </span>
        )}
      </div>

      {/* Dimensions bar */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1 justify-end" role="group" aria-label={`Vector components for ${label}`}>
        {displayedDims.map((val, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.15, y: -2 }}
            style={getDimStyle(val)}
            className="px-2 py-1 rounded border font-mono text-[10px] text-center min-w-[46px] shadow-sm transition-all select-none cursor-default font-semibold"
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
