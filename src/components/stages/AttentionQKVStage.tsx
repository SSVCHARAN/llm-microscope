import React, { useState } from 'react';
import { Search, Key, Database, ArrowRight, X as MultiplyIcon, Equal, CheckCircle2 } from 'lucide-react';
import { QKVData, TokenItem, EmbeddingVector, QKVProjectionWeights } from '../../types';
import { VectorBar } from '../visualizations/VectorBar';
import { MatrixGrid } from '../visualizations/MatrixGrid';

interface AttentionQKVStageProps {
  tokens: TokenItem[];
  qkv: QKVData[];
  embeddings: EmbeddingVector[];
  qkvWeights: QKVProjectionWeights;
}

type ProjectionType = 'q' | 'k' | 'v';

export const AttentionQKVStage: React.FC<AttentionQKVStageProps> = ({
  tokens,
  qkv,
  embeddings,
  qkvWeights
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(2); // "sat"
  const [selectedProjection, setSelectedProjection] = useState<ProjectionType>('q');

  const currentToken = tokens[selectedIdx];
  const currentEmbedding = embeddings[selectedIdx];
  const currentQKV = qkv[selectedIdx];

  // Input vector (first 4 dims matching head dimension d_k = 4)
  const inputVector = currentEmbedding ? currentEmbedding.combinedVector.slice(0, 4) : [0.72, 0.21, 1.35, -0.74];

  // Get active matrix and result vector based on projection type
  const isQ = selectedProjection === 'q';
  const isK = selectedProjection === 'k';
  const isV = selectedProjection === 'v';

  const activeMatrix = isQ ? qkvWeights.wQ : isK ? qkvWeights.wK : qkvWeights.wV;
  const activeResultVector = isQ ? currentQKV.q : isK ? currentQKV.k : currentQKV.v;
  const activeMatrixName = isQ ? 'W_Q' : isK ? 'W_K' : 'W_V';
  const activeOutputName = isQ ? 'Query Vector (Q_i)' : isK ? 'Key Vector (K_i)' : 'Value Vector (V_i)';
  const activeTheme = isQ ? 'purple' : isK ? 'emerald' : 'cyan';

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search Engine Analogy Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedProjection('q')}
          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
            isQ
              ? 'border-indigo-500/60 bg-indigo-500/[0.12] ring-1 ring-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
              : 'border-indigo-500/30 bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-400 font-mono text-[12px] font-bold">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>1. QUERY (Q = x · W_Q)</span>
            </div>
            {isQ && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
          </div>
          <span className="text-[13px] font-semibold text-white">"What am I looking for?"</span>
          <p className="text-[11px] leading-relaxed text-[#B0B0B0]">
            The question this token asks the rest of the sentence. (e.g., The verb <em>"sat"</em> queries: <em>"Who performed the action of sitting?"</em>)
          </p>
        </div>

        <div
          onClick={() => setSelectedProjection('k')}
          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
            isK
              ? 'border-emerald-500/60 bg-emerald-500/[0.12] ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'border-emerald-500/30 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 font-mono text-[12px] font-bold">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>2. KEY (K = x · W_K)</span>
            </div>
            {isK && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[13px] font-semibold text-white">"What information do I hold?"</span>
          <p className="text-[11px] leading-relaxed text-[#B0B0B0]">
            The index label or tag. (e.g., The noun <em>"cat"</em> offers: <em>"I am a feline creature that can sit!"</em> Matches between Q and K create attention).
          </p>
        </div>

        <div
          onClick={() => setSelectedProjection('v')}
          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
            isV
              ? 'border-cyan-500/60 bg-cyan-500/[0.12] ring-1 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'border-cyan-500/30 bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-400 font-mono text-[12px] font-bold">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>3. VALUE (V = x · W_V)</span>
            </div>
            {isV && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
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
          Select Token to Inspect Projections:
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

      {/* Primary Mathematical Operations Section (like Stage 2) */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-2xl">
        {/* Header & Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-mono uppercase tracking-wider text-white font-bold">
              PROJECTIONS FOR TOKEN: "{currentToken.display}"
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Matrix Linear Transformation: [Output Vector (1×4)] = [Input Vector (1×4)] × [Weight Matrix (4×4)]
            </span>
          </div>

          {/* Projection Type Switcher Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-black/60 border border-white/10 gap-1 self-start sm:self-auto">
            <button
              onClick={() => setSelectedProjection('q')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                isQ
                  ? 'bg-indigo-500 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Query (x · W_Q)
            </button>
            <button
              onClick={() => setSelectedProjection('k')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                isK
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Key (x · W_K)
            </button>
            <button
              onClick={() => setSelectedProjection('v')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                isV
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Value (x · W_V)
            </button>
          </div>
        </div>

        {/* 1. Input Representation Vector x_i */}
        <VectorBar
          label={`1. Input Vector (x_i)`}
          sublabel={`Combined token embedding from Stage 2 for "${currentToken.display}"`}
          vector={inputVector}
          colorTheme="amber"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Multiply Symbol Badge */}
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <MultiplyIcon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* 2. Projection Weight Matrix W */}
        <MatrixGrid
          matrix={activeMatrix}
          title={`2. Learned Projection Weight Matrix (${activeMatrixName})`}
          subtitle={`Fixed 4×4 projection parameters learned during training to map token features into ${isQ ? 'Query' : isK ? 'Key' : 'Value'} space`}
          rowLabels={['x₁', 'x₂', 'x₃', 'x₄']}
          colLabels={
            isQ
              ? ['q₁', 'q₂', 'q₃', 'q₄']
              : isK
              ? ['k₁', 'k₂', 'k₃', 'k₄']
              : ['v₁', 'v₂', 'v₃', 'v₄']
          }
          valueFormatter={(v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
        />

        {/* Equals Symbol Badge */}
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Equal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* 3. Output Projected Vector */}
        <VectorBar
          label={`3. Output ${activeOutputName}`}
          sublabel={
            isQ
              ? 'Broadcasts into the attention pool to score against all Keys'
              : isK
              ? 'Acts as the matching key index for incoming Queries'
              : 'The semantic content transmitted when attention weights fire'
          }
          vector={activeResultVector}
          colorTheme={activeTheme}
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Summary of all 3 vectors side-by-side */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A0A0A0]">
            Resulting Q, K, V Projections for "{currentToken.display}":
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Q Box */}
            <div
              onClick={() => setSelectedProjection('q')}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                isQ
                  ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/40'
                  : 'bg-black/40 border-white/[0.06] hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-indigo-300">
                Q Vector = x · W_Q
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {currentQKV.q.map((v, i) => (
                  <div key={i} className="px-2 py-1 rounded bg-black/60 border border-indigo-500/30 text-indigo-200 font-mono text-[10px] font-semibold">
                    {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* K Box */}
            <div
              onClick={() => setSelectedProjection('k')}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                isK
                  ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/40'
                  : 'bg-black/40 border-white/[0.06] hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-emerald-300">
                K Vector = x · W_K
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {currentQKV.k.map((v, i) => (
                  <div key={i} className="px-2 py-1 rounded bg-black/60 border border-emerald-500/30 text-emerald-200 font-mono text-[10px] font-semibold">
                    {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* V Box */}
            <div
              onClick={() => setSelectedProjection('v')}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                isV
                  ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/40'
                  : 'bg-black/40 border-white/[0.06] hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-cyan-300">
                V Vector = x · W_V
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {currentQKV.v.map((v, i) => (
                  <div key={i} className="px-2 py-1 rounded bg-black/60 border border-cyan-500/30 text-cyan-200 font-mono text-[10px] font-semibold">
                    {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Multiplication Formula Card */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-black/60 border border-white/[0.06] text-[12px] font-mono text-[#A0A0A0] overflow-x-auto mt-2">
          <span className="text-white font-semibold">Next Step:</span>
          <span>Score(i, j) = (Q_i · K_j) / √d_k</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400">Yields the 5×5 Attention Matrix shown in Stage 4!</span>
        </div>
      </div>
    </div>
  );
};
