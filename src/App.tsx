import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStageController } from './hooks/useStageController';
import { InputBar } from './components/InputBar';
import { StageHeader } from './components/StageHeader';
import { ExplainerCard } from './components/ExplainerCard';

// 7 Educational Stages
import { TokenizationStage } from './components/stages/TokenizationStage';
import { EmbeddingStage } from './components/stages/EmbeddingStage';
import { AttentionQKVStage } from './components/stages/AttentionQKVStage';
import { AttentionHeatmapStage } from './components/stages/AttentionHeatmapStage';
import { FeedForwardStage } from './components/stages/FeedForwardStage';
import { SoftmaxStage } from './components/stages/SoftmaxStage';
import { SamplingStage } from './components/stages/SamplingStage';

import { Microscope, ArrowRight, ArrowLeft, RotateCcw, Cpu } from 'lucide-react';

export function App() {
  const {
    activeStageIndex,
    currentStage,
    stages,
    totalStages,
    goToStage,
    nextStage,
    prevStage,
    resetPipeline,
    isAutoPlaying,
    toggleAutoPlay,
    speed,
    setSpeed,
    mockData,
    temperature,
    setTemperature,
    topK,
    setTopK,
    dynamicLogits,
    winnerToken,
    isDiceRolling,
    rollSamplingDice
  } = useStageController();

  const renderActiveStageComponent = () => {
    switch (currentStage.id) {
      case 'tokenization':
        return (
          <TokenizationStage
            tokens={mockData.tokens}
            rawPrompt={mockData.prompt}
          />
        );
      case 'embedding':
        return (
          <EmbeddingStage
            tokens={mockData.tokens}
            embeddings={mockData.embeddings}
          />
        );
      case 'attention_qkv':
        return (
          <AttentionQKVStage
            tokens={mockData.tokens}
            qkv={mockData.qkv}
            embeddings={mockData.embeddings}
            qkvWeights={mockData.qkvWeights}
          />
        );
      case 'attention_heatmap':
        return (
          <AttentionHeatmapStage
            tokens={mockData.tokens}
            heads={mockData.attentionHeads}
          />
        );
      case 'feed_forward':
        return (
          <FeedForwardStage
            nodes={mockData.ffnNodes}
            connections={mockData.ffnConnections}
          />
        );
      case 'softmax':
        return (
          <SoftmaxStage
            candidates={dynamicLogits}
            temperature={temperature}
            onTemperatureChange={setTemperature}
          />
        );
      case 'sampling':
        return (
          <SamplingStage
            candidates={dynamicLogits}
            winnerToken={winnerToken}
            isDiceRolling={isDiceRolling}
            onRollDice={rollSamplingDice}
            topK={topK}
            onTopKChange={setTopK}
            prompt={mockData.prompt}
          />
        );
      default:
        return null;
    }
  };

  const nextStageObj = activeStageIndex < totalStages - 1 ? stages[activeStageIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#EDEDED] font-sans selection:bg-white/20 flex flex-col items-center relative overflow-x-hidden">
      {/* Background Ambience & Noise */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-20%,rgba(16,185,129,0.06),transparent)] z-0" />

      {/* Main Top Header */}
      <header className="w-full max-w-7xl h-14 px-6 flex items-center justify-between border-b border-white/[0.06] relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <Microscope className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold text-[14px] tracking-tight text-white">LLM Microscope</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              v2 Architecture Visualizer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#A0A0A0]">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPT-2 / Transformer Architecture</span>
          </div>
        </div>
      </header>

      {/* Sticky Interactive Stepper & Playback Controller */}
      <InputBar
        prompt={mockData.prompt}
        stages={stages}
        activeStageIndex={activeStageIndex}
        onSelectStage={goToStage}
        onNext={nextStage}
        onPrev={prevStage}
        onReset={resetPipeline}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={toggleAutoPlay}
        speed={speed}
        onChangeSpeed={setSpeed}
      />

      {/* Main Stage Content Container */}
      <main className="w-full max-w-7xl flex-1 flex flex-col p-6 gap-8 relative z-10">
        {/* Stage Header Info */}
        <section className="flex flex-col gap-2">
          <StageHeader stage={currentStage} />
        </section>

        {/* Visual Stage Interactive Canvas */}
        <section className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              {renderActiveStageComponent()}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Architectural Explainer Card */}
        <section className="w-full">
          <ExplainerCard stage={currentStage} />
        </section>

        {/* Bottom Step Navigation Footer */}
        <footer className="w-full flex items-center justify-between pt-6 pb-12 border-t border-white/[0.08]">
          <button
            onClick={prevStage}
            disabled={activeStageIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[12px] font-mono text-[#A0A0A0] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-[11px] font-mono text-[#777]">
            Step {activeStageIndex + 1} of {totalStages}
          </span>

          {activeStageIndex < totalStages - 1 ? (
            <button
              onClick={nextStage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-black text-[12px] font-mono font-bold hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
            >
              <span>Next: {nextStageObj?.title.split('(')[0]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={resetPipeline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-black text-[12px] font-mono font-bold hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Walkthrough</span>
            </button>
          )}
        </footer>
      </main>
    </div>
  );
}
