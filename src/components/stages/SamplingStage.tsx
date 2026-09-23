import React from 'react';
import { motion } from 'framer-motion';
import { Dices, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { CandidateLogit } from '../../types';
import { ProbabilityBars } from '../visualizations/ProbabilityBars';

interface SamplingStageProps {
  candidates: CandidateLogit[];
  winnerToken: string;
  isDiceRolling: boolean;
  onRollDice: () => void;
  topK: number;
  onTopKChange: (k: number) => void;
  prompt: string;
}

export const SamplingStage: React.FC<SamplingStageProps> = ({
  candidates,
  winnerToken,
  isDiceRolling,
  onRollDice,
  topK,
  onTopKChange,
  prompt
}) => {
  const filteredCandidates = candidates.slice(0, topK);
  const fullSentence = `${prompt}${winnerToken}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Sampling Controls & Dice Roll Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-xl border border-white/[0.08] bg-black/60 shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-white font-bold">
              Top-K Truncation Filter (K = {topK})
            </span>
          </div>
          <span className="text-[11px] text-[#A0A0A0]">
            Cut off tail words to eliminate nonsensical low-probability tokens.
          </span>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={topK}
              aria-label="Top-K truncation filter parameter"
              aria-valuemin={1}
              aria-valuemax={8}
              aria-valuenow={topK}
              onChange={(e) => onTopKChange(parseInt(e.target.value))}
              className="w-48 accent-emerald-400 cursor-pointer focus-ring rounded"
            />
            <span className="text-[12px] font-mono text-emerald-300 font-bold">
              Top {topK} Candidates
            </span>
          </div>
        </div>

        {/* Dice Roll Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRollDice}
          disabled={isDiceRolling}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono text-[13px] font-bold tracking-wide transition-all shadow-xl ${
            isDiceRolling
              ? 'bg-amber-500 text-black animate-pulse'
              : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
          }`}
        >
          <Dices className={`w-5 h-5 ${isDiceRolling ? 'animate-spin' : ''}`} />
          <span>{isDiceRolling ? 'Rolling Weighted Dice...' : 'Sample Next Token 🎲'}</span>
        </motion.button>
      </div>

      {/* Result Hero Showcase: Prompt + Sampled Token */}
      <div className="flex flex-col gap-3 p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] to-black/80 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Cycle Step Output</span>
          </div>
          <span className="text-[11px] font-mono text-[#888]">
            Selected token appends to Context Array
          </span>
        </div>

        {/* Text comparison */}
        <div className="flex flex-col gap-2 py-2">
          <span className="text-[11px] font-mono uppercase text-[#777]">
            Autoregressive Sequence Result:
          </span>
          <div className="text-xl sm:text-2xl font-mono tracking-tight leading-relaxed">
            <span className="text-white/80">{prompt}</span>
            <motion.span
              key={winnerToken}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-500 text-black font-bold mx-1.5 shadow-[0_0_24px_rgba(16,185,129,0.8)]"
            >
              {winnerToken}
            </motion.span>
          </div>
        </div>

        {/* Autoregressive Loop explanation */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-black/60 border border-white/[0.06] text-[12px] font-mono text-[#A0A0A0]">
          <span className="text-emerald-400 font-bold">Autoregressive Loop:</span>
          <span>New sequence length = {prompt.split(' ').length + 1} tokens. The pipeline feeds this expanded sequence back into Stage 1 to predict token #{prompt.split(' ').length + 2}!</span>
        </div>
      </div>

      {/* Eligible Candidates Pool */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/50 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <span className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
            Filtered Candidates in Sampling Pool (Top {topK})
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Selected Winner Highlighted
          </span>
        </div>

        <ProbabilityBars
          candidates={filteredCandidates}
          winnerToken={winnerToken}
          showLogit={true}
        />
      </div>
    </div>
  );
};
