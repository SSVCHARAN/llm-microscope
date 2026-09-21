import React from 'react';
import { Sliders, Flame, Snowflake, Sigma } from 'lucide-react';
import { CandidateLogit } from '../../types';
import { ProbabilityBars } from '../visualizations/ProbabilityBars';
import { SoftmaxCurve } from '../visualizations/SoftmaxCurve';

interface SoftmaxStageProps {
  candidates: CandidateLogit[];
  temperature: number;
  onTemperatureChange: (t: number) => void;
}

export const SoftmaxStage: React.FC<SoftmaxStageProps> = ({
  candidates,
  temperature,
  onTemperatureChange
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Interactive Temperature Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.08] bg-black/50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono uppercase tracking-wider text-white font-bold">
                Temperature Scaling (T)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[12px] font-bold">
                {temperature.toFixed(2)}
              </span>
            </div>
            <span className="text-[11px] text-[#A0A0A0]">
              Formula: P(i) = exp(z_i / T) / ∑ exp(z_j / T)
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="flex items-center gap-3 w-full sm:w-72">
          <span title="Low Temperature (Deterministic)">
            <Snowflake className="w-4 h-4 text-cyan-400 shrink-0" />
          </span>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.05"
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <span title="High Temperature (Creative / Random)">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
          </span>
        </div>
      </div>

      {/* Side-by-Side Visualizations: Softmax Curve + Resulting Probability Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Softmax Exponential Curve */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <SoftmaxCurve candidates={candidates} temperature={temperature} />

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] text-[#A0A0A0] leading-relaxed">
            {temperature < 0.5 ? (
              <span className="text-cyan-300">
                🧊 <strong>Cold Temperature (T = {temperature.toFixed(2)}):</strong> The exponential curve is steep! The top token absorbs nearly 100% of the probability, making the model deterministic and robotic.
              </span>
            ) : temperature > 1.2 ? (
              <span className="text-rose-300">
                🔥 <strong>Hot Temperature (T = {temperature.toFixed(2)}):</strong> The curve flattens out! Lower-ranked candidates get boosted, creating high diversity but risking chaotic or nonsensical outputs.
              </span>
            ) : (
              <span>
                ⚖️ <strong>Balanced Temperature (T = {temperature.toFixed(2)}):</strong> Natural sweet spot used in most modern chat systems.
              </span>
            )}
          </div>
        </div>

        {/* Real-time Probability Bars */}
        <div className="lg:col-span-7 flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/50 p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sigma className="w-4 h-4 text-emerald-400" />
              <span className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
                Top Vocabulary Probabilities (50,257 Total)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#888]">
              ∑ Probabilities = 100%
            </span>
          </div>

          <ProbabilityBars candidates={candidates} showLogit={true} />
        </div>
      </div>
    </div>
  );
};
