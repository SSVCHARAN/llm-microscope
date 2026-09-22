import React, { useState } from 'react';
import { Sliders, Flame, Snowflake, Sigma, X as MultiplyIcon, Equal, TableProperties, Sparkles, BookOpen, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { CandidateLogit, UnembeddingData } from '../../types';
import { ProbabilityBars } from '../visualizations/ProbabilityBars';
import { SoftmaxCurve } from '../visualizations/SoftmaxCurve';
import { VectorBar } from '../visualizations/VectorBar';

interface SoftmaxStageProps {
  candidates: CandidateLogit[];
  temperature: number;
  onTemperatureChange: (t: number) => void;
  unembeddingData: UnembeddingData;
}

export const SoftmaxStage: React.FC<SoftmaxStageProps> = ({
  candidates,
  temperature,
  onTemperatureChange,
  unembeddingData
}) => {
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0); // default " mat"

  const selectedColumn = unembeddingData.columns[selectedWordIndex];

  // Calculate live conversion values for the candidate table
  const temp = Math.max(0.05, temperature);
  
  // High candidates + negative probes
  const tableTokens = [
    ...candidates.slice(0, 5),
    {
      rank: 50256,
      token: ' quantum',
      display: '␣quantum',
      logit: -3.24,
      scaledLogit: -3.24 / temp,
      expVal: Math.exp(-3.24 / temp),
      probability: 0.00001,
      logprob: -11.5,
      isWinner: false
    },
    {
      rank: 50257,
      token: ' banana',
      display: '␣banana',
      logit: -4.38,
      scaledLogit: -4.38 / temp,
      expVal: Math.exp(-4.38 / temp),
      probability: 0.000001,
      logprob: -13.8,
      isWinner: false
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Educational Concept Banner */}
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-[12px] font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>The Central Mystery: How Numbers Become English Words</span>
        </div>
        <p className="text-[12px] leading-relaxed text-[#D0D0D0]">
          Stage 5 ended with 4 abstract continuous numbers representing the model's thoughts after reasoning. In Stage 6, we perform a <strong>two-step transformation</strong>:
          <br />
          <strong>Step 1 (Unembedding W_U):</strong> We compare the 4 numbers against 50,257 dictionary definitions via dot product to give every word an unnormalized score (<strong>Logit</strong>).
          <br />
          <strong>Step 2 (Softmax):</strong> We run those raw scores through an exponential curve and normalize them into calibrated <strong>Percentages (%)</strong>!
        </p>
      </div>

      {/* 1. The Unembedding Matrix (W_U) Matrix Multiplication */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-mono uppercase tracking-wider text-white font-bold">
              Step 1: The Unembedding Matrix (W_U) Multiplication
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Formula: Logits (1 × 50,257) = x_final (1 × 4) × W_U (4 × 50,257)
          </span>
        </div>

        {/* 1. Final Vector from Stage 5 */}
        <VectorBar
          label="1. Final Thought Vector (x_final)"
          sublabel="Token's final coordinates after Stage 5 FFN processing + Residual highway"
          vector={unembeddingData.finalVector}
          colorTheme="amber"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Multiply Symbol */}
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <MultiplyIcon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* 2. Unembedding Matrix Columns (Dictionary Words) */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/50 border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono uppercase tracking-wider text-white font-bold">
                2. Unembedding Matrix W_U (50,257 Word Columns)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#888]">
              Click any word column to inspect its dot product
            </span>
          </div>

          <p className="text-[11px] text-[#A0A0A0] leading-relaxed">
            Every word in the 50,257 vocabulary has a 4-dimensional column vector in W_U defining what that concept "looks like". The model calculates the dot product between <code className="text-white">x_final</code> and each column:
          </p>

          {/* Word column chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {unembeddingData.columns.map((col, idx) => {
              const isSelected = selectedWordIndex === idx;
              const isPositive = col.logit > 0;
              return (
                <button
                  key={col.token}
                  onClick={() => setSelectedWordIndex(idx)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-white border-white bg-white/[0.08] shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold text-white whitespace-pre-wrap">
                      {col.display}
                    </span>
                    <span className={`text-[11px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {col.logit >= 0 ? `+${col.logit.toFixed(2)}` : col.logit.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#888] mt-1">
                    {col.category === 'top' ? 'Top Match' : col.category === 'runner_up' ? 'Runner Up' : 'Unrelated Word'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Dot Product Inspector for Selected Word */}
          <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-black/70 border border-white/[0.06] mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
                Dot Product Calculation for "{selectedColumn.display}":
              </span>
              <span className="text-[11px] font-mono text-white">
                Logit = <strong className={selectedColumn.logit > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {selectedColumn.logit >= 0 ? `+${selectedColumn.logit.toFixed(2)}` : selectedColumn.logit.toFixed(2)}
                </strong>
              </span>
            </div>

            <div className="p-2 rounded bg-white/[0.03] font-mono text-[11px] text-white overflow-x-auto select-all">
              {selectedColumn.dotProductCalculation}
            </div>

            <p className="text-[11px] text-[#A0A0A0] leading-relaxed mt-0.5">
              {selectedColumn.explanation}
            </p>
          </div>
        </div>

        {/* Equals Symbol */}
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Equal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* 3. Raw Logits Vector */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold">
            3. Raw Unnormalized Logits Vector (z) — 50,257 Arbitrary Scores
          </span>
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[12px]">
            {unembeddingData.columns.map((c) => (
              <div
                key={c.token}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08]"
              >
                <span className="text-[#A0A0A0]">{c.display}:</span>
                <span className={`font-bold ${c.logit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {c.logit >= 0 ? `+${c.logit.toFixed(2)}` : c.logit.toFixed(2)}
                </span>
              </div>
            ))}
            <span className="text-[11px] text-[#666] pl-2">
              ... [and 50,251 more words]
            </span>
          </div>
          <span className="text-[11px] text-[#888] italic mt-1">
            Notice that logits are raw, unbounded numbers (from +7.83 down to -4.38). They cannot be used as probabilities yet because probabilities must be positive and sum to 100%!
          </span>
        </div>
      </div>

      {/* 2. Step 2: The Softmax Conversion Table (Live Math) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-mono uppercase tracking-wider text-white font-bold">
              Step 2: The Softmax Conversion (Turning Numbers into Percentages)
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Pipeline: Raw Logit (z) → Scale (z / T) → Exponent (e^(z/T)) → Divide by Sum = Probability (%)
            </span>
          </div>

          {/* Temperature Slider */}
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/80 border border-white/10 self-start sm:self-auto">
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
              className="w-32 accent-emerald-400 cursor-pointer"
            />
            <span title="High Temperature (Creative / Random)">
              <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
              T = {temperature.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Live Mathematical Conversion Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#888] uppercase tracking-wider">
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Raw Logit (z)</th>
                <th className="py-2.5 px-3">Scaled (z / T)</th>
                <th className="py-2.5 px-3">Exponent e^(z/T)</th>
                <th className="py-2.5 px-3">Softmax Prob (%)</th>
                <th className="py-2.5 px-3">Educational Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {tableTokens.map((item, idx) => {
                const isWinner = item.token === ' mat';
                const isNegative = item.logit < 0;
                const scaled = item.logit / temp;
                const exp = Math.exp(Math.min(70, Math.max(-70, scaled)));
                const probPercent = (item.probability * 100).toFixed(item.probability < 0.001 ? 4 : 1);

                return (
                  <tr
                    key={item.token}
                    className={`transition-colors ${
                      isWinner
                        ? 'bg-emerald-500/[0.08] font-semibold text-white'
                        : isNegative
                        ? 'bg-rose-500/[0.03] text-[#888]'
                        : 'hover:bg-white/[0.02] text-[#EDEDED]'
                    }`}
                  >
                    {/* Token */}
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 font-bold whitespace-pre-wrap">
                        {item.display}
                      </span>
                    </td>

                    {/* Raw Logit */}
                    <td className="py-2.5 px-3">
                      <span className={item.logit > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.logit >= 0 ? `+${item.logit.toFixed(2)}` : item.logit.toFixed(2)}
                      </span>
                    </td>

                    {/* Scaled */}
                    <td className="py-2.5 px-3 text-[#A0A0A0]">
                      {scaled >= 0 ? `+${scaled.toFixed(2)}` : scaled.toFixed(2)}
                    </td>

                    {/* Exponent */}
                    <td className="py-2.5 px-3 text-white">
                      {exp >= 1000 ? exp.toLocaleString(undefined, { maximumFractionDigits: 0 }) : exp.toFixed(exp < 0.01 ? 5 : 2)}
                    </td>

                    {/* Prob % */}
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${isWinner ? 'text-emerald-400 text-[13px]' : 'text-white'}`}>
                        {probPercent}%
                      </span>
                    </td>

                    {/* Result */}
                    <td className="py-2.5 px-3 text-[10px]">
                      {isWinner ? (
                        <span className="text-emerald-300 font-bold">👑 Top Winner (+7.83)</span>
                      ) : isNegative ? (
                        <span className="text-rose-400/80">Silenced near zero (negative logit)</span>
                      ) : (
                        <span className="text-[#A0A0A0]">Viable candidate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-[#A0A0A0]">
          <span className="text-emerald-400 font-bold">How Softmax Solves Negative Scores:</span>
          <span>Because the exponential function e^z is always strictly positive (e^-4.38 = 0.012), negative logits can never produce negative probabilities. They simply shrink down close to 0%!</span>
        </div>
      </div>

      {/* 3. Visualizations: Softmax Curve + Resulting Probability Bars */}
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
