import React from 'react';
import { motion } from 'framer-motion';
import { CandidateLogit } from '../../types';

interface SoftmaxCurveProps {
  candidates: CandidateLogit[];
  temperature: number;
}

export const SoftmaxCurve: React.FC<SoftmaxCurveProps> = ({ candidates, temperature }) => {
  const width = 360;
  const height = 180;
  const padding = 30;

  // X range: logit values (e.g. 4.0 to 8.5)
  const minX = 4.0;
  const maxX = 8.5;

  // SVG points for exponential curve y = exp(x / T)
  const points: string[] = [];
  const numSteps = 40;
  const maxExp = Math.exp(maxX / Math.max(0.1, temperature));

  for (let i = 0; i <= numSteps; i++) {
    const xVal = minX + (i / numSteps) * (maxX - minX);
    const yVal = Math.exp(xVal / Math.max(0.1, temperature));
    
    // Scale to SVG coords
    const svgX = padding + ((xVal - minX) / (maxX - minX)) * (width - 2 * padding);
    const svgY = height - padding - (yVal / maxExp) * (height - 2 * padding);
    points.push(`${svgX},${svgY}`);
  }

  const pathData = `M ${points.join(' L ')}`;
  const areaData = `${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-surface shadow-sm dark:shadow-2xl transition-colors duration-200">
      <div className="flex justify-between items-center text-[12px] font-mono border-b border-border-subtle pb-3">
        <span className="text-text-main font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          Exponential Curve: exp(z / T)
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
          T = {temperature.toFixed(2)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none my-1"
        role="img"
        aria-label={`Exponential softmax curve at temperature ${temperature.toFixed(2)} displaying top token candidate probabilities`}
      >
        <defs>
          <linearGradient id="softmaxCurveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          className="text-slate-300 dark:text-white/15"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="currentColor"
          className="text-slate-300 dark:text-white/15"
          strokeWidth={1}
        />

        {/* Labels */}
        <text x={padding} y={height - 10} className="font-mono text-[9px] fill-slate-500 dark:fill-[#A3A3A3]">
          Logit 4.0
        </text>
        <text x={width - padding - 35} y={height - 10} className="font-mono text-[9px] fill-slate-500 dark:fill-[#A3A3A3]">
          Logit 8.5
        </text>
        <text x={padding - 10} y={padding - 5} className="font-mono text-[9px] fill-slate-500 dark:fill-[#A3A3A3]" textAnchor="end">
          exp(z)
        </text>

        {/* Softmax curve area gradient & line */}
        <path d={areaData} fill="url(#softmaxCurveGradient)" />
        <motion.path
          d={pathData}
          fill="none"
          stroke="currentColor"
          className="text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Dots for top candidates */}
        {candidates.slice(0, 5).map((cand, idx) => {
          const clampedLogit = Math.max(minX, Math.min(maxX, cand.logit));
          const yVal = Math.exp(clampedLogit / Math.max(0.1, temperature));
          const svgX = padding + ((clampedLogit - minX) / (maxX - minX)) * (width - 2 * padding);
          const svgY = height - padding - (yVal / maxExp) * (height - 2 * padding);
          const isWinner = cand.token === ' mat';
          // Stagger vertical text offset to avoid overlapping crowded points
          const textOffsetY = isWinner ? -10 : idx % 2 === 0 ? -9 : 14;

          return (
            <motion.g
              key={cand.token}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35 + idx * 0.1, type: "spring", stiffness: 350, damping: 20 }}
            >
              <circle
                cx={svgX}
                cy={svgY}
                r={isWinner ? 5.5 : 3.5}
                className={
                  isWinner
                    ? "fill-emerald-500 stroke-white stroke-2 shadow-[0_0_12px_rgba(5,150,105,0.8)]"
                    : "fill-white dark:fill-surface stroke-emerald-600 dark:stroke-emerald-500 stroke-2"
                }
              />
              <text
                x={svgX}
                y={svgY + textOffsetY}
                textAnchor="middle"
                className={`font-mono text-[9px] ${
                  isWinner
                    ? 'fill-emerald-800 dark:fill-emerald-300 font-extrabold'
                    : 'fill-slate-700 dark:fill-[#E2E8F0] font-semibold'
                }`}
              >
                {cand.display}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle text-[11px] font-mono text-text-muted text-center">
        The exponential function e^(z/T) exponentially blows up the top logits while compressing lower logits toward zero.
      </div>
    </div>
  );
};
