import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FFNLayerNode } from '../../types';
import { Zap, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NeuronGraphProps {
  nodes: FFNLayerNode[];
  connections: { from: string; to: string; weight: number }[];
}

export const NeuronGraph: React.FC<NeuronGraphProps> = ({ nodes, connections }) => {
  const [selectedNode, setSelectedNode] = useState<FFNLayerNode | null>(nodes[4]); // default h0 (h1)
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const width = 640;
  const height = 340;

  // Layer column x-coordinates
  const layerX = [90, 320, 550];

  // Organize nodes by layer
  const layer0 = nodes.filter((n) => n.layer === 0);
  const layer1 = nodes.filter((n) => n.layer === 1);
  const layer2 = nodes.filter((n) => n.layer === 2);

  const getNodeCoordinates = (node: FFNLayerNode) => {
    const x = layerX[node.layer];
    let y = 0;
    if (node.layer === 0) {
      const step = (height - 80) / (layer0.length - 1);
      const idx = layer0.findIndex((n) => n.id === node.id);
      y = 40 + idx * step;
    } else if (node.layer === 1) {
      const step = (height - 50) / (layer1.length - 1);
      const idx = layer1.findIndex((n) => n.id === node.id);
      y = 25 + idx * step;
    } else {
      const step = (height - 80) / (layer2.length - 1);
      const idx = layer2.findIndex((n) => n.id === node.id);
      y = 40 + idx * step;
    }
    return { x, y };
  };

  // Check if a connection connects to the currently selected node
  const isConnectionActive = (conn: { from: string; to: string }) => {
    if (!selectedNode) return false;
    return conn.to === selectedNode.id || conn.from === selectedNode.id;
  };

  const getNodeColor = (node: FFNLayerNode, isSelected: boolean) => {
    // Layer 0: Input coordinates (Amber)
    if (node.layer === 0) {
      return isSelected
        ? 'fill-amber-500/30 stroke-amber-600 dark:stroke-amber-400'
        : 'fill-amber-500/15 stroke-amber-600/70 dark:stroke-amber-500/60';
    }

    // Layer 1: Hidden feature detectors (Emerald if active, Gray/Slate if GELU silenced)
    if (node.layer === 1) {
      if (node.postRelu === 0) {
        return isSelected
          ? 'fill-slate-200 stroke-slate-500 dark:fill-zinc-900 dark:stroke-zinc-500'
          : 'fill-slate-100 stroke-slate-300 dark:fill-black dark:stroke-zinc-700/80';
      }
      return isSelected
        ? 'fill-emerald-500/30 stroke-emerald-600 dark:stroke-emerald-400'
        : 'fill-emerald-500/15 stroke-emerald-600/70 dark:stroke-emerald-500/60';
    }

    // Layer 2: Output adjustments (Cyan)
    return isSelected
      ? 'fill-cyan-500/30 stroke-cyan-600 dark:stroke-cyan-400'
      : 'fill-cyan-500/15 stroke-cyan-600/70 dark:stroke-cyan-500/60';
  };

  const getNodeTextColor = (node: FFNLayerNode) => {
    if (node.layer === 1 && node.postRelu === 0) {
      return 'fill-slate-400 dark:fill-zinc-500';
    }
    if (node.layer === 0) {
      return 'fill-amber-950 dark:fill-white';
    }
    if (node.layer === 1) {
      return 'fill-emerald-950 dark:fill-white';
    }
    return 'fill-cyan-950 dark:fill-white';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start w-full font-sans">
      {/* SVG Canvas Container */}
      <div className="flex-1 w-full rounded-2xl border border-border bg-surface p-5 shadow-sm dark:shadow-2xl flex flex-col items-center transition-colors duration-200">
        {/* Layer Header Labels with Plain-English Names */}
        <div className="w-full grid grid-cols-3 text-center pb-3 border-b border-border-subtle mb-2">
          {/* Layer 0 */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
              1. Input Layer (d=4)
            </span>
            <span className="text-[9px] font-mono text-text-muted">
              Token Coordinates from Stage 4
            </span>
          </div>

          {/* Layer 1 */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400">
              2. Hidden MLP (4×d = 8) + GELU
            </span>
            <span className="text-[9px] font-mono text-text-muted">
              Expanded Knowledge Feature Detectors
            </span>
          </div>

          {/* Layer 2 */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase font-bold text-cyan-700 dark:text-cyan-400">
              3. Output Layer (d=4)
            </span>
            <span className="text-[9px] font-mono text-text-muted">
              Reasoning Updates for Stage 6 Logits
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible w-full h-auto max-w-[640px] select-none"
          role="img"
          aria-label="Interactive 3-layer Feed-Forward Neural Graph showing Input coordinates, Hidden GELU feature detectors, and Output adjustments"
        >
          {/* Synapses Connections (Weights) */}
          {connections.map((conn) => {
            const source = nodes.find((n) => n.id === conn.from);
            const target = nodes.find((n) => n.id === conn.to);
            if (!source || !target) return null;

            const sPos = getNodeCoordinates(source);
            const tPos = getNodeCoordinates(target);
            const isConnectedToSelected = isConnectionActive(conn);
            const isPositive = conn.weight > 0;
            const isTargetZeroed = target.layer === 1 && target.postRelu === 0;

            let strokeColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.12)';
            let strokeWidth = 1;

            if (isConnectedToSelected) {
              strokeColor = isPositive
                ? isDark ? 'rgba(16, 185, 129, 0.95)' : 'rgba(5, 150, 105, 0.95)'
                : isDark ? 'rgba(244, 63, 94, 0.95)' : 'rgba(225, 29, 72, 0.95)';
              strokeWidth = 2.5;
            } else if (isTargetZeroed) {
              strokeColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.05)';
              strokeWidth = 0.75;
            } else if (isPositive) {
              strokeColor = isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.3)';
              strokeWidth = 1.25;
            } else {
              strokeColor = isDark ? 'rgba(244, 63, 94, 0.2)' : 'rgba(225, 29, 72, 0.25)';
              strokeWidth = 1.25;
            }

            return (
              <g key={`${conn.from}-${conn.to}`}>
                <motion.line
                  x1={sPos.x}
                  y1={sPos.y}
                  x2={tPos.x}
                  y2={tPos.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isConnectedToSelected ? '6 3' : isTargetZeroed ? '2 2' : undefined}
                  animate={isConnectedToSelected ? { strokeDashoffset: [0, -18] } : undefined}
                  transition={isConnectedToSelected ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : undefined}
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
                {/* Glow ring on selected */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={node.layer === 1 ? 19 : 21}
                    className="fill-none stroke-emerald-600 dark:stroke-white/40 stroke-1 animate-pulse"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={node.layer === 1 ? 14 : 16}
                  className={`transition-all ${getNodeColor(node, isSelected)} ${
                    isSelected
                      ? 'stroke-[3px] stroke-emerald-600 dark:stroke-white shadow-[0_0_24px_rgba(5,150,105,0.4)] dark:shadow-[0_0_24px_rgba(255,255,255,0.7)]'
                      : 'stroke-[1.5px] hover:stroke-emerald-600/80 dark:hover:stroke-white/80'
                  }`}
                />

                {/* Node Label (x1..x4, h1..h8, y1..y4) */}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold select-none pointer-events-none ${getNodeTextColor(node)}`}
                >
                  {isDeactivated ? '0' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-4 border-t border-border-subtle text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            <span>Input Dimensions (x₁..x₄)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>Fired Feature (GELU &gt; 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-400 dark:bg-zinc-800 dark:border-zinc-600" />
            <span>Silenced Noise (GELU = 0.00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />
            <span>Output Adjustments (y₁..y₄)</span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry & Math Arithmetic Inspector */}
      <div className="w-full xl:w-96 bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
              Neuron Telemetry & Exact Math
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">Click any node</span>
        </div>

        {selectedNode ? (
          <div className="flex flex-col gap-4">
            {/* Header: Node name & functional role */}
            <div className="flex flex-col p-3 rounded-xl bg-surface-raised border border-border-subtle gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-text-muted uppercase">
                  {selectedNode.layer === 0
                    ? 'Input Coordinate'
                    : selectedNode.layer === 1
                    ? 'Hidden Feature Detector'
                    : 'Output Reasoning Coordinate'}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle font-mono text-[12px] font-bold text-text-main border border-border-subtle">
                  Node: {selectedNode.label}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-text-main">
                {selectedNode.name || selectedNode.label}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {selectedNode.role}
              </span>
            </div>

            {/* Arithmetic Breakdown for Hidden Neurons (Layer 1) */}
            {selectedNode.layer === 1 && (
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface-subtle/40 dark:bg-black/40 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-text-main font-bold">
                    How Was Pre-Activation Calculated?
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">∑ (Input × Weight) + Bias</span>
                </div>

                {/* Calculation steps */}
                {selectedNode.calculationSteps && selectedNode.calculationSteps.length > 0 ? (
                  <div className="flex flex-col gap-1.5 pt-1 text-[11px] font-mono">
                    {selectedNode.calculationSteps.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-surface border border-border-subtle">
                        <span className="text-text-secondary">
                          ({step.fromNode} = {step.inputValue >= 0 ? `+${step.inputValue.toFixed(2)}` : step.inputValue.toFixed(2)}) × (w = {step.weight >= 0 ? `+${step.weight.toFixed(2)}` : step.weight.toFixed(2)})
                        </span>
                        <span className="text-text-main font-semibold">
                          = {step.product >= 0 ? `+${step.product.toFixed(2)}` : step.product.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {/* Stored bias */}
                    {selectedNode.bias !== undefined && (
                      <div className="flex justify-between items-center p-1.5 rounded bg-surface text-text-muted border border-border-subtle">
                        <span>+ Stored Neuron Bias</span>
                        <span className="font-semibold">{selectedNode.bias >= 0 ? `+${selectedNode.bias.toFixed(2)}` : selectedNode.bias.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Sum: Pre-Activation */}
                    <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-[12px]">
                      <span className="text-text-main">Pre-Activation Sum:</span>
                      <span className={selectedNode.value < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        {selectedNode.value >= 0 ? `+${selectedNode.value.toFixed(2)}` : selectedNode.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-text-muted">
                    Pre-activation: {selectedNode.value.toFixed(2)}
                  </div>
                )}

                {/* GELU Gate Explanation */}
                <div
                  className={`p-3 rounded-lg border flex flex-col gap-1 mt-1 ${
                    selectedNode.postRelu === 0
                      ? 'bg-rose-500/[0.08] border-rose-500/25 text-rose-900 dark:text-rose-300'
                      : 'bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px] font-mono uppercase">
                    {selectedNode.postRelu === 0 ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>GELU Gate Slams Shut (Blocked)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>GELU Gate Opens (Fired)</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedNode.postRelu === 0 ? (
                      <span>
                        Pre-activation was <strong>negative ({selectedNode.value.toFixed(2)})</strong>. The GELU function acts as a threshold gate and silences it to <strong>0.00</strong> to prevent negative noise from propagating!
                      </span>
                    ) : (
                      <span>
                        Pre-activation was <strong>positive (+{selectedNode.value.toFixed(2)})</strong>. The feature detected an active pattern, passed through the GELU gate, and transmits <strong>{selectedNode.postRelu.toFixed(2)}</strong> forward to the output layer!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Arithmetic Breakdown for Output Layer (Layer 2) */}
            {selectedNode.layer === 2 && (
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-subtle/40 dark:bg-black/40 border border-border-subtle text-[11px] font-mono">
                <span className="text-text-main font-bold uppercase tracking-wider">
                  How Was Output Calculated?
                </span>
                {selectedNode.calculationSteps && (
                  <div className="flex flex-col gap-1 pt-1">
                    {selectedNode.calculationSteps.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-surface border border-border-subtle">
                        <span className="text-text-secondary">
                          ({step.fromNode} = {step.inputValue.toFixed(2)}) × (w = {step.weight >= 0 ? `+${step.weight.toFixed(2)}` : step.weight.toFixed(2)})
                        </span>
                        <span className="text-cyan-800 dark:text-cyan-300 font-semibold">
                          = {step.product >= 0 ? `+${step.product.toFixed(2)}` : step.product.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-[12px]">
                      <span className="text-text-main">Output Value ({selectedNode.label}):</span>
                      <span className="text-cyan-800 dark:text-cyan-300">
                        {selectedNode.value >= 0 ? `+${selectedNode.value.toFixed(2)}` : selectedNode.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stage Context Callout */}
            <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                <span>Context in the AI Pipeline:</span>
              </div>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                {selectedNode.stageContext}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[12px] text-text-muted font-mono">
            Click any neuron in the graph to see its incoming calculations
          </div>
        )}
      </div>
    </div>
  );
};
