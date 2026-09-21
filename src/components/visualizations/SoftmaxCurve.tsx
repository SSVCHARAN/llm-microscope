import React from 'react';
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

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-black/60 shadow-xl">
      <div className="flex justify-between items-center text-[11px] font-mono border-b border-white/[0.06] pb-2">
        <span className="text-white font-semibold uppercase tracking-wider">
          Exponential Curve exp(z / T)
        </span>
        <span className="text-emerald-400">
          T = {temperature.toFixed(2)}
        </span>
      </div>

      <svg width={width} height={height} className="overflow-visible select-none my-1">
        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />

        {/* Labels */}
        <text x={padding} y={height - 10} className="font-mono text-[9px] fill-[#888]">
          Logit 4.0
        </text>
        <text x={width - padding - 35} y={height - 10} className="font-mono text-[9px] fill-[#888]">
          Logit 8.5
        </text>
        <text x={padding - 20} y={padding + 5} className="font-mono text-[9px] fill-[#888]" textAnchor="end">
          exp(z)
        </text>

        {/* Softmax curve */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(16,185,129,0.9)"
          strokeWidth={2.5}
        />

        {/* Dots for top candidates */}
        {candidates.slice(0, 5).map((cand) => {
          const clampedLogit = Math.max(minX, Math.min(maxX, cand.logit));
          const yVal = Math.exp(clampedLogit / Math.max(0.1, temperature));
          const svgX = padding + ((clampedLogit - minX) / (maxX - minX)) * (width - 2 * padding);
          const svgY = height - padding - (yVal / maxExp) * (height - 2 * padding);

          return (
            <g key={cand.token}>
              <circle
                cx={svgX}
                cy={svgY}
                r={4}
                className="fill-white stroke-emerald-500 stroke-2"
              />
              <text
                x={svgX}
                y={svgY - 8}
                textAnchor="middle"
                className="font-mono text-[9px] fill-white font-bold"
              >
                {cand.display}
              </text>
            </g>
          );
        })}
      </svg>

      <span className="text-[10px] font-mono text-[#888] leading-tight text-center">
        The exponential curve radically amplifies high logits while crushing low logits close to zero.
      </span>
    </div>
  );
};
