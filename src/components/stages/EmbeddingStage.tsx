import React, { useState } from 'react';
import { Plus, Equal, Compass } from 'lucide-react';
import { EmbeddingVector, TokenItem } from '../../types';
import { VectorBar } from '../visualizations/VectorBar';

interface EmbeddingStageProps {
  tokens: TokenItem[];
  embeddings: EmbeddingVector[];
}

export const EmbeddingStage: React.FC<EmbeddingStageProps> = ({ tokens, embeddings }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(1); // default "cat"

  const currentEmbedding = embeddings[selectedIdx];
  const currentToken = tokens[selectedIdx];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Token Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/[0.08] bg-black/40">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#888] pr-2">
          Select Token to Inspect Vector:
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
              {t.display} <span className="text-[10px] opacity-75 font-normal">(pos {idx})</span>
            </button>
          );
        })}
      </div>

      {/* Vector Math: Token Embedding + Positional Encoding = Combined Representation */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Vector Geometry Formulation: x_i = W_E[token] + PE[pos]
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">
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
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-white" />
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
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Equal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* 3. Combined Vector */}
        <VectorBar
          label="3. Combined Input Vector (x_i)"
          sublabel="Fed directly into Transformer Layer 1"
          vector={currentEmbedding.combinedVector}
          colorTheme="amber"
        />
      </div>

      {/* Why Positional Encoding Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#111111]/80 flex flex-col gap-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Why Do We Need Positional Encodings?
          </span>
          <p className="text-[12px] leading-relaxed text-[#B0B0B0]">
            Unlike Recurrent Neural Networks (RNNs) that process text one word at a time in order, Transformers process every token in parallel. Without adding positional vectors, the model would treat <code className="text-white">"cat sat on dog"</code> and <code className="text-white">"dog sat on cat"</code> as completely identical!
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#111111]/80 flex flex-col gap-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            High-Dimensional Space (768-D)
          </span>
          <p className="text-[12px] leading-relaxed text-[#B0B0B0]">
            Every single token is defined by 768 continuous floating-point numbers. In this space, concepts like "feline", "action", "tense", and "location" are encoded as geometric axes. Similar words naturally clump together in space.
          </p>
        </div>
      </div>
    </div>
  );
};
