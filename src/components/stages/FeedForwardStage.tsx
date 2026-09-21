import React from 'react';
import { Cpu, GitFork, Zap } from 'lucide-react';
import { FFNLayerNode } from '../../types';
import { NeuronGraph } from '../visualizations/NeuronGraph';

interface FeedForwardStageProps {
  nodes: FFNLayerNode[];
  connections: { from: string; to: string; weight: number }[];
}

export const FeedForwardStage: React.FC<FeedForwardStageProps> = ({ nodes, connections }) => {
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

      {/* Neuron Network Visualization */}
      <div className="rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-2xl flex flex-col items-center">
        <NeuronGraph nodes={nodes} connections={connections} />
      </div>
    </div>
  );
};
