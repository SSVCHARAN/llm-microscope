import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Key, Database, ArrowRight, X as MultiplyIcon, Equal, CheckCircle2 } from 'lucide-react';
import { QKVData, TokenItem, EmbeddingVector, QKVProjectionWeights } from '../../types';
import { VectorBar } from '../visualizations/VectorBar';
import { MatrixGrid } from '../visualizations/MatrixGrid';

interface AttentionQKVStageProps {
  tokens: TokenItem[];
  qkv: QKVData[];
  embeddings: EmbeddingVector[];
  qkvWeights: QKVProjectionWeights;
  phase?: number;
}

type ProjectionType = 'q' | 'k' | 'v';

export const AttentionQKVStage: React.FC<AttentionQKVStageProps> = ({
  tokens,
  qkv,
  embeddings,
  qkvWeights,
  phase
}) => {
  const showAll = phase === undefined;
  const showPhase1 = showAll || (phase !== undefined && phase >= 1);
  const [selectedIdx, setSelectedIdx] = useState<number>(2); // "sat"
  const [selectedProjection, setSelectedProjection] = useState<ProjectionType>('q');

  // Educational Autoplay: dynamically cycle through Query -> Key -> Value projections
  useEffect(() => {
    if (phase === undefined) return;
    if (phase === 0) {
      setSelectedProjection('q');
      const timer = setTimeout(() => setSelectedProjection('k'), 1400);
      return () => clearTimeout(timer);
    } else if (phase === 1) {
      setSelectedProjection('v');
    }
  }, [phase]);

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
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Search Engine Analogy Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Attention Projection Types">
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isQ}
          aria-label="Select Query projection"
          onClick={() => setSelectedProjection('q')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedProjection('q');
            }
          }}
          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer focus-ring shadow-sm ${
            isQ
              ? 'border-indigo-500/60 bg-indigo-500/[0.1] ring-1 ring-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
              : 'border-border bg-surface hover:bg-surface-raised'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 font-mono text-[12px] font-bold">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>1. QUERY (Q = x · W_Q)</span>
            </div>
            {isQ && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </div>
          <span className="text-[13px] font-semibold text-text-main">"What am I looking for?"</span>
          <p className="text-[11px] leading-relaxed text-text-muted">
            The question this token asks the rest of the sentence. (e.g., The verb <em>"sat"</em> queries: <em>"Who performed the action of sitting?"</em>)
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={isK}
          aria-label="Select Key projection"
          onClick={() => setSelectedProjection('k')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedProjection('k');
            }
          }}
          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer focus-ring shadow-sm ${
            isK
              ? 'border-emerald-500/60 bg-emerald-500/[0.1] ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(5,150,105,0.2)]'
              : 'border-border bg-surface hover:bg-surface-raised'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-mono text-[12px] font-bold">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>2. KEY (K = x · W_K)</span>
            </div>
            {isK && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </div>
          <span className="text-[13px] font-semibold text-text-main">"What information do I hold?"</span>
          <p className="text-[11px] leading-relaxed text-text-muted">
            The index label or tag. (e.g., The noun <em>"cat"</em> offers: <em>"I am a feline creature that can sit!"</em> Matches between Q and K create attention).
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={isV}
          aria-label="Select Value projection"
          onClick={() => setSelectedProjection('v')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedProjection('v');
            }
          }}
          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer focus-ring shadow-sm ${
            isV
              ? 'border-cyan-500/60 bg-cyan-500/[0.1] ring-1 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'border-border bg-surface hover:bg-surface-raised'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 font-mono text-[12px] font-bold">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>3. VALUE (V = x · W_V)</span>
            </div>
            {isV && <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
          </div>
          <span className="text-[13px] font-semibold text-text-main">"What content do I transmit?"</span>
          <p className="text-[11px] leading-relaxed text-text-muted">
            The actual semantic payload. When a high match occurs between Q and K, the model copies a large portion of V into the next layer!
          </p>
        </div>
      </div>

      {/* Token Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-surface shadow-sm" role="tablist" aria-label="Tokens for projection inspection">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted pr-2">
          Select Token to Inspect Projections:
        </span>
        {tokens.map((t, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Inspect projections for token ${t.display}`}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[12px] font-medium transition-all focus-ring ${
                isSelected
                  ? 'bg-primary text-white dark:text-black font-bold shadow-[0_0_16px_rgba(5,150,105,0.3)] dark:shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                  : 'bg-surface-raised text-text-muted hover:text-text-main hover:bg-surface-subtle'
              }`}
            >
              {t.display}
            </button>
          );
        })}
      </div>

      {/* Primary Mathematical Operations Section */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm dark:shadow-2xl transition-colors duration-200">
        {/* Header & Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-mono uppercase tracking-wider text-text-main font-bold">
              PROJECTIONS FOR TOKEN: "{currentToken.display}"
            </span>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              Matrix Linear Transformation: [Output Vector (1×4)] = [Input Vector (1×4)] × [Weight Matrix (4×4)]
            </span>
          </div>

          {/* Projection Type Switcher Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-surface-raised border border-border gap-1 self-start sm:self-auto shadow-sm" role="tablist" aria-label="Projection Type Tabs">
            <button
              role="tab"
              aria-selected={isQ}
              aria-label="Query projection tab"
              onClick={() => setSelectedProjection('q')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all focus-ring ${
                isQ
                  ? 'bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Query (x · W_Q)
            </button>
            <button
              role="tab"
              aria-selected={isK}
              aria-label="Key projection tab"
              onClick={() => setSelectedProjection('k')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all focus-ring ${
                isK
                  ? 'bg-primary text-white dark:text-black font-bold shadow-[0_0_12px_rgba(5,150,105,0.4)] dark:shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Key (x · W_K)
            </button>
            <button
              role="tab"
              aria-selected={isV}
              aria-label="Value projection tab"
              onClick={() => setSelectedProjection('v')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all focus-ring ${
                isV
                  ? 'bg-cyan-600 text-white dark:text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-text-muted hover:text-text-main'
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
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center shadow-sm">
            <MultiplyIcon className="w-3.5 h-3.5 text-text-main" />
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
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center shadow-sm">
            <Equal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Resulting Q, K, V Projections for "{currentToken.display}":
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="region" aria-label="Projection Summary">
            {/* Q Box */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isQ}
              aria-label="Inspect Query vector"
              onClick={() => setSelectedProjection('q')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProjection('q');
                }
              }}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer focus-ring shadow-sm ${
                isQ
                  ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/40'
                  : 'bg-surface border-border hover:bg-surface-raised'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                Q Vector = x · W_Q
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {currentQKV.q.map((v, i) => (
                  <div key={i} className="px-2 py-1 rounded bg-surface-raised border border-indigo-500/30 text-indigo-800 dark:text-indigo-200 font-mono text-[10px] font-semibold shadow-sm">
                    {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* K Box */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isK}
              aria-label="Inspect Key vector"
              onClick={() => setSelectedProjection('k')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProjection('k');
                }
              }}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer focus-ring shadow-sm ${
                isK
                  ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/40'
                  : 'bg-surface border-border hover:bg-surface-raised'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                K Vector = x · W_K
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {currentQKV.k.map((v, i) => (
                  <div key={i} className="px-2 py-1 rounded bg-surface-raised border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-mono text-[10px] font-semibold shadow-sm">
                    {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* V Box */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isV}
              aria-label="Inspect Value vector"
              onClick={() => setSelectedProjection('v')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProjection('v');
                }
              }}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer focus-ring shadow-sm ${
                isV
                  ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/40'
                  : 'bg-surface border-border hover:bg-surface-raised'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-cyan-800 dark:text-cyan-300">
                V Vector = x · W_V
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {currentQKV.v.map((v, i) => (
                  <div key={i} className="px-2 py-1 rounded bg-surface-raised border border-cyan-500/30 text-cyan-800 dark:text-cyan-200 font-mono text-[10px] font-semibold shadow-sm">
                    {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Multiplication Formula & Scoring Simulator Card */}
        {showPhase1 && (
          <motion.div
            data-autoplay-focal={phase === 1 ? 'true' : undefined}
            initial={!showAll ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-3 p-4 rounded-xl bg-surface-raised border border-emerald-500/30 text-[12px] font-mono mt-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                How Query & Key Produce Attention: Dot Product Matching
              </span>
              <span className="text-[11px] text-text-muted">
                Formula: Score(i, j) = (Q_i · K_j) / √d_k
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  High Semantic Match (Q_"sat" · K_"cat"):
                </span>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  The subject <em>"cat"</em> answers the verb's query <em>"Who sat?"</em>. Their Q and K vectors point in the same direction in 4-D space, producing a large positive dot product (<code className="text-emerald-800 dark:text-emerald-300 font-bold">+4.32 / √4 = +2.16</code>). After Softmax, this yields a dominant <strong>54% attention weight</strong>!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                <span className="text-[11px] font-bold text-text-muted">
                  Low Semantic Match (Q_"sat" · K_"the"):
                </span>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  The determiner <em>"the"</em> carries no agent semantics. The vectors are nearly orthogonal (<code className="text-text-main font-bold">-0.32 / √4 = -0.16</code>), resulting in negligible attention (~4%).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Next in Stage 4: All 5×5 Query-Key pairs are evaluated to assemble the complete Attention Heatmap!</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
