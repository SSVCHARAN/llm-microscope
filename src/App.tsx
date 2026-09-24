import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStageController, STAGE_PHASE_COUNTS } from './hooks/useStageController';
import { useMicroscope } from './hooks/useMicroscope';
import { usePipelineVisualizer } from './hooks/usePipelineVisualizer';

// Common Components
import { InputBar, STAGE_SHORT_LABELS } from './components/InputBar';
import { StageHeader } from './components/StageHeader';
import { ExplainerCard } from './components/ExplainerCard';
import { ThemeToggle } from './components/ThemeToggle';
import { AboutModal } from './components/AboutModal';
import { DeepLensBrand } from './components/DeepLensLogo';

// 7 Educational Stages (Mode: Architecture Walkthrough)
import { TokenizationStage } from './components/stages/TokenizationStage';
import { EmbeddingStage } from './components/stages/EmbeddingStage';
import { AttentionQKVStage } from './components/stages/AttentionQKVStage';
import { AttentionHeatmapStage } from './components/stages/AttentionHeatmapStage';
import { FeedForwardStage } from './components/stages/FeedForwardStage';
import { SoftmaxStage } from './components/stages/SoftmaxStage';
import { SamplingStage } from './components/stages/SamplingStage';

// Live Generation Observability Components (Mode: Live Generation Loop)
import { TokenPredictionLoop } from './components/TokenPredictionLoop';
import { GeneratedTextView } from './components/GeneratedTextView';
import { MetricsPanel } from './components/MetricsPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { RawEventInspector } from './components/RawEventInspector';

// Icons
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Cpu,
  Play,
  Square,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Linkedin
} from 'lucide-react';

export type AppMode = 'architecture' | 'live_loop';

export function App() {
  const [appMode, setAppMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'live_loop' || mode === 'architecture') return mode;
    }
    return 'architecture';
  });
  const [selectedInspectStep, setSelectedInspectStep] = useState<number | null>(null);
  const [showTokenBoundaries, setShowTokenBoundaries] = useState<boolean>(true);

  // First-visit onboarding / About guide modal state
  const [showAboutModal, setShowAboutModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('about') === 'true') return true;
      if (params.get('about') === 'false') return false;
      const dismissed = localStorage.getItem('llm_microscope_onboarding_dismissed');
      return dismissed !== 'true';
    }
    return false;
  });

  // Architecture Walkthrough Controller
  const stageCtrl = useStageController();

  // Live Microscope Hook (LM Studio / Web Worker / Trace)
  const microscope = useMicroscope();

  // Visualizer State Machine for Live Generation Loop
  const visualizer = usePipelineVisualizer(microscope.steps, microscope.isGenerating);

  // Clear manual inspection selection when a new generation starts
  useEffect(() => {
    if (microscope.isGenerating) {
      setSelectedInspectStep(null);
    }
  }, [microscope.isGenerating]);

  // ─── Autoplay Integration ──────────────────────────────────────
  const stageHeaderRef = useRef<HTMLElement>(null);

  // Compute the phase prop for stage components:
  // When autoplay is active → pass the currentPhase number
  // When manually navigating → pass undefined (show all content)
  const stagePhase = stageCtrl.isAutoPlaying ? stageCtrl.currentPhase : undefined;

  // Auto-pause when user interacts with the stage canvas
  const handleStageInteraction = useCallback(() => {
    if (stageCtrl.isAutoPlaying) {
      stageCtrl.toggleAutoPlay();
    }
  }, [stageCtrl.isAutoPlaying, stageCtrl.toggleAutoPlay]);

  // Controlled educational scroll during autoplay:
  // - On stage transition (or phase 0): smoothly scrolls stage header into view at top
  // - On phase 1 / 2: smoothly scrolls to center the revealed data-autoplay-focal element
  const prevStageIndexRef = useRef(stageCtrl.activeStageIndex);
  useEffect(() => {
    if (!stageCtrl.isAutoPlaying) {
      if (prevStageIndexRef.current !== stageCtrl.activeStageIndex) {
        prevStageIndexRef.current = stageCtrl.activeStageIndex;
        stageHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (prevStageIndexRef.current !== stageCtrl.activeStageIndex || stageCtrl.currentPhase === 0) {
      prevStageIndexRef.current = stageCtrl.activeStageIndex;
      stageHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Small timeout to allow DOM to render and animate revealed section
      const timer = setTimeout(() => {
        const focalEl = document.querySelector('[data-autoplay-focal="true"]');
        if (focalEl) {
          focalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [stageCtrl.activeStageIndex, stageCtrl.currentPhase, stageCtrl.isAutoPlaying]);

  // Keyboard shortcuts for architecture mode
  useEffect(() => {
    if (appMode !== 'architecture') return;

    const handler = (e: KeyboardEvent) => {
      // Don't intercept when user is focused on an input/textarea/select
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      switch (e.key) {
        case 'p':
        case 'P':
          e.preventDefault();
          stageCtrl.toggleAutoPlay();
          break;
        case 'Escape':
          if (stageCtrl.isAutoPlaying) {
            e.preventDefault();
            stageCtrl.toggleAutoPlay();
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appMode, stageCtrl.isAutoPlaying, stageCtrl.toggleAutoPlay]);

  // Render stage component for Architecture Walkthrough
  const renderActiveStageComponent = () => {
    switch (stageCtrl.currentStage.id) {
      case 'tokenization':
        return (
          <TokenizationStage
            tokens={stageCtrl.mockData.tokens}
            rawPrompt={stageCtrl.mockData.prompt}
            phase={stagePhase}
          />
        );
      case 'embedding':
        return (
          <EmbeddingStage
            tokens={stageCtrl.mockData.tokens}
            embeddings={stageCtrl.mockData.embeddings}
            phase={stagePhase}
          />
        );
      case 'attention_qkv':
        return (
          <AttentionQKVStage
            tokens={stageCtrl.mockData.tokens}
            qkv={stageCtrl.mockData.qkv}
            embeddings={stageCtrl.mockData.embeddings}
            qkvWeights={stageCtrl.mockData.qkvWeights}
            phase={stagePhase}
          />
        );
      case 'attention_heatmap':
        return (
          <AttentionHeatmapStage
            tokens={stageCtrl.mockData.tokens}
            heads={stageCtrl.mockData.attentionHeads}
            attentionOutput={stageCtrl.mockData.attentionOutput}
            phase={stagePhase}
          />
        );
      case 'feed_forward':
        return (
          <FeedForwardStage
            nodes={stageCtrl.mockData.ffnNodes}
            connections={stageCtrl.mockData.ffnConnections}
            attentionOutput={stageCtrl.mockData.attentionOutput}
            phase={stagePhase}
          />
        );
      case 'softmax':
        return (
          <SoftmaxStage
            candidates={stageCtrl.dynamicLogits}
            temperature={stageCtrl.temperature}
            onTemperatureChange={stageCtrl.setTemperature}
            unembeddingData={stageCtrl.mockData.unembeddingData}
            phase={stagePhase}
          />
        );
      case 'sampling':
        return (
          <SamplingStage
            candidates={stageCtrl.dynamicLogits}
            winnerToken={stageCtrl.winnerToken}
            isDiceRolling={stageCtrl.isDiceRolling}
            onRollDice={stageCtrl.rollSamplingDice}
            topK={stageCtrl.topK}
            onTopKChange={stageCtrl.setTopK}
            prompt={stageCtrl.mockData.prompt}
            phase={stagePhase}
          />
        );
      default:
        return null;
    }
  };

  const nextStageObj =
    stageCtrl.activeStageIndex < stageCtrl.totalStages - 1
      ? stageCtrl.stages[stageCtrl.activeStageIndex + 1]
      : null;

  // Selected step for inspection in live mode (disregard manual freeze during active generation)
  const displayedLiveStep =
    !microscope.isGenerating && selectedInspectStep !== null
      ? microscope.steps.find((s) => s.index === selectedInspectStep) || null
      : visualizer.speed === 'LIVE'
      ? (microscope.steps.length > 0 ? microscope.steps[microscope.steps.length - 1] : null)
      : visualizer.currentAnimStep || (visualizer.visualizedSteps.length > 0 ? visualizer.visualizedSteps[visualizer.visualizedSteps.length - 1] : null);

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 flex flex-col items-center relative overflow-x-hidden transition-colors duration-200">
      {/* Background Ambience & Noise */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-20%,rgba(5,150,105,0.05),transparent)] dark:bg-[radial-gradient(ellipse_70%_40%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] z-0" />

      {/* Main Top Header Navigation */}
      <header className="w-full h-16 border-b border-border relative z-30 bg-background/90 backdrop-blur-md shadow-sm transition-colors duration-200">
        <div className="w-full px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Column: Brand (anchored to the far left) */}
          <div className="flex items-center justify-start shrink-0 min-w-0">
            <DeepLensBrand />
          </div>

          {/* Center Column: View Switcher (dead-center in navbar) */}
          <div className="flex items-center justify-center shrink-0">
            <div className="flex items-center h-9 p-1 rounded-xl bg-surface-raised border border-border text-xs font-mono shadow-sm">
              <button
                onClick={() => setAppMode('architecture')}
                role="tab"
                aria-selected={appMode === 'architecture'}
                className={`flex items-center gap-1.5 h-7 px-2.5 sm:px-3 rounded-lg whitespace-nowrap transition-all focus-ring ${
                  appMode === 'architecture'
                    ? 'bg-primary text-white dark:text-black font-bold shadow-[0_0_14px_rgba(5,150,105,0.3)] dark:shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Architecture Deep-Dive</span>
                <span className="sm:hidden">Architecture</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 hidden md:inline font-mono">7 Stages</span>
              </button>

              <button
                onClick={() => setAppMode('live_loop')}
                role="tab"
                aria-selected={appMode === 'live_loop'}
                className={`flex items-center gap-1.5 h-7 px-2.5 sm:px-3 rounded-lg whitespace-nowrap transition-all focus-ring ${
                  appMode === 'live_loop'
                    ? 'bg-primary text-white dark:text-black font-bold shadow-[0_0_14px_rgba(5,150,105,0.3)] dark:shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Live Generation Loop</span>
                <span className="sm:hidden">Live Loop</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 hidden md:inline font-mono">LM Studio / Trace</span>
              </button>
            </div>
          </div>

          {/* Right Column: Telemetry Badge + Theme Toggle (anchored to the far right) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center">
              {appMode === 'architecture' ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-xl text-[11px] font-mono text-text-muted bg-surface-raised border border-border whitespace-nowrap shadow-sm">
                  <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="hidden xl:inline">GPT-2 Forward Pass (d=768)</span>
                  <span className="xl:hidden">GPT-2 (d=768)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 h-9 px-3 rounded-xl text-[11px] font-mono text-text-muted bg-surface-raised border border-border whitespace-nowrap shadow-sm">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      microscope.isGenerating
                        ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : microscope.isConnected
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-text-main font-medium whitespace-nowrap">
                    {microscope.engineType === 'trace'
                      ? 'Flight Recorder Trace'
                      : microscope.engineType === 'webworker'
                      ? `ONNX: ${microscope.selectedModel.split('/').pop() || 'SmolLM2 135M'}`
                      : microscope.isLmStudioConnected
                      ? 'LM Studio Connected'
                      : 'LM Studio Disconnected'}
                  </span>
                </div>
              )}
            </div>

            {/* Connect with me (LinkedIn) */}
            <a
              href="https://www.linkedin.com/in/charan-ssv-081bb4394/"
              target="_blank"
              rel="noopener noreferrer"
              title="Connect with me on LinkedIn"
              aria-label="Connect with me on LinkedIn"
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-[12px] font-mono text-text-muted hover:text-[#0a66c2] bg-surface-raised border border-border hover:border-[#0a66c2]/40 hover:bg-surface-subtle transition-all focus-ring shadow-sm whitespace-nowrap"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0a66c2] shrink-0 fill-[#0a66c2]/10" />
              <span className="hidden sm:inline">Connect with me</span>
            </a>

            {/* Field Guide & About Modal Button */}
            <button
              onClick={() => setShowAboutModal(true)}
              title="About DeepLens AI & Field Guide"
              aria-label="About DeepLens AI & Field Guide"
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-[12px] font-mono text-text-muted hover:text-text-main bg-surface-raised border border-border hover:bg-surface-subtle transition-all focus-ring shadow-sm whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Theme Toggle Button (Magic UI Animated Theme Toggler) */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODE 1: ARCHITECTURAL WALKTHROUGH (7 TRANSFORMER STAGES) */}
      {/* ========================================================================= */}
      {appMode === 'architecture' && (
        <div className="w-full flex flex-col items-center">
          {/* Sticky Interactive Stepper & Playback Controller */}
          <InputBar
            prompt={stageCtrl.mockData.prompt}
            stages={stageCtrl.stages}
            activeStageIndex={stageCtrl.activeStageIndex}
            onSelectStage={stageCtrl.goToStage}
            onNext={stageCtrl.nextStage}
            onPrev={stageCtrl.prevStage}
            onReset={stageCtrl.resetPipeline}
            isAutoPlaying={stageCtrl.isAutoPlaying}
            onToggleAutoPlay={stageCtrl.toggleAutoPlay}
            speed={stageCtrl.speed}
            onChangeSpeed={stageCtrl.setSpeed}
            currentPhase={stageCtrl.currentPhase}
            currentStagePhaseCount={stageCtrl.currentStagePhaseCount}
          />

          {/* Screen Reader Autoplay Status */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {stageCtrl.isAutoPlaying
              ? `Auto-playing: Stage ${stageCtrl.activeStageIndex + 1} of 7, ${stageCtrl.currentStage.title}, phase ${stageCtrl.currentPhase + 1} of ${stageCtrl.currentStagePhaseCount}`
              : `Viewing: Stage ${stageCtrl.activeStageIndex + 1} of 7, ${stageCtrl.currentStage.title}`
            }
          </div>

          {/* Main Stage Content Container */}
          <main className="w-full max-w-[90rem] flex-1 flex flex-col p-4 sm:p-5 lg:p-6 gap-5 relative z-10">
            {/* Stage Header Info */}
            <section className="flex flex-col gap-2" ref={stageHeaderRef}>
              <StageHeader stage={stageCtrl.currentStage} />
            </section>

            {/* Visual Stage Interactive Canvas — onPointerDown pauses autoplay */}
            <section
              className="flex flex-col gap-6 w-full"
              onPointerDown={handleStageInteraction}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageCtrl.currentStage.id}
                  initial={{ opacity: 0.95, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="w-full"
                >
                  {renderActiveStageComponent()}
                </motion.div>
              </AnimatePresence>
            </section>

            {/* Architectural Explainer Card */}
            <section className="w-full">
              <ExplainerCard
                stage={stageCtrl.currentStage}
                visiblePoints={stageCtrl.isAutoPlaying ? Math.min(stageCtrl.currentPhase + 1, stageCtrl.currentStage.howItWorks.length) : undefined}
              />
            </section>

            {/* Bottom Step Navigation Footer */}
            <footer className="w-full flex items-center justify-between pt-6 pb-12 border-t border-border gap-2">
              <button
                onClick={stageCtrl.prevStage}
                disabled={stageCtrl.activeStageIndex === 0}
                aria-label="Previous step"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-border bg-surface-raised text-[12px] font-mono text-text-muted hover:text-text-main hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none transition-all focus-ring shadow-sm whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Previous Step</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <span className="text-[11px] font-mono text-text-muted whitespace-nowrap px-1">
                Step {stageCtrl.activeStageIndex + 1} of {stageCtrl.totalStages}
              </span>

              {stageCtrl.activeStageIndex < stageCtrl.totalStages - 1 ? (
                <button
                  onClick={stageCtrl.nextStage}
                  aria-label={`Next step: ${nextStageObj?.title}`}
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-white dark:text-black text-[12px] font-mono font-bold hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-[0_0_20px_rgba(5,150,105,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] focus-ring whitespace-nowrap shrink-0"
                >
                  <span className="hidden sm:inline">Next: {nextStageObj ? STAGE_SHORT_LABELS[nextStageObj.id] || nextStageObj.title.split('(')[0] : 'Next'}</span>
                  <span className="sm:hidden">Next: {nextStageObj ? STAGE_SHORT_LABELS[nextStageObj.id] || 'Next' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              ) : (
                <button
                  onClick={stageCtrl.resetPipeline}
                  aria-label="Restart walkthrough from Stage 1"
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-white dark:text-black text-[12px] font-mono font-bold hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-[0_0_20px_rgba(5,150,105,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] focus-ring whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Restart Walkthrough</span>
                  <span className="sm:hidden">Restart</span>
                </button>
              )}
            </footer>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: LIVE GENERATION LOOP (LM STUDIO / ONNX WORKER / TRACE REPLAY) */}
      {/* ========================================================================= */}
      {appMode === 'live_loop' && (
        <div className="w-full flex flex-col items-center">
          {/* Live Controller Bar */}
          <section className="w-full bg-surface/90 border-b border-border backdrop-blur-md sticky top-0 z-20 py-3 shadow-md transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
              {/* Engine Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider hidden sm:inline">
                  Inference Engine:
                </span>
                <div className="flex items-center h-9 p-1 rounded-xl bg-surface-raised border border-border text-[11px] font-mono shadow-sm overflow-x-auto max-w-full">
                  <button
                    onClick={() => microscope.setEngineType('trace')}
                    className={`h-7 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 transition-all focus-ring whitespace-nowrap shrink-0 ${
                      microscope.engineType === 'trace'
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                    }`}
                  >
                    <span>✈️</span>
                    <span className="hidden sm:inline">Trace Replay (Mock)</span>
                    <span className="sm:hidden">Trace</span>
                  </button>

                  <button
                    onClick={() => microscope.setEngineType('webworker')}
                    className={`h-7 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 transition-all focus-ring whitespace-nowrap shrink-0 ${
                      microscope.engineType === 'webworker'
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                    }`}
                  >
                    <span>🧠</span>
                    <span className="hidden sm:inline">In-Browser ONNX</span>
                    <span className="sm:hidden">ONNX</span>
                  </button>

                  <button
                    onClick={() => microscope.setEngineType('lmstudio')}
                    className={`h-7 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 transition-all focus-ring whitespace-nowrap shrink-0 ${
                      microscope.engineType === 'lmstudio'
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                    }`}
                  >
                    <span>🔌</span>
                    <span className="hidden sm:inline">Local LM Studio</span>
                    <span className="sm:hidden">LM Studio</span>
                  </button>
                </div>

                {microscope.engineType === 'lmstudio' && (
                  <button
                    onClick={microscope.checkConnection}
                    disabled={microscope.isCheckingConnection}
                    title="Refresh LM Studio connection"
                    aria-label="Refresh LM Studio connection"
                    className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-surface-raised text-text-muted hover:text-text-main transition-colors focus-ring shadow-sm shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${microscope.isCheckingConnection ? 'animate-spin text-primary' : ''}`} />
                  </button>
                )}

                {((microscope.engineType === 'lmstudio' && microscope.isLmStudioConnected) || microscope.engineType === 'webworker') && microscope.models.length > 0 && (
                  <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-surface-raised border border-emerald-500/30 text-[11px] font-mono shadow-sm">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold hidden sm:inline">Model:</span>
                    <select
                      value={microscope.selectedModel}
                      onChange={(e) => microscope.setSelectedModel(e.target.value)}
                      aria-label="Select model"
                      className="bg-transparent text-emerald-800 dark:text-emerald-300 font-semibold focus:outline-none cursor-pointer max-w-[190px] truncate"
                    >
                      {microscope.models.map((m) => (
                        <option key={m} value={m} className="bg-surface text-text-main">
                          {m.includes('SmolLM') ? 'SmolLM2-135M (Smart)' : m.split('/').pop() || m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Prompt Input & Trigger */}
              <div className="flex-1 max-w-xl flex items-center gap-2 w-full">
                <div className="flex-1 relative min-w-0">
                  <input
                    type="text"
                    value={microscope.prompt}
                    onChange={(e) => microscope.setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && microscope.prompt.trim() && microscope.isConnected && !microscope.isGenerating) {
                        setSelectedInspectStep(null);
                        microscope.startGeneration();
                      }
                    }}
                    disabled={microscope.isGenerating}
                    placeholder="Enter prompt for live next-token prediction..."
                    className="w-full h-9 bg-surface-raised border border-border rounded-xl px-3.5 text-xs font-mono text-text-main placeholder-text-muted/60 focus-ring shadow-inner truncate"
                  />
                </div>

                {microscope.isGenerating ? (
                  <button
                    onClick={microscope.stopGeneration}
                    className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl bg-rose-500 text-white font-mono font-bold text-xs hover:bg-rose-600 transition-all active:scale-95 shadow-[0_0_12px_rgba(244,63,94,0.3)] shrink-0"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedInspectStep(null);
                      microscope.startGeneration();
                    }}
                    disabled={!microscope.prompt.trim() || !microscope.isConnected}
                    className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl bg-primary text-white dark:text-black font-mono font-bold text-xs hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_16px_rgba(5,150,105,0.3)] dark:shadow-[0_0_16px_rgba(16,185,129,0.3)] shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Generate</span>
                  </button>
                )}
              </div>
            </div>

            {/* LM Studio Connection Helper / Web Worker Loading Alert */}
            {microscope.engineType === 'lmstudio' && !microscope.isLmStudioConnected && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
                <div className="flex items-center gap-2 text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    LM Studio is not detected at <code>http://127.0.0.1:1234</code>. Start LM Studio with CORS enabled, or toggle to <strong>Trace Replay</strong> or <strong>In-Browser ONNX</strong> for instant generation!
                  </span>
                </div>
              </div>
            )}

            {microscope.engineType === 'webworker' && microscope.loadingProgress && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
                <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-cyan-600 dark:text-cyan-400" />
                  <span>
                    Loading ONNX model weights into browser: {microscope.loadingProgress.file}{' '}
                    {typeof microscope.loadingProgress.progress === 'number' && !isNaN(microscope.loadingProgress.progress) && microscope.loadingProgress.progress > 0
                      ? `(${microscope.loadingProgress.progress.toFixed(0)}%)`
                      : ''}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Main 2-Column Live Generation Layout */}
          <main className="w-full max-w-7xl flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Left Column: 5-Stage Token Prediction Loop */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <TokenPredictionLoop
                stage={visualizer.stage}
                step={displayedLiveStep}
                promptTokens={microscope.metrics.promptTokens}
                visualizedSteps={visualizer.speed === 'LIVE' ? microscope.steps : visualizer.visualizedSteps}
              />
            </div>

            {/* Right Column: Generated Text View, Playback Controls, Metrics Panel, Raw Event Inspector */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <GeneratedTextView
                steps={visualizer.speed === 'LIVE' ? microscope.steps : visualizer.visualizedSteps}
                currentAnimStep={visualizer.currentAnimStep}
                stage={visualizer.stage}
                selectedStepIndex={selectedInspectStep}
                onStepClick={(idx) => setSelectedInspectStep(idx === selectedInspectStep ? null : idx)}
                showTokenBoundaries={showTokenBoundaries}
                setShowTokenBoundaries={setShowTokenBoundaries}
                isGenerating={microscope.isGenerating || visualizer.queueLength > 0 || visualizer.stage !== 'idle'}
              />

              <PlaybackControls
                isPlaying={visualizer.isPlaying}
                setIsPlaying={visualizer.setIsPlaying}
                speed={visualizer.speed}
                setSpeed={visualizer.setSpeed}
                requestStep={visualizer.requestStep}
                jumpToLive={visualizer.jumpToLive}
                queueLength={visualizer.queueLength}
                isGenerating={microscope.isGenerating}
                baseTime={visualizer.baseTime}
                playbackStatus={visualizer.playbackStatus}
                visualizationDuration={visualizer.visualizationDuration}
                visualizedCount={visualizer.visualizedSteps.length}
                realGenerationDuration={microscope.metrics.totalTime ? microscope.metrics.totalTime / 1000 : 0}
                realTokensReceived={microscope.steps.length}
              />

              <MetricsPanel metrics={microscope.metrics} />

              <RawEventInspector
                events={microscope.events}
                onClear={microscope.clearEvents}
              />
            </div>
          </main>
        </div>
      )}

      {/* First-Visit Onboarding & Field Guide Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
}
