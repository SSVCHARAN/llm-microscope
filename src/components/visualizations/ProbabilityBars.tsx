import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { CandidateLogit } from '../../types';

interface ProbabilityBarsProps {
  candidates: CandidateLogit[];
  winnerToken?: string;
  showLogit?: boolean;
}

export const ProbabilityBars: React.FC<ProbabilityBarsProps> = ({
  candidates,
  winnerToken,
  showLogit = true
}) => {
  return (
    <div className="flex flex-col gap-2.5 w-full font-sans">
      {candidates.map((cand, idx) => {
        const isWinner = winnerToken ? cand.token === winnerToken : cand.isWinner;
        const percentage = (cand.probability * 100).toFixed(1);

        return (
          <div
            key={cand.token}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all ${
              isWinner
                ? 'bg-emerald-500/[0.08] border-emerald-500/50 shadow-[0_0_20px_rgba(5,150,105,0.15)] ring-1 ring-emerald-500/40'
                : 'bg-surface border-border-subtle hover:bg-surface-raised'
            }`}
          >
            <div className="flex items-center justify-between text-[12px] font-mono">
              {/* Token Rank & Name */}
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] w-5 text-right font-bold tabular-nums ${isWinner ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-muted'}`}>
                  #{cand.rank}
                </span>

                <span
                  className={`px-2 py-0.5 rounded border font-mono text-[13px] font-bold whitespace-pre-wrap ${
                    isWinner
                      ? 'bg-primary text-white dark:text-black border-emerald-600 dark:border-emerald-400 shadow-[0_0_10px_rgba(5,150,105,0.3)]'
                      : 'bg-surface-raised text-text-main border-border'
                  }`}
                >
                  {cand.display}
                </span>

                {isWinner && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    <Trophy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Winner
                  </span>
                )}
              </div>

              {/* Logit Score and Probability */}
              <div className="flex items-center gap-4">
                {showLogit && (
                  <span className="text-[11px] text-text-muted hidden sm:inline font-mono">
                    logit: <span className="text-text-main font-medium tabular-nums">{cand.logit.toFixed(2)}</span>
                  </span>
                )}

                <span
                  className={`text-[13px] font-bold min-w-[54px] text-right font-mono tabular-nums ${
                    isWinner ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-main'
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Dynamic Probability Bar */}
            <div
              className="w-full h-2 rounded-full bg-surface-subtle dark:bg-black/60 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(cand.probability * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Candidate "${cand.display}" probability ${percentage}%`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(1, cand.probability * 100)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isWinner
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 shadow-[0_0_12px_rgba(5,150,105,0.6)] dark:shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                    : idx === 0
                    ? 'bg-emerald-600 dark:bg-emerald-500'
                    : 'bg-emerald-600/30 dark:bg-emerald-500/40'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
