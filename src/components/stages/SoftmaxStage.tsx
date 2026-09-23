import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Flame, Snowflake, X as MultiplyIcon, Equal, TableProperties, Sparkles, BookOpen } from 'lucide-react';
import { CandidateLogit, UnembeddingData } from '../../types';
import { SoftmaxCurve } from '../visualizations/SoftmaxCurve';
import { VectorBar } from '../visualizations/VectorBar';

interface SoftmaxStageProps {
  candidates: CandidateLogit[];
  temperature: number;
  onTemperatureChange: (t: number) => void;
  unembeddingData: UnembeddingData;
  phase?: number;
}

export const SoftmaxStage: React.FC<SoftmaxStageProps> = ({
  candidates,
  temperature,
  onTemperatureChange,
  unembeddingData,
  phase
}) => {
  const showAll = phase === undefined;
  const showStep2 = showAll || (phase !== undefined && phase >= 1);

  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0); // default " mat"

  // Educational Autoplay: Phase 0 inspects runner-up word then winner " mat"
  useEffect(() => {
    if (phase === undefined) return;
    if (phase === 0) {
      setSelectedWordIndex(1); // inspect " sat" (+6.12)
      const timer = setTimeout(() => setSelectedWordIndex(0), 1200); // inspect " mat" (+7.83)
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const selectedColumn = unembeddingData.columns[selectedWordIndex];
  const temp = Math.max(0.05, temperature);
  
  // Combine top candidates with negative probes for educational contrast
  const allProbeLogits = [
    ...candidates.slice(0, 5).map(c => ({ ...c, isWinner: c.token === ' mat' })),
    {
      rank: 50256,
      token: ' quantum',
      display: '␣quantum',
      logit: -3.24,
      isWinner: false
    },
    {
      rank: 50257,
      token: ' banana',
      display: '␣banana',
      logit: -4.38,
      isWinner: false
    }
  ];

  // Numerically stable softmax: subtract max logit before exponentiating
  const maxProbeLogit = Math.max(...allProbeLogits.map(p => p.logit / temp));
  const probeExps = allProbeLogits.map(p => Math.exp(Math.min(70, Math.max(-70, (p.logit / temp) - maxProbeLogit))));
  const probeSumExp = probeExps.reduce((acc, v) => acc + v, 0);

  const tableTokens = allProbeLogits.map((item, idx) => {
    const scaled = item.logit / temp;
    const rawExp = Math.exp(Math.min(70, Math.max(-70, scaled)));
    const prob = probeExps[idx] / Math.max(1e-9, probeSumExp);
    return {
      ...item,
      scaledLogit: scaled,
      expVal: rawExp,
      probability: prob,
      logprob: Math.log(Math.max(1e-12, prob))
    };
  });

  return (
    <div className="flex flex-col gap-8 w-full font-sans">
      {/* Educational Concept Banner */}
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono text-[12px] font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>The Central Mystery: How Numbers Become English Words</span>
        </div>
        <p className="text-[12px] leading-relaxed text-text-secondary">
          Stage 5 ended with 4 abstract continuous numbers representing the model's thoughts after reasoning. In Stage 6, we perform a <strong>two-step transformation</strong>:
          <br />
          <strong>Step 1 (Unembedding W_U):</strong> We compare the 4 numbers against 50,257 dictionary definitions via dot product to give every word an unnormalized score (<strong>Logit</strong>).
          <br />
          <strong>Step 2 (Softmax):</strong> We run those raw scores through an exponential curve and normalize them into calibrated <strong>Percentages (%)</strong>!
        </p>
      </div>

      {/* 1. The Unembedding Matrix (W_U) Matrix Multiplication */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm dark:shadow-2xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[13px] font-mono uppercase tracking-wider text-text-main font-bold">
              Step 1: The Unembedding Matrix (W_U) Multiplication
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
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
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center shadow-sm">
            <MultiplyIcon className="w-3.5 h-3.5 text-text-main" />
          </div>
        </div>

        {/* 2. Unembedding Matrix Columns (Dictionary Words) */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-raised border border-border-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
                2. Unembedding Matrix W_U (50,257 Word Columns)
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">
              Click any word column to inspect its dot product
            </span>
          </div>

          <p className="text-[11px] text-text-secondary leading-relaxed">
            Every word in the 50,257 vocabulary has a 4-dimensional column vector in W_U defining what that concept "looks like". The model calculates the dot product between <code className="text-text-main bg-surface px-1 py-0.5 rounded border border-border-subtle">x_final</code> and each column:
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
                      ? 'ring-2 ring-emerald-600 dark:ring-white border-emerald-600 dark:border-white bg-surface shadow-md'
                      : 'bg-surface border-border-subtle hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold text-text-main whitespace-pre-wrap">
                      {col.display}
                    </span>
                    <span className={`text-[11px] font-mono font-bold ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {col.logit >= 0 ? `+${col.logit.toFixed(2)}` : col.logit.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-text-dim mt-1">
                    {col.category === 'top' ? 'Top Match' : col.category === 'runner_up' ? 'Runner Up' : 'Unrelated Word'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Dot Product Inspector for Selected Word */}
          <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-surface border border-border mt-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                Dot Product Calculation for "{selectedColumn.display}":
              </span>
              <span className="text-[11px] font-mono text-text-main">
                Logit = <strong className={selectedColumn.logit > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                  {selectedColumn.logit >= 0 ? `+${selectedColumn.logit.toFixed(2)}` : selectedColumn.logit.toFixed(2)}
                </strong>
              </span>
            </div>

            <div className="p-2 rounded bg-surface-raised border border-border-subtle font-mono text-[11px] text-text-main overflow-x-auto select-all">
              {selectedColumn.dotProductCalculation}
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
              {selectedColumn.explanation}
            </p>
          </div>
        </div>

        {/* Equals Symbol */}
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center shadow-sm">
            <Equal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* 3. Raw Logits Vector */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-raised border border-border-subtle">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-main font-bold">
            3. Raw Unnormalized Logits Vector (z) — 50,257 Arbitrary Scores
          </span>
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[12px]">
            {unembeddingData.columns.map((c) => (
              <div
                key={c.token}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border shadow-sm"
              >
                <span className="text-text-muted">{c.display}:</span>
                <span className={`font-bold ${c.logit > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {c.logit >= 0 ? `+${c.logit.toFixed(2)}` : c.logit.toFixed(2)}
                </span>
              </div>
            ))}
            <span className="text-[11px] text-text-dim pl-2">
              ... [and 50,251 more words]
            </span>
          </div>
          <span className="text-[11px] text-text-muted italic mt-1">
            Notice that logits are raw, unbounded numbers (from +7.83 down to -4.38). They cannot be used as probabilities yet because probabilities must be positive and sum to 100%!
          </span>
        </div>
      </div>

      {/* 2. Step 2: The Softmax Conversion Table (Live Math) */}
      {showStep2 && (
        <motion.div 
          data-autoplay-focal={phase === 1 ? 'true' : undefined}
          initial={showAll ? false : { opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm dark:shadow-2xl transition-colors duration-200 w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-mono uppercase tracking-wider text-text-main font-bold">
                  Step 2: The Softmax Conversion (Turning Numbers into Percentages)
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                  Pipeline: Raw Logit (z) → Scale (z / T) → Exponent (e^(z/T)) → Divide by Sum = Probability (%)
                </span>
              </div>

              {/* Temperature Slider */}
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-raised border border-border self-start sm:self-auto shadow-sm">
                <span title="Low Temperature (Deterministic)">
                  <Snowflake className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  aria-label="Temperature scaling parameter (T)"
                  aria-valuemin={0.1}
                  aria-valuemax={2.0}
                  aria-valuenow={temperature}
                  onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                  className="w-32 accent-emerald-500 cursor-pointer focus-ring rounded"
                />
                <span title="High Temperature (Creative / Random)">
                  <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold">
                  T = {temperature.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Live Mathematical Conversion Table */}
            <div className="overflow-x-auto w-full max-w-full touch-pan-x pb-2 custom-scrollbar">
              <table className="w-full min-w-[560px] text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-border-subtle text-text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-3 whitespace-nowrap">Token</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Raw Logit (z)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Scaled (z / T)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Exponent e^(z/T)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Softmax Prob (%)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Educational Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border-subtle">
                  {tableTokens.map((item) => {
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
                            ? 'bg-emerald-500/[0.08] font-semibold text-text-main'
                            : isNegative
                            ? 'bg-rose-500/[0.03] text-text-muted'
                            : 'hover:bg-surface-raised text-text-main'
                        }`}
                      >
                        {/* Token */}
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-surface-raised border border-border font-bold whitespace-pre-wrap">
                            {item.display}
                          </span>
                        </td>

                        {/* Raw Logit */}
                        <td className="py-2.5 px-3">
                          <span className={item.logit > 0 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-700 dark:text-rose-400'}>
                            {item.logit >= 0 ? `+${item.logit.toFixed(2)}` : item.logit.toFixed(2)}
                          </span>
                        </td>

                        {/* Scaled */}
                        <td className="py-2.5 px-3 text-text-secondary">
                          {scaled >= 0 ? `+${scaled.toFixed(2)}` : scaled.toFixed(2)}
                        </td>

                        {/* Exponent */}
                        <td className="py-2.5 px-3 text-text-main font-medium">
                          {exp >= 1000 ? exp.toLocaleString(undefined, { maximumFractionDigits: 0 }) : exp.toFixed(exp < 0.01 ? 5 : 2)}
                        </td>

                        {/* Prob % */}
                        <td className="py-2.5 px-3">
                          <span className={`font-bold ${isWinner ? 'text-emerald-700 dark:text-emerald-400 text-[13px]' : 'text-text-main'}`}>
                            {probPercent}%
                          </span>
                        </td>

                        {/* Result */}
                        <td className="py-2.5 px-3 text-[10px]">
                          {isWinner ? (
                            <span className="text-emerald-800 dark:text-emerald-300 font-bold">👑 Top Winner (+7.83)</span>
                          ) : isNegative ? (
                            <span className="text-rose-700 dark:text-rose-400/80">Silenced near zero (negative logit)</span>
                          ) : (
                            <span className="text-text-muted">Viable candidate</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-raised border border-border-subtle text-[11px] text-text-secondary">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">How Softmax Solves Negative Scores:</span>
              <span>Because the exponential function e^z is always strictly positive (e^-4.38 = 0.012), negative logits can never produce negative probabilities. They simply shrink down close to 0%!</span>
            </div>
          </div>

          {/* 3. Visualizations: Softmax Curve + Temperature Deep-Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Softmax Exponential Curve */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <SoftmaxCurve candidates={candidates} temperature={temperature} />

              <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-text-main font-mono text-[12px] font-bold">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>How Curve Steepness Dictates Output</span>
                </div>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  The exponential function <code className="text-emerald-800 dark:text-emerald-300 font-semibold bg-surface-raised px-1 py-0.5 rounded">y = e^(z/T)</code> is the bridge between raw neural scores and real-world English tokens:
                </p>
                <ul className="text-[11px] text-text-secondary space-y-1.5 list-disc list-inside">
                  <li>
                    <strong className="text-text-main">Steep slope (Low T):</strong> The top logit ({candidates[0]?.display}) shoots up like a cliff while runners-up drop to near zero, giving the leader almost 100% probability.
                  </li>
                  <li>
                    <strong className="text-text-main">Gentle slope (High T):</strong> The cliff flattens into a gentle hill, allowing lower-ranked words to sit much closer in height and receive viable probability slices.
                  </li>
                </ul>
              </div>
            </div>

            {/* Temperature (T) Deep-Dive & Control Panel */}
            <div className="lg:col-span-7 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm dark:shadow-2xl transition-colors duration-200">
              {/* Header & Quick Dial Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[13px] font-mono uppercase tracking-wider text-text-main font-bold">
                      Understanding Temperature (T)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                    Mathematical Role: Divisor inside the exponent exp(z / T)
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => onTemperatureChange(0.2)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      temperature <= 0.3
                        ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-400/40 shadow-sm'
                        : 'bg-surface-raised text-text-muted border-border hover:text-text-main'
                    }`}
                  >
                    🧊 Cold (0.2)
                  </button>
                  <button
                    onClick={() => onTemperatureChange(0.7)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      temperature > 0.3 && temperature <= 1.0
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400/40 shadow-sm'
                        : 'bg-surface-raised text-text-muted border-border hover:text-text-main'
                    }`}
                  >
                    ⚖️ Balanced (0.7)
                  </button>
                  <button
                    onClick={() => onTemperatureChange(1.5)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      temperature > 1.0
                        ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-400/40 shadow-sm'
                        : 'bg-surface-raised text-text-muted border-border hover:text-text-main'
                    }`}
                  >
                    🔥 Hot (1.5)
                  </button>
                </div>
              </div>

              {/* Live Telemetry Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Active Regime */}
                <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted">Current Regime</span>
                  <div className="text-[12px] font-mono font-bold">
                    {temperature < 0.5 ? (
                      <span className="text-cyan-700 dark:text-cyan-400">🧊 Deterministic</span>
                    ) : temperature > 1.1 ? (
                      <span className="text-rose-700 dark:text-rose-400">🔥 High Entropy</span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">⚖️ Balanced Chat</span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted leading-tight">
                    {temperature < 0.5
                      ? 'Argmax / greedy sampling'
                      : temperature > 1.1
                      ? 'High risk of hallucination'
                      : 'ChatGPT & Claude default'}
                  </span>
                </div>

                {/* Top Token Dominance */}
                <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted">#1 Token Dominance</span>
                  <div className="text-[13px] font-mono font-bold text-text-main flex items-center gap-1.5">
                    <span className="text-emerald-700 dark:text-emerald-400">{candidates[0]?.display}</span>
                    <span>{(candidates[0]?.probability * 100).toFixed(1)}%</span>
                  </div>
                  <span className="text-[10px] text-text-muted leading-tight">
                    {candidates[0]?.probability > 0.85
                      ? 'Monopolizing probability'
                      : candidates[0]?.probability > 0.5
                      ? 'Clear comfortable favorite'
                      : 'Highly contested / uncertain'}
                  </span>
                </div>

                {/* Competitor Viability */}
                <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted">#2 Token Viability</span>
                  <div className="text-[13px] font-mono font-bold text-text-main flex items-center gap-1.5">
                    <span className="text-text-secondary">{candidates[1]?.display}</span>
                    <span>{(candidates[1]?.probability * 100).toFixed(1)}%</span>
                  </div>
                  <span className="text-[10px] text-text-muted leading-tight">
                    {candidates[1]?.probability < 0.05
                      ? 'Almost no chance of selection'
                      : 'Competitive alternate branch'}
                  </span>
                </div>
              </div>

              {/* The 3 Regimes Explained */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-mono uppercase text-text-muted font-semibold tracking-wider">
                  The Three Temperature Regimes
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Cold */}
                  <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                    temperature < 0.5
                      ? 'bg-cyan-500/[0.08] border-cyan-500/40 ring-1 ring-cyan-500/30'
                      : 'bg-surface-raised border-border-subtle'
                  }`}>
                    <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-mono text-[11px] font-bold">
                      <Snowflake className="w-3.5 h-3.5" />
                      <span>Cold (T &lt; 0.5)</span>
                    </div>
                    <div className="text-[10px] font-mono text-text-main font-semibold">
                      "The Calculator"
                    </div>
                    <p className="text-[10px] leading-relaxed text-text-secondary">
                      Dividing by decimals makes logits huge. Exponents diverge dramatically: <strong className="text-text-main">the top token takes almost 100%</strong>.
                    </p>
                    <div className="mt-auto pt-1 text-[9px] font-mono text-cyan-800 dark:text-cyan-300">
                      ✓ Math, Code, SQL, Facts<br />
                      ✗ Repetitive loops
                    </div>
                  </div>

                  {/* Balanced */}
                  <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                    temperature >= 0.5 && temperature <= 1.1
                      ? 'bg-emerald-500/[0.08] border-emerald-500/40 ring-1 ring-emerald-500/30'
                      : 'bg-surface-raised border-border-subtle'
                  }`}>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold">
                      <span className="text-sm">⚖️</span>
                      <span>Balanced (T = 0.7 - 1.0)</span>
                    </div>
                    <div className="text-[10px] font-mono text-text-main font-semibold">
                      "The Conversationalist"
                    </div>
                    <p className="text-[10px] leading-relaxed text-text-secondary">
                      Preserves top candidate rankings while giving reasonable synonyms a 5–20% chance to be picked.
                    </p>
                    <div className="mt-auto pt-1 text-[9px] font-mono text-emerald-800 dark:text-emerald-300">
                      ✓ Natural rhythm & variety<br />
                      ✓ Used in ChatGPT & Claude
                    </div>
                  </div>

                  {/* Hot */}
                  <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                    temperature > 1.1
                      ? 'bg-rose-500/[0.08] border-rose-500/40 ring-1 ring-rose-500/30'
                      : 'bg-surface-raised border-border-subtle'
                  }`}>
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-mono text-[11px] font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Hot (T &gt; 1.2)</span>
                    </div>
                    <div className="text-[10px] font-mono text-text-main font-semibold">
                      "The Chaotic Dreamer"
                    </div>
                    <p className="text-[10px] leading-relaxed text-text-secondary">
                      Dividing by large T compresses differences toward zero (z/T → 0, e^0 = 1). All 50,257 tokens approach equal probability.
                    </p>
                    <div className="mt-auto pt-1 text-[9px] font-mono text-rose-800 dark:text-rose-300">
                      ✓ Wild metaphors & brainstorming<br />
                      ✗ Hallucinations & gibberish
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Insight / Myth-Buster Callout */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-raised border border-border text-[11px] text-text-secondary">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-main">Why isn't Temperature trained?</strong> Temperature is purely an <em>inference-time hyperparameter</em>. The neural network's weights and the resulting logits ({candidates[0]?.display} = {candidates[0]?.logit.toFixed(2)}) remain 100% identical. Temperature is just a slider applied in the user's browser or API call to control how risk-tolerant the sampling is!
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
