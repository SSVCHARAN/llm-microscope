import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FFNLayerNode } from '../../types';

interface NeuronGraphProps {
  nodes: FFNLayerNode[];
  connections: { from: string; to: string; weight: number }[];
}

export const NeuronGraph: React.FC<NeuronGraphProps> = ({ nodes, connections }) => {
  const [selectedNode, setSelectedNode] = useState<FFNLayerNode | null>(nodes[5]); // default h6

  const width = 580;
  const height = 300;

  // Layer column x-coordinates
  const layerX = [70, 290, 510];

  // Organize nodes by layer
  const layer0 = nodes.filter((n) => n.layer === 0);
  const layer1 = nodes.filter((n) => n.layer === 1);
  const layer2 = nodes.filter((n) => n.layer === 2);

  const getNodeCoordinates = (node: FFNLayerNode) => {
    const x = layerX[node.layer];
    let y = 0;
    if (node.layer === 0) {
      const step = (height - 60) / (layer0.length - 1);
      const idx = layer0.findIndex((n) => n.id === node.id);
      y = 30 + idx * step;
    } else if (node.layer === 1) {
      const step = (height - 40) / (layer1.length - 1);
      const idx = layer1.findIndex((n) => n.id === node.id);
      y = 20 + idx * step;
    } else {
      const step = (height - 60) / (layer2.length - 1);
      const idx = layer2.findIndex((n) => n.id === node.id);
      y = 30 + idx * step;
    }
    return { x, y };
  };

  const getNodeColor = (node: FFNLayerNode) => {
    if (node.layer === 1) {
      // Hidden layer: show ReLU effect
      if (node.postRelu === 0) {
        return 'fill-black stroke-white/20 text-[#666]';
      }
      return 'fill-emerald-500/20 stroke-emerald-400 text-emerald-300';
    }
    if (node.value > 0) {
      return 'fill-emerald-500/20 stroke-emerald-400 text-emerald-300';
    }
    return 'fill-purple-500/20 stroke-purple-400 text-purple-300';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center">
      {/* SVG Canvas */}
      <div className="relative rounded-xl border border-white/[0.08] bg-black/60 p-4 shadow-2xl flex flex-col items-center">
        {/* Layer Header labels */}
        <div className="w-full flex justify-between px-10 text-[10px] font-mono uppercase tracking-wider text-[#A0A0A0] pb-2 border-b border-white/[0.06]">
          <span>Input Proj (d)</span>
          <span className="text-emerald-400 font-semibold">Hidden MLP (4× d) + GELU</span>
          <span>Output Proj (d)</span>
        </div>

        <svg width={width} height={height} className="overflow-visible">
          {/* Synapses Connections */}
          {connections.map((conn) => {
            const source = nodes.find((n) => n.id === conn.from);
            const target = nodes.find((n) => n.id === conn.to);
            if (!source || !target) return null;

            const sPos = getNodeCoordinates(source);
            const tPos = getNodeCoordinates(target);
            const isPositive = conn.weight > 0;
            const isZeroed = target.layer === 1 && target.postRelu === 0;

            return (
              <g key={`${conn.from}-${conn.to}`}>
                <motion.line
                  x1={sPos.x}
                  y1={sPos.y}
                  x2={tPos.x}
                  y2={tPos.y}
                  stroke={
                    isZeroed
                      ? 'rgba(255,255,255,0.03)'
                      : isPositive
                      ? 'rgba(16,185,129,0.35)'
                      : 'rgba(168,85,247,0.25)'
                  }
                  strokeWidth={isZeroed ? 0.75 : Math.abs(conn.weight) * 2}
                  strokeDasharray={isZeroed ? '2 2' : undefined}
                />
              </g>
            );
          })}

          {/* Layer Nodes */}
          {nodes.map((node) => {
            const pos = getNodeCoordinates(node);
            const isSelected = selectedNode?.id === node.id;
            const isDeactivated = node.layer === 1 && node.postRelu === 0;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Node Ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={node.layer === 1 ? 12 : 14}
                  className={`transition-all ${getNodeColor(node)} ${
                    isSelected ? 'stroke-[3px] stroke-white shadow-[0_0_16px_rgba(255,255,255,0.6)]' : 'stroke-[1.5px]'
                  }`}
                />

                {/* Text Label inside node */}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold fill-white select-none pointer-events-none"
                >
                  {isDeactivated ? '0' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex items-center gap-5 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-[#A0A0A0]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Active Neuron (&gt; 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-black" />
            <span>GELU/ReLU Deactivated (0.00)</span>
          </div>
        </div>
      </div>

      {/* Interactive Inspector */}
      <div className="w-full lg:w-72 bg-[#111111] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Neuron Telemetry
          </span>
          <span className="text-[9px] font-mono text-[#888]">Click node to inspect</span>
        </div>

        {selectedNode ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] font-mono text-[#A0A0A0]">Identifier:</span>
              <span className="text-[13px] font-mono font-bold text-white">
                {selectedNode.label} (Layer {selectedNode.layer})
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[11px] font-mono text-[#A0A0A0]">Pre-Activation:</span>
              <span className={`text-[12px] font-mono font-semibold ${selectedNode.value < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {selectedNode.value.toFixed(2)}
              </span>
            </div>

            {selectedNode.layer === 1 && (
              <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[11px] font-mono text-emerald-400">Post-GELU Activation:</span>
                <span className="text-[14px] font-mono font-bold text-emerald-300">
                  {selectedNode.postRelu.toFixed(2)}
                </span>
              </div>
            )}

            <div className="text-[11px] leading-relaxed text-[#A0A0A0] mt-1">
              {selectedNode.layer === 1 && selectedNode.postRelu === 0 ? (
                <span className="text-amber-300">
                  ⚠️ <strong>Threshold Cutoff:</strong> Pre-activation was negative ({selectedNode.value.toFixed(2)}). The non-linear activation silenced this neuron to 0, preventing negative noise from propagating!
                </span>
              ) : selectedNode.layer === 1 ? (
                <span className="text-emerald-300">
                  ⚡ <strong>Feature Fired:</strong> Pre-activation was positive ({selectedNode.value.toFixed(2)}). This neuron detected an active syntactic pattern and amplified it into the output projection.
                </span>
              ) : (
                <span>
                  Linear transformation node carrying continuous geometric values.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-[11px] text-[#666] font-mono">
            Click any neuron circle to inspect its activation
          </div>
        )}
      </div>
    </div>
  );
};
