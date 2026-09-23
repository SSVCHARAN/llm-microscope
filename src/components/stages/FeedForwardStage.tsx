import React from 'react';
import { Cpu, GitFork, Zap, Plus, Equal, ArrowDown, Network, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
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
    <div className="flex flex-col gap-8 w-full">
      {/* 1. Jargon Buster: Clear definitions for MLP, GELU, Proj, D */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-[12px] font-mono uppercase tracking-wider text-text font-bold">
            Jargon Buster: Key Concepts Decoded
          </span>
          <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
            (Read this first to understand the terms used below)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Concept 1: d (Dimension) */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[11px] font-mono font-bold text-amber-400">
              d (Vector Dimension)
            </span>
            <p className="text-[11px] leading-relaxed text-text-muted">
              The number of coordinate numbers defining a token. In real GPT-2, <code className="text-text bg-white/[0.06] px-1 py-0.5 rounded">d = 768</code>. For visual clarity in this microscope, we track <code className="text-text bg-white/[0.06] px-1 py-0.5 rounded">d = 4</code> coordinates.
            </p>
          </div>

          {/* Concept 2: MLP (Multi-Layer Perceptron) */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              MLP (Feed-Forward Net)
            </span>
            <p className="text-[11px] leading-relaxed text-text-muted">
              A standard neural network with layers of connected neurons. While Attention <em>routes context between tokens</em>, the MLP <em>processes and reasons upon that context</em>.
            </p>
          </div>

          {/* Concept 3: Proj (Projection) */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[11px] font-mono font-bold text-cyan-400">
              Proj (Projection)
            </span>
            <p className="text-[11px] leading-relaxed text-text-muted">
              Multiplying a vector by a matrix to change its shape. Here, the vector expands 4× from 4 to 8 dimensions, then projects back down to 4 dimensions.
            </p>
          </div>

          {/* Concept 4: GELU Gate */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[11px] font-mono font-bold text-rose-400">
              GELU (Activation Gate)
            </span>
            <p className="text-[11px] leading-relaxed text-text-muted">
              A non-linear switch function. Acts like a bouncer: positive signals pass through; negative noise is silenced to <code className="text-text bg-white/[0.06] px-1 py-0.5 rounded">0.00</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Context Bridge */}
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-surface p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-mono uppercase tracking-wider text-text font-bold">
              Where does the input to Stage 5 come from?
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Formula: x_in = (Token Embedding) + (Stage 4 Attention Context)
          </span>
        </div>

        <p className="text-[12px] leading-relaxed text-text-secondary">
          The Feed-Forward Network runs on <strong>each token individually</strong>. Because our goal is to predict the word that follows <code className="text-text bg-white/[0.06] px-1 py-0.5 rounded">"The cat sat on the"</code>, we are processing the <strong>terminal token "{attentionOutput.tokenText}"</strong>. In Stage 4, this token gathered context from previous words ("cat" and "sat"). Now, we add that context vector to the token's original embedding:
        </p>

        {/* 1. Original Token Vector */}
        <VectorBar
          label={`1. Original Token Vector ("${attentionOutput.tokenText}")`}
          sublabel="Embedding coordinates before attention was applied"
          vector={attentionOutput.originalVector}
          colorTheme="amber"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Plus Symbol */}
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-surface-border flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-text" />
          </div>
        </div>

        {/* 2. Attention Context Vector (z from Stage 4) */}
        <VectorBar
          label="2. Attention Context Vector (z from Stage 4)"
          sublabel="Weighted context gathered from 'cat' (54%) and 'sat' (24%) in the Stage 4 heatmap"
          vector={attentionOutput.attentionContextVector}
          colorTheme="cyan"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Equals Symbol */}
        <div className="flex justify-center -my-1 text-text-muted">
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-surface-border flex items-center justify-center">
            <Equal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* 3. Combined Vector entering FFN */}
        <VectorBar
          label='3. Enriched Token Vector for " the"'
          sublabel="Carries both the word identity and the full sentence context"
          vector={attentionOutput.combinedInputVector}
          colorTheme="emerald"
          maxVisibleDims={4}
          dimensionLabel="[4-D]"
        />

        {/* Introducing x1..x4 clearly so nobody gets confused */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-[12px] text-emerald-200">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono font-bold text-text uppercase text-[11px] tracking-wide">
              Introducing the Input Nodes (x₁, x₂, x₃, x₄):
            </span>
            <p className="leading-relaxed">
              To pass these 4 coordinates into the neural network graph below, we label each dimension with a variable name:
              <br />
              <code className="text-amber-300 font-bold">x₁ = +0.72</code>, &nbsp;
              <code className="text-amber-300 font-bold">x₂ = -0.45</code>, &nbsp;
              <code className="text-amber-300 font-bold">x₃ = +1.14</code>, &nbsp;
              <code className="text-amber-300 font-bold">x₄ = -0.88</code>.
              <br />
              <strong>That is all $x_1 \dots x_4$ are:</strong> the 4 coordinate numbers of this token entering the network!
            </p>
          </div>
        </div>
      </div>

      {/* 3. Operation Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-surface-border bg-surface flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
            What do the connection lines (synapses) do?
          </span>
          <p className="text-[12px] text-text-muted leading-relaxed">
            Every line connecting an input node to a hidden node represents a <strong>learned multiplier weight (w)</strong>. When a signal travels along a line, it is multiplied by that line's weight. Green lines have positive weights (amplify); red/dim lines have negative weights (suppress).
          </p>
        </div>

        <div className="p-4 rounded-xl border border-surface-border bg-surface flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            What operation is performed on each hidden neuron?
          </span>
          <p className="text-[12px] text-text-muted leading-relaxed">
            Each hidden neuron computes a <strong>Weighted Sum</strong>:
            <br />
            <code className="text-text font-mono text-[11px]">Pre-Activation = (x₁·w₁) + (x₂·w₂) + (x₃·w₃) + (x₄·w₄) + bias</code>
            <br />
            Then applies <strong>GELU</strong>: If the sum is positive, the neuron fires! If negative, it is silenced to <code className="text-text font-mono">0.00</code>.
          </p>
        </div>
      </div>

      {/* 4. The Interactive Neuron Network Visualization */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[12px] font-mono uppercase tracking-wider text-text font-bold">
            Interactive Neural Graph (Click any neuron to see its exact incoming math!)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Token: "{attentionOutput.tokenText}"
          </span>
        </div>

        <NeuronGraph nodes={nodes} connections={connections} />
      </div>
    </div>
  );
};
