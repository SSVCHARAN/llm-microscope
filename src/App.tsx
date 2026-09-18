import React, { useEffect, useState, useMemo } from 'react';
import { useMicroscope } from './hooks/useMicroscope';
import { usePipelineVisualizer } from './hooks/usePipelineVisualizer';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Server, Zap, ArrowRight, Loader2, Database } from 'lucide-react';

const springConfig = { type: "spring", stiffness: 400, damping: 30, bounce: 0 };
const fastSpring = { type: "spring", stiffness: 500, damping: 40, bounce: 0 };

const NeuralGraph = ({ isActive }: { isActive: boolean }) => {
  const layers = [4, 6, 5, 3];
  const width = 300;
  const height = 180;
  
  const nodes = useMemo(() => {
    let result = [];
    const xStep = width / (layers.length - 1);
    layers.forEach((nodeCount, layerIdx) => {
      const yStep = height / Math.max(1, nodeCount);
      const yOffset = (height - (nodeCount - 1) * yStep) / 2;
      for (let i = 0; i < nodeCount; i++) {
        result.push({ id: `L${layerIdx}-N${i}`, layer: layerIdx, x: layerIdx * xStep, y: yOffset + i * yStep });
      }
    });
    return result;
  }, []);

  const connections = useMemo(() => {
    let result = [];
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayerNodes = nodes.filter(n => n.layer === l);
      const nextLayerNodes = nodes.filter(n => n.layer === l + 1);
      currentLayerNodes.forEach(source => {
        nextLayerNodes.forEach(target => {
          const weight = Math.random();
          result.push({ id: `${source.id}-${target.id}`, source, target, weight, layer: l });
        });
      });
    }
    return result;
  }, [nodes]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <svg width={width} height={height} className="overflow-visible">
        {connections.map((c) => (
          <motion.line
            key={c.id}
            x1={c.source.x} y1={c.source.y}
            x2={c.target.x} y2={c.target.y}
            stroke={c.weight > 0.8 ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.05)"}
            strokeWidth={c.weight > 0.8 ? 1.5 : 1}
            initial={{ opacity: 0.1 }}
            animate={isActive ? {
              opacity: [0.1, Math.max(0.4, c.weight), 0.1],
              stroke: ["rgba(255,255,255,0.05)", "rgba(16,185,129,0.9)", "rgba(255,255,255,0.05)"]
            } : { opacity: 0.1, stroke: "rgba(255,255,255,0.05)" }}
            transition={{
              duration: 0.4,
              times: [0, 0.5, 1],
              delay: c.layer * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}

        {nodes.map((n) => (
          <motion.circle
            key={n.id}
            cx={n.x} cy={n.y} r={4}
            className="fill-[#0A0A0A] stroke-white/20"
            strokeWidth={1.5}
            animate={isActive ? {
              fill: ["#0A0A0A", "#10B981", "#0A0A0A"],
              stroke: ["rgba(255,255,255,0.2)", "rgba(16,185,129,1)", "rgba(255,255,255,0.2)"]
            } : { fill: "#0A0A0A", stroke: "rgba(255,255,255,0.2)" }}
            transition={{
              duration: 0.4,
              times: [0, 0.5, 1],
              delay: n.layer * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export function App() {
  const {
    selectedModel, isConnected, prompt, setPrompt, 
    isGenerating, startGeneration, stopGeneration, steps: rawSteps,
    loadingProgress, isEngineReady, engineError
  } = useMicroscope();

  const [isFocused, setIsFocused] = useState(false);
  const { visualizedSteps, currentAnimStep, stage, isPlaying, setIsPlaying } = usePipelineVisualizer(rawSteps, isGenerating);

  const isPipelineActive = isGenerating || visualizedSteps.length > 0;
  const logprobs = currentAnimStep?.alternatives || [];
  const topAlternative = logprobs[0]?.probability || 1;

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#EDEDED] font-sans selection:bg-white/20 flex flex-col items-center relative overflow-hidden">
      
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] mix-blend-overlay z-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-20%,rgba(255,255,255,0.04),transparent)] z-0" />

      <header className="w-full max-w-7xl h-14 px-6 flex items-center justify-between border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-sm bg-white flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <div className="w-2 h-2 bg-black rounded-[2px]" />
          </div>
          <h1 className="font-semibold text-[13px] tracking-tight">LLM Microscope</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase">
             <div className="relative flex items-center justify-center">
               {isEngineReady && <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-50" />}
               <span className={`relative w-1.5 h-1.5 rounded-full ${isEngineReady ? 'bg-emerald-500' : 'bg-orange-500'}`} />
             </div>
             <span className="text-white/40">{isEngineReady ? 'WebGPU Connected' : 'Initializing Weights...'}</span>
          </div>

          <div className="flex p-0.5 bg-[#000000] border border-white/[0.06] rounded-md relative">
            <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-medium text-white">
              <Database className="w-3 h-3" /> Native Transformers.js
              <motion.div layoutId="engine-mode-bg" className="absolute inset-0 bg-white/[0.1] rounded-[4px] -z-10" />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl flex-1 flex flex-col p-6 gap-6 relative z-10">
        
        {engineError && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-md p-3 flex flex-col gap-2 text-[12px] font-mono text-red-400">
             <strong>Engine Error:</strong> {engineError}
          </div>
        )}
        {loadingProgress && (
          <div className="w-full bg-orange-500/10 border border-orange-500/20 rounded-md p-3 flex flex-col gap-2">
             <div className="flex justify-between text-[11px] font-mono text-orange-400">
               <span>Downloading Weights: {loadingProgress.file}</span>
               <span>{Math.round(loadingProgress.progress || 0)}%</span>
             </div>
             <div className="w-full h-1 bg-black rounded-full overflow-hidden">
               <div className="h-full bg-orange-500" style={{ width: `${loadingProgress.progress}%` }} />
             </div>
          </div>
        )}

        <section className="flex flex-col gap-3">
          <motion.div 
            animate={{ borderColor: isFocused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)' }}
            transition={fastSpring}
            className="relative rounded-xl border bg-white/[0.01] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_8px_16px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isGenerating || !isEngineReady}
              placeholder="Enter prompt…"
              className="w-full min-h-[90px] bg-transparent p-5 text-[14px] leading-relaxed outline-none resize-none placeholder:text-[#666] disabled:opacity-50"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <button 
                onClick={isGenerating ? stopGeneration : startGeneration}
                disabled={(!prompt.trim() && !isGenerating) || !isEngineReady}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-[12px] font-medium bg-[#EDEDED] text-black hover:bg-white transition-transform active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
              >
                {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancel</> : <>Generate Native <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </motion.div>
        </section>

        <section className="flex-1 rounded-xl border border-white/[0.06] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_12px_24px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden min-h-[500px]">
          <div className="h-12 border-b border-white/[0.06] flex items-center justify-between px-5 bg-white/[0.01]">
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-tight text-[#888]">
              <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
              GPT2_124M_PIPELINE
            </div>
          </div>

          {!isPipelineActive ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
               <p className="text-[13px] text-white/60 font-medium">Awaiting Execution</p>
            </div>
          ) : (
            <div className="flex-1 p-8 grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr] gap-6 relative overflow-hidden">
              <div className="flex flex-col gap-3 relative z-10">
                <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] flex items-center gap-2">Feed Forward Network</h3>
                <div className="flex-1 rounded-lg border border-white/[0.06] bg-[#0A0A0A] relative overflow-hidden shadow-inner flex items-center justify-center">
                   <NeuralGraph isActive={stage === 'inference'} />
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] flex items-center gap-2">Token Identity</h3>
                <div className="flex-1 rounded-lg border border-white/[0.06] bg-[#0A0A0A] p-4 flex flex-col justify-center gap-3 shadow-inner">
                  {logprobs.length > 0 ? logprobs.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-mono text-[#EDEDED]">{item.token === '\n' ? '↵' : item.token}</span>
                      </div>
                      <div className="w-full h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div layout initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0 }} transition={fastSpring} className={`h-full ${i === 0 ? 'bg-white' : 'bg-emerald-500'}`} />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-[10px] font-mono text-white/20">Awaiting Logits...</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] flex items-center gap-2">Selected</h3>
                <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <AnimatePresence mode="wait">
                    {currentAnimStep?.tokenText && (stage === 'selection' || stage === 'append') && (
                      <motion.div key={currentAnimStep.tokenText + currentAnimStep.index} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={springConfig} className="px-4 py-2 rounded-md bg-white border border-white text-[13px] font-mono text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        {currentAnimStep.tokenText === '\n' ? '↵' : currentAnimStep.tokenText}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] flex items-center gap-2 text-right justify-end">Context Array</h3>
                <div className="flex-1 rounded-lg border border-white/[0.06] bg-[#0A0A0A] p-3 flex flex-col gap-1.5 overflow-y-auto shadow-inner items-end">
                  <AnimatePresence>
                    {visualizedSteps.map((step) => (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={springConfig} key={step.index} className="px-2 py-1.5 rounded bg-white/[0.04] text-[11px] font-mono text-[#A0A0A0] border border-white/[0.02]">
                        {step.tokenText === '\n' ? '↵' : step.tokenText}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
