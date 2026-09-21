import React, { useState } from 'react';
import { Search, Key, Database, ArrowRight } from 'lucide-react';
import { QKVData, TokenItem } from '../../types';

interface AttentionQKVStageProps {
  tokens: TokenItem[];
  qkv: QKVData[];
}

export const AttentionQKVStage: React.FC<AttentionQKVStageProps> = ({ tokens, qkv }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(2); // "sat"

  const currentQKV = qkv[selectedIdx];
  const currentToken = tokens[selectedIdx];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search Engine Analogy Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.05]">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-[12px] font-bold">
            <Search className="w-4 h-4" />
            <span>1. QUERY (Q)</span>
          </div>
          <span className="text-[13px] font-semibold text-white">"What am I looking for?"</span>
          <p className="text-[11px] leading-relaxed text-[#B0B0B0]">
            The question this token asks the rest of the sentence. (e.g., The verb <em>"sat"</em> queries: <em>"Who performed the action of sitting?"</em>)
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05]">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[12px] font-bold">
            <Key className="w-4 h-4" />
            <span>2. KEY (K)</span>
          </div>
          <span className="text-[13px] font-semibold text-white">"What information do I hold?"</span>
          <p className="text-[11px] leading-relaxed text-[#B0B0B0]">
            The index label or tag. (e.g., The noun <em>"cat"</em> offers: <em>"I am a feline creature that can sit!"</em> Matches between Q and K create attention).
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.05]">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[12px] font-bold">
            <Database className="w-4 h-4" />
            <span>3. VALUE (V)</span>
          </div>
          <span className="text-[13px] font-semibold text-white">"What content do I transmit?"</span>
          <p className="text-[11px] leading-relaxed text-[#B0B0B0]">
            The actual semantic payload. When a high match occurs between Q and K, the model copies a large portion of V into the next layer!
          </p>
        </div>
      </div>

      {/* Token Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/[0.08] bg-black/40">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#888] pr-2">
          Select Token to Inspect Q, K, V:
        </span>
        {tokens.map((t, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[12px] font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                  : 'bg-white/[0.04] text-[#A0A0A0] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {t.display}
            </button>
          );
        })}
      </div>

      {/* QKV Vector Inspection Display */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Projections for Token: "{currentToken.display}"
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#888]">
            Head Dim = 4
          </span>
        </div>

        {/* 3 Vectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Query */}
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-indigo-500/[0.06] border border-indigo-500/20">
            <span className="text-[11px] font-mono font-bold text-indigo-300">
              Query Vector Q = x · W_Q
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {currentQKV.q.map((v, i) => (
                <div key={i} className="px-2.5 py-1.5 rounded bg-black/50 border border-indigo-500/30 text-indigo-200 font-mono text-[11px] font-semibold">
                  {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          {/* Key */}
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
            <span className="text-[11px] font-mono font-bold text-emerald-300">
              Key Vector K = x · W_K
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {currentQKV.k.map((v, i) => (
                <div key={i} className="px-2.5 py-1.5 rounded bg-black/50 border border-emerald-500/30 text-emerald-200 font-mono text-[11px] font-semibold">
                  {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          {/* Value */}
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/20">
            <span className="text-[11px] font-mono font-bold text-cyan-300">
              Value Vector V = x · W_V
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {currentQKV.v.map((v, i) => (
                <div key={i} className="px-2.5 py-1.5 rounded bg-black/50 border border-cyan-500/30 text-cyan-200 font-mono text-[11px] font-semibold">
                  {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Multiplication Formula Card */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-black/60 border border-white/[0.06] text-[12px] font-mono text-[#A0A0A0] overflow-x-auto">
          <span className="text-white font-semibold">Next Step:</span>
          <span>Score(i, j) = (Q_i · K_j) / √d_k</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400">Yields the 5×5 Attention Matrix shown in Stage 4!</span>
        </div>
      </div>
    </div>
  );
};
