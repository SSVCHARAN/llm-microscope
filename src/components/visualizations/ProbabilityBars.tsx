import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trophy } from 'lucide-react';
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
    <div className="flex flex-col gap-2.5 w-full">
      {candidates.map((cand, idx) => {
        const isWinner = winnerToken ? cand.token === winnerToken : cand.isWinner;
        const percentage = (cand.probability * 100).toFixed(1);

        return (
          <div
            key={cand.token}
            className={`flex flex-col gap-1.5 p-2.5 rounded-lg border transition-all ${
              isWinner
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px] font-mono">
              {/* Token Rank & Name */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] w-5 text-right ${isWinner ? 'text-emerald-400 font-bold' : 'text-[#888]'}`}>
                  #{cand.rank}
                </span>

                <span
                  className={`px-2 py-0.5 rounded border font-mono text-[13px] font-semibold whitespace-pre-wrap ${
                    isWinner
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-white/[0.05] text-white border-white/[0.1]'
                  }`}
                >
                  {cand.display}
                </span>

                {isWinner && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    <Trophy className="w-3 h-3 text-emerald-400" /> Winner
                  </span>
                )}
              </div>

              {/* Logit Score and Probability */}
              <div className="flex items-center gap-4">
                {showLogit && (
                  <span className="text-[11px] text-[#A0A0A0] hidden sm:inline">
                    logit: <span className="text-white font-medium">{cand.logit.toFixed(2)}</span>
                  </span>
                )}

                <span
                  className={`text-[13px] font-bold min-w-[54px] text-right ${
                    isWinner ? 'text-emerald-400' : 'text-white/90'
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Dynamic Probability Bar */}
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(1, cand.probability * 100)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isWinner
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : idx === 0
                    ? 'bg-emerald-500'
                    : 'bg-emerald-500/50'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
