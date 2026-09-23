import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dices, Sparkles, Filter, ArrowRight } from 'lucide-react';
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
  phase?: number;
}

export const SamplingStage: React.FC<SamplingStageProps> = ({
  candidates,
  winnerToken,
  isDiceRolling,
  onRollDice,
  topK,
  onTopKChange,
  prompt,
  phase
}) => {
  const showAll = phase === undefined;
  const showResult = showAll || (phase !== undefined && phase >= 1);
  const filteredCandidates = candidates.slice(0, topK);

  // Educational Autoplay: Phase 1 automatically rolls the weighted dice to sample next token!
  useEffect(() => {
    if (phase === 1 && !isDiceRolling) {
      const timer = setTimeout(() => {
        onRollDice();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Sampling Controls & Dice Roll Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
              Top-K Truncation Filter (K = {topK})
            </span>
          </div>
          <span className="text-[11px] text-text-muted">
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
              className="w-48 accent-emerald-500 cursor-pointer focus-ring rounded"
            />
            <span className="text-[12px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
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
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono text-[13px] font-bold tracking-wide transition-all shadow-md active:scale-95 focus-ring ${
            isDiceRolling
              ? 'bg-amber-500 text-black animate-pulse'
              : 'bg-primary text-white dark:text-black hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-[0_0_24px_rgba(5,150,105,0.3)] dark:shadow-[0_0_24px_rgba(16,185,129,0.4)]'
          }`}
        >
          <Dices className={`w-5 h-5 ${isDiceRolling ? 'animate-spin' : ''}`} />
          <span>{isDiceRolling ? 'Rolling Weighted Dice...' : 'Sample Next Token 🎲'}</span>
        </motion.button>
      </div>

      {/* Result Hero Showcase: Prompt + Sampled Token */}
      {showResult && (
        <motion.div
          data-autoplay-focal={phase === 1 ? 'true' : undefined}
          initial={showAll ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col gap-3 p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] to-surface shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors duration-200"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Cycle Step Output</span>
            </div>
            <span className="text-[11px] font-mono text-text-muted">
              Selected token appends to Context Array
            </span>
          </div>

          {/* Text comparison */}
          <div className="flex flex-col gap-2 py-2">
            <span className="text-[11px] font-mono uppercase text-text-muted">
              Autoregressive Sequence Result:
            </span>
            <div className="text-xl sm:text-2xl font-mono tracking-tight leading-relaxed">
              <span className="text-text-main/90">{prompt}</span>
              <motion.span
                key={winnerToken}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="inline-block px-2.5 py-0.5 rounded-lg bg-primary text-white dark:text-black font-bold mx-1.5 shadow-[0_0_20px_rgba(5,150,105,0.4)] dark:shadow-[0_0_24px_rgba(16,185,129,0.8)]"
              >
                {winnerToken}
              </motion.span>
            </div>
          </div>

          {/* Autoregressive Loop explanation */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-raised border border-border text-[12px] font-mono text-text-secondary">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                The Autoregressive Loop: How Text is Generated
              </span>
              <span className="text-[10px] text-text-muted">
                Feedback cycle (1 Token per Forward Pass)
              </span>
            </div>

            {/* Visual loop conduit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-border text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-raised text-text-main font-bold border border-border-subtle">Input (N=5):</span>
                <span className="text-text-muted italic">"The cat sat on the"</span>
              </div>
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold"
              >
                <span>Forward Pass</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">Output (N=6):</span>
                <span className="text-text-main font-bold">"... the <span className="text-emerald-700 dark:text-emerald-400 underline">mat</span>"</span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed pt-1">
              GPT does not produce full paragraphs in a single step. Each forward pass (Stages 1 through 7) computes the probability distribution for <em>just one token</em>. The sampled token <code className="text-emerald-800 dark:text-emerald-300 font-bold bg-surface px-1 py-0.5 rounded border border-border-subtle">" mat"</code> is appended to the prompt, and the updated 6-token sequence is fed back into Stage 1 to predict token #7!
            </p>
          </div>
        </motion.div>
      )}

      {/* Eligible Candidates Pool */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-semibold">
            Filtered Candidates in Sampling Pool (Top {topK})
          </span>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
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
