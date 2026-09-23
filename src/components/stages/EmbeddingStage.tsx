import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Equal, Compass } from 'lucide-react';
import { EmbeddingVector, TokenItem } from '../../types';
import { VectorBar } from '../visualizations/VectorBar';

interface EmbeddingStageProps {
  tokens: TokenItem[];
  embeddings: EmbeddingVector[];
  phase?: number;
}

export const EmbeddingStage: React.FC<EmbeddingStageProps> = ({ tokens, embeddings, phase }) => {
  const showAll = phase === undefined;
  const showPhase1 = showAll || (phase !== undefined && phase >= 1);
  const [selectedIdx, setSelectedIdx] = useState<number>(1); // default "cat"

  // Educational Autoplay: show token 1 ("cat") then token 2 ("sat") to show PE changing
  useEffect(() => {
    if (phase === undefined) return;
    if (phase === 0) {
      setSelectedIdx(1);
      const timer = setTimeout(() => setSelectedIdx(2), 1400);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const currentEmbedding = embeddings[selectedIdx];
  const currentToken = tokens[selectedIdx];

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Token Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-surface shadow-sm" role="tablist" aria-label="Tokens for vector inspection">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted pr-2">
          Select Token to Inspect Vector:
        </span>
        {tokens.map((t, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Inspect embedding for token ${t.display} at position ${idx}`}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[12px] font-medium transition-all focus-ring ${
                isSelected
                  ? 'bg-primary text-white dark:text-black font-bold shadow-[0_0_16px_rgba(5,150,105,0.3)] dark:shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                  : 'bg-surface-raised text-text-muted hover:text-text-main hover:bg-surface-subtle'
              }`}
            >
              {t.display} <span className="text-[10px] opacity-75 font-normal">(pos {idx})</span>
            </button>
          );
        })}
      </div>

      {/* Vector Math: Token Embedding + Positional Encoding = Combined Representation */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm dark:shadow-2xl transition-colors duration-200">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-semibold">
              Vector Geometry Formulation: x_i = W_E[token] + PE[pos]
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            Showing first 8 of 768 dimensions
          </span>
        </div>

        {/* 1. Token Vector */}
        <VectorBar
          label={`1. Token Embedding (${currentToken.display})`}
          sublabel="Semantic coordinates from Embedding Table W_E"
          vector={currentEmbedding.tokenVector}
          colorTheme="emerald"
        />

        {/* Plus Symbol */}
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center shadow-sm">
            <Plus className="w-3.5 h-3.5 text-text-main" />
          </div>
        </div>

        {/* 2. Positional Vector */}
        <VectorBar
          label={`2. Positional Encoding (Pos ${currentEmbedding.position})`}
          sublabel="Sinusoidal frequency wave representing sequence index"
          vector={currentEmbedding.posVector}
          colorTheme="cyan"
        />

        {/* Equals Symbol */}
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center shadow-sm">
            <Equal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* 3. Combined Vector */}
        <VectorBar
          label="3. Combined Input Vector (x_i)"
          sublabel="Fed directly into Transformer Layer 1"
          vector={currentEmbedding.combinedVector}
          colorTheme="amber"
        />

        {/* Live Coordinate Addition Breakdown */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-raised border border-border mt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
            Live Coordinate Sum: W_E[d] + PE[d] = x_i[d]
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[0, 1, 2, 3].map((dimIdx) => {
              const we = currentEmbedding.tokenVector[dimIdx] ?? 0;
              const pe = currentEmbedding.posVector[dimIdx] ?? 0;
              const xi = currentEmbedding.combinedVector[dimIdx] ?? (we + pe);
              return (
                <motion.div
                  key={dimIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: dimIdx * 0.08 }}
                  className="flex flex-col gap-1 p-2 rounded-lg bg-surface border border-border-subtle font-mono text-[11px] shadow-sm"
                >
                  <span className="text-[9px] text-text-muted uppercase">Dim d_{dimIdx}</span>
                  <div className="flex items-center gap-1 font-semibold">
                    <span className="text-emerald-700 dark:text-emerald-400">{we >= 0 ? `+${we.toFixed(2)}` : we.toFixed(2)}</span>
                    <span className="text-text-muted">+</span>
                    <span className="text-cyan-700 dark:text-cyan-400">{pe >= 0 ? `+${pe.toFixed(2)}` : pe.toFixed(2)}</span>
                  </div>
                  <div className="text-amber-800 dark:text-amber-400 font-bold border-t border-border pt-1 mt-0.5">
                    = {xi >= 0 ? `+${xi.toFixed(2)}` : xi.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Positional Encoding Callout */}
      {showPhase1 && (
        <motion.div
          data-autoplay-focal={phase === 1 ? 'true' : undefined}
          initial={!showAll ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
              Why Do We Need Positional Encodings?
            </span>
            <p className="text-[12px] leading-relaxed text-text-secondary">
              Unlike Recurrent Neural Networks (RNNs) that process text one word at a time in order, Transformers process every token in parallel. Without adding positional vectors, the model would treat <code className="text-text-main bg-surface-raised px-1 py-0.5 rounded border border-border-subtle">"cat sat on dog"</code> and <code className="text-text-main bg-surface-raised px-1 py-0.5 rounded border border-border-subtle">"dog sat on cat"</code> as completely identical!
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold">
              High-Dimensional Space (768-D)
            </span>
            <p className="text-[12px] leading-relaxed text-text-secondary">
              Every single token is defined by 768 continuous floating-point numbers. In this space, concepts like "feline", "action", "tense", and "location" are encoded as geometric axes. Similar words naturally clump together in space.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
