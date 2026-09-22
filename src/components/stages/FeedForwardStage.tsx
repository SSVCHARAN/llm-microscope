import React from 'react';
import { Cpu, GitFork, Zap, Plus, Equal, ArrowDown, Network } from 'lucide-react';
import { FFNLayerNode, AttentionOutputData } from '../../types';
import { NeuronGraph } from '../visualizations/NeuronGraph';
import { VectorBar } from '../visualizations/VectorBar';

interface FeedForwardStageProps {
  nodes: FFNLayerNode[];
  connections: { from: string; to: string; weight: number }[];
  attentionOutput: AttentionOutputData;
}

export const FeedForwardStage: React.FC<FeedForwardStageProps> = ({
  nodes,
  connections,
  attentionOutput
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 3-Step Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-white font-mono text-[12px] font-semibold">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
            <span>4× Dimensional Expansion</span>
          </div>
          <p className="text-[12px] text-[#A0A0A0] leading-relaxed">
            The input vector (768 dimensions) is projected outward to <strong>3072 dimensions</strong>. This gives the model enormous representational capacity to store factual knowledge.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[12px] font-semibold">
            <Zap className="w-4 h-4" />
            <span>Non-Linear Activation (GELU)</span>
          </div>
          <p className="text-[12px] text-emerald-200/90 leading-relaxed">
            Without non-linear activations, stacking 100 neural layers would collapse into a single giant linear equation! GELU silences negative values and lets features fire conditionally.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-white font-mono text-[12px] font-semibold">
            <GitFork className="w-4 h-4" />
            <span>Residual Skip Connection</span>
          </div>
          <p className="text-[12px] text-[#A0A0A0] leading-relaxed">
            Formula: <code className="text-white">x_out = x_in + FFN(x_in)</code>. The original vector bypasses the MLP through a highway, ensuring original context is never erased.
          </p>
        </div>
      </div>

      {/* The Context Bridge: How Stage 4 Feeds Directly Into Stage 5 */}
      <div className="flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-black/60 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-mono uppercase tracking-wider text-white font-bold">
              Context Bridge: Where do nodes x₁ ... x₄ come from?
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Formulation: x_FFN = x_orig + z_attn
          </span>
        </div>

        <p className="text-[12px] leading-relaxed text-[#C0C0C0]">
          In a Transformer, the Feed-Forward Network runs on <strong>each token individually</strong>. For generating the next token, we focus on the last position (token <code className="text-white">"{attentionOutput.tokenText}"</code>). Its input vector to the FFN is created by taking its original embedding and adding the <strong>Attention Context Vector (z)</strong> gathered in Stage 4:
        </p>

        {/* 1. Original Token Vector */}
        <VectorBar
          label={`1. Original Token Vector ("${attentionOutput.tokenText}")`}
          sublabel="Embedding vector before attention was applied"
          vector={attentionOutput.originalVector}
          colorTheme="amber"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Plus Symbol */}
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* 2. Attention Context Vector (z from Stage 4) */}
        <VectorBar
          label="2. Attention Context Vector (z from Stage 4)"
          sublabel="Weighted information retrieved from 'cat' (54%) and 'sat' (24%)"
          vector={attentionOutput.attentionContextVector}
          colorTheme="cyan"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Equals Symbol */}
        <div className="flex justify-center -my-1 text-[#888]">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Equal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* 3. Combined Vector entering FFN */}
        <VectorBar
          label="3. FFN Input Vector (x₁ ... x₄)"
          sublabel="Enriched vector carrying both token identity and full sentence context"
          vector={attentionOutput.combinedInputVector}
          colorTheme="emerald"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Direct Link pointer */}
        <div className="flex items-center gap-2 justify-center py-2 px-3 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-[12px] font-mono text-emerald-300">
          <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>
            These 4 values <strong>[+0.72, -0.45, +1.14, -0.88]</strong> map 1-to-1 to the 4 input nodes <strong>(x₁, x₂, x₃, x₄)</strong> in the graph below!
          </span>
        </div>
      </div>

      {/* Neuron Network Visualization */}
      <div className="rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-2xl flex flex-col items-center">
        <NeuronGraph nodes={nodes} connections={connections} />
      </div>
    </div>
  );
};
