import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microscope,
  BookOpen,
  Layers,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Sliders,
  Cpu,
  Compass,
  Sparkles,
  Network
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'overview' | 'journey' | 'fidelity' | 'modes' | 'caveats';

const STORAGE_KEY = 'llm_microscope_onboarding_dismissed';

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabKey;
      if (['overview', 'journey', 'fidelity', 'modes', 'caveats'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'overview';
  });
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  // Sync initial checkbox state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      setDontShowAgain(saved === 'true');
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      if (dontShowAgain) {
        localStorage.setItem(STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    onClose();
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-colors"
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ y: 8 }}
          animate={{ y: 0 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-white dark:bg-[#111317] text-text-main shadow-2xl overflow-hidden font-sans transition-colors duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border bg-surface-raised/60 shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary text-white dark:text-black flex items-center justify-center shadow-[0_0_16px_rgba(5,150,105,0.35)] shrink-0">
                <Microscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    id="about-modal-title"
                    className="font-mono text-[14px] sm:text-[16px] font-bold tracking-tight text-text-main truncate"
                  >
                    LLM Microscope
                  </h2>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Field Guide &amp; Architecture Manual
                  </span>
                </div>
                <p className="text-[11px] sm:text-[12px] text-text-muted truncate">
                  Before you begin: what this instrument shows, how to explore it, and scientific caveats
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Close guide"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs Header */}
          <div className="flex items-center px-4 sm:px-7 border-b border-border-subtle bg-surface-raised/20 overflow-x-auto custom-scrollbar shrink-0 gap-1 pt-1.5">
            {[
              { id: 'overview', label: '1. Overview & Goals', icon: Compass },
              { id: 'journey', label: '2. The 7 Stages', icon: Layers },
              { id: 'fidelity', label: '3. Real vs. Simplified', icon: CheckCircle2 },
              { id: 'modes', label: '4. Inference Modes', icon: Zap },
              { id: 'caveats', label: '5. Limitations & Tips', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabKey)}
                  className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-lg font-mono text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-all border-b-2 -mb-[1px] focus-ring ${
                    isActive
                      ? 'border-primary text-emerald-700 dark:text-emerald-400 bg-surface'
                      : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Modal Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-6 text-text-secondary text-[13px] leading-relaxed">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Hero mission */}
                <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-mono text-[12px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>What is LLM Microscope?</span>
                  </div>
                  <p className="text-text-main text-[13px] sm:text-[14px] leading-relaxed">
                    LLM Microscope is an open-source, interactive diagnostic instrument designed to make the internal mechanics of autoregressive Transformer models tangible. Rather than treating large language models as magic black boxes, this instrument unpacks the exact linear algebra, dimensional routing, non-linear activations, and probability distributions that occur during a single token generation step.
                  </p>
                </div>

                {/* Key Learning Objectives */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-mono text-[12px] uppercase tracking-wider font-bold text-text-main flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>What You Will Learn Across the Pipeline</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1.5 shadow-sm">
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        1. Continuous Representation
                      </span>
                      <p className="text-[12px] text-text-muted leading-relaxed">
                        How discrete characters are mapped into continuous vector geometry where semantic meaning corresponds to mathematical distance.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1.5 shadow-sm">
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        2. Dynamic Context Routing
                      </span>
                      <p className="text-[12px] text-text-muted leading-relaxed">
                        How Multi-Head Self-Attention matches Queries to Keys to retrieve relevant past words and synthesize context.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1.5 shadow-sm">
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        3. Factual &amp; Non-Linear Activation
                      </span>
                      <p className="text-[12px] text-text-muted leading-relaxed">
                        How Feed-Forward layers use GELU activation gates to silence noise, amplify features, and project factual memories.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1.5 shadow-sm">
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        4. Probabilistic Sampling Decisions
                      </span>
                      <p className="text-[12px] text-text-muted leading-relaxed">
                        How unnormalized logits are transformed via Softmax, temperature, Top-K, and Top-P to pick the next emitted word.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Honest Time Estimates */}
                <div className="p-4 rounded-xl border border-border bg-surface-raised/60 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-text-main font-mono text-[12px] font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Realistic Exploration Time Estimates</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                    <div className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[13px]">~3 Minutes</span>
                      <span className="text-text-main font-semibold">Educational Autoplay</span>
                      <span className="text-text-muted text-[10px]">Hands-free tour cycling all 7 stages and focal highlights automatically.</span>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[13px]">~8–12 Minutes</span>
                      <span className="text-text-main font-semibold">Full Deep-Dive</span>
                      <span className="text-text-muted text-[10px]">Self-paced exploration: inspecting attention cells, tuning temperature, and testing token projections.</span>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[13px]">1–2 Minutes / Run</span>
                      <span className="text-text-main font-semibold">Live Generation Loop</span>
                      <span className="text-text-muted text-[10px]">Streaming your own prompts with real-time candidate probability trees.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: THE 7 STAGES */}
            {activeTab === 'journey' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-[12px] uppercase tracking-wider font-bold text-text-main flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>The 7-Stage Architectural Walkthrough</span>
                  </h3>
                  <p className="text-[12px] text-text-muted">
                    In the Architecture Deep-Dive mode, you follow the prompt <code className="text-text-main bg-surface-raised px-1 py-0.5 rounded border border-border-subtle font-mono">"The cat sat on the"</code> through the 7 physical transformations that predict the next token:
                  </p>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  {[
                    {
                      step: '01',
                      name: 'Tokenization (Byte-Pair Encoding)',
                      tag: 'Raw String → Token IDs',
                      desc: 'The tokenizer cuts raw English into subwords and whitespace tokens, mapping each to an integer ID in the 50,257 GPT-2 vocabulary (e.g., " The" = 464, " cat" = 3797).'
                    },
                    {
                      step: '02',
                      name: 'Embedding Lookup & Positional Encodings',
                      tag: 'Token IDs → Continuous Vectors',
                      desc: 'Token IDs look up 768-dimensional coordinate vectors from W_E. Because Transformers have no inherent sequential direction, sinusoidal positional vectors are added to inject word order.'
                    },
                    {
                      step: '03',
                      name: 'Self-Attention: Q, K, V Projections',
                      tag: 'Vector Multiplication (x · W)',
                      desc: 'Each token is multiplied by three projection matrices (W_Q, W_K, W_V) to derive Query (search questions), Key (index matching tags), and Value (semantic payload to transmit).'
                    },
                    {
                      step: '04',
                      name: 'Attention Heatmap & Causal Masking',
                      tag: 'Softmax(Q · K^T / √d)',
                      desc: 'Measures dot-product similarity between tokens. A Causal Mask forces future tokens to -∞ so the model cannot cheat. Softmax normalizes weights to 100% across each row.'
                    },
                    {
                      step: '05',
                      name: 'Feed-Forward Network (MLP)',
                      tag: 'GELU Gating & Knowledge Retrieval',
                      desc: 'Processes the mixed attention context through a 4× dimension expansion layer. The non-linear GELU activation silences noise (<0) and passes positive features to refine the internal thought.'
                    },
                    {
                      step: '06',
                      name: 'Unembedding, Logits & Softmax',
                      tag: 'Hidden Space → Vocabulary Logits',
                      desc: 'Multiplies the terminal thought vector against the 50,257 word columns of W_U. Softmax converts raw unbounded scores into calibrated percentages, with an interactive Temperature slider (T).'
                    },
                    {
                      step: '07',
                      name: 'Sampling & Autoregressive Decision',
                      tag: 'Temperature, Top-K, Top-P (Nucleus)',
                      desc: 'Demonstrates sampling mechanics: Greedy Argmax (K=1), Top-K filtering, and Top-P (Nucleus) probability mass cutoff, followed by the categorical draw that selects the winning next token.'
                    }
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0 text-[10px]">
                          {s.step}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-text-main font-semibold text-[12px]">{s.name}</span>
                          <span className="text-text-muted font-sans text-[12px] leading-relaxed mt-0.5">{s.desc}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border-subtle text-emerald-700 dark:text-emerald-400 self-start sm:self-center shrink-0">
                        {s.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 3: REAL VS SIMPLIFIED */}
            {activeTab === 'fidelity' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-[12px] uppercase tracking-wider font-bold text-text-main flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Scientific Fidelity: What is Real vs. Simplified</span>
                  </h3>
                  <p className="text-[12px] text-text-muted">
                    We maintain strict technical honesty regarding what data comes directly from real neural networks versus what is pedagogically simplified for visual comprehensibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real Parts */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-mono text-[12px] font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Real Model &amp; Inference Data</span>
                    </div>
                    <ul className="space-y-2 text-[12px] text-text-secondary leading-relaxed list-disc list-inside">
                      <li>
                        <strong>Real Tokenization:</strong> Uses the actual GPT-2 Byte-Pair Encoding (BPE) vocabulary of 50,257 integer IDs and token prefix conventions.
                      </li>
                      <li>
                        <strong>In-Browser ONNX Neural Network:</strong> The Web Worker engine runs a genuine 124-million parameter model (<code className="font-mono text-[11px] bg-surface px-1 py-0.5 rounded border border-border-subtle">LaMini-GPT-124M</code>) via Transformers.js in WebAssembly SIMD.
                      </li>
                      <li>
                        <strong>LM Studio Live Streaming:</strong> Connects to your local inference server (<code className="font-mono text-[11px] bg-surface px-1 py-0.5 rounded border border-border-subtle">localhost:1234</code>) over SSE, retrieving actual model tokens, log-probabilities, top-5 candidates, and latency telemetry.
                      </li>
                      <li>
                        <strong>Exact Mathematical Equations:</strong> Softmax, Scaled Dot-Product Attention, Causal Masking, GELU gating, and Top-K/Top-P formulas are implemented without numerical approximations.
                      </li>
                    </ul>
                  </div>

                  {/* Simplified Parts */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] dark:bg-amber-500/[0.06] flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-mono text-[12px] font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Pedagogical Simplifications</span>
                    </div>
                    <ul className="space-y-2 text-[12px] text-text-secondary leading-relaxed list-disc list-inside">
                      <li>
                        <strong>Dimensionality Truncation (d=4 vs d=768):</strong> Full GPT-2 uses 768 dimensions per token (modern models use 4,096+). Displaying 768 simultaneous floating-point numbers would be visual noise; we display 4 representative coordinate dimensions.
                      </li>
                      <li>
                        <strong>Single Representative Block:</strong> Real GPT-2 cascades through 12 consecutive transformer blocks. Stage 1–7 illustrates a single representative forward block pass to make the mechanics clear without 12× redundancy.
                      </li>
                      <li>
                        <strong>Calibrated Weight Matrices:</strong> The 4×4 weight matrices ($W_Q, W_K, W_V, W_U$) shown in the walkthrough use calibrated representative values rather than downloading 500MB of raw weight tensors.
                      </li>
                      <li>
                        <strong>Linear 2D Projection:</strong> Attention heatmaps and vector coordinates represent high-dimensional geometric manifolds projected into 2D screens.
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: MODES */}
            {activeTab === 'modes' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-[12px] uppercase tracking-wider font-bold text-text-main flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Understanding the Two Primary Operating Modes</span>
                  </h3>
                  <p className="text-[12px] text-text-muted">
                    Toggle between modes at any time using the center switch in the top navigation bar.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mode 1 */}
                  <div className="p-4 rounded-xl border border-border bg-surface-raised flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>1. Architecture Deep-Dive</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        White-Box Dissection
                      </span>
                    </div>
                    <p className="text-[12px] text-text-muted leading-relaxed">
                      A curated, step-by-step walkthrough of a single forward pass. Designed for learning the physics of Transformers.
                    </p>
                    <div className="space-y-1.5 font-mono text-[11px] pt-1 border-t border-border-subtle">
                      <div className="text-text-main font-semibold">Features:</div>
                      <div className="text-text-muted">✓ Step through all 7 stages manually</div>
                      <div className="text-text-muted">✓ Interactive Attention Head selector (12 heads)</div>
                      <div className="text-text-muted">✓ Live Temperature slider (T = 0.1 to 2.0)</div>
                      <div className="text-text-muted">✓ Educational Autoplay with progressive focal reveal</div>
                    </div>
                  </div>

                  {/* Mode 2 */}
                  <div className="p-4 rounded-xl border border-border bg-surface-raised flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>2. Live Generation Loop</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-bold">
                        Observability Telemetry
                      </span>
                    </div>
                    <p className="text-[12px] text-text-muted leading-relaxed">
                      Real-time streaming generation instrument. Inspect competing candidate tokens, logits, and hardware telemetry as words are predicted.
                    </p>
                    <div className="space-y-1.5 font-mono text-[11px] pt-1 border-t border-border-subtle">
                      <div className="text-text-main font-semibold">3 Engine Choices:</div>
                      <div className="text-text-muted"><strong>✈️ Trace:</strong> Instant, zero-setup recorded real run.</div>
                      <div className="text-text-muted"><strong>🧠 ONNX:</strong> Real client-side WebWorker neural net.</div>
                      <div className="text-text-muted"><strong>🔌 LM Studio:</strong> Connects to localhost:1234.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: CAVEATS & TIPS */}
            {activeTab === 'caveats' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-[12px] uppercase tracking-wider font-bold text-text-main flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Important Limitations &amp; Visual Interpretation</span>
                  </h3>
                  <p className="text-[12px] text-text-muted">
                    Keep these technical caveats in mind when analyzing neural network visualizations:
                  </p>
                </div>

                <div className="space-y-3 font-sans text-[12px] leading-relaxed">
                  <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1 shadow-sm">
                    <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      1. Attention Weights Are Not Conscious "Thinking"
                    </span>
                    <p className="text-text-muted">
                      A high attention score (e.g. 74% between "sat" and "cat") indicates statistical dot-product alignment between vector representations, not conscious intent, belief, or human-like understanding.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1 shadow-sm">
                    <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      2. Subword Token Boundaries Matter
                    </span>
                    <p className="text-text-muted">
                      Language models do not read full English words. The space before a word is part of the token (represented visually with <code className="font-mono text-[11px] bg-surface px-1 py-0.5 rounded border border-border-subtle">_cat</code>). Changing spacing, capitalization, or punctuation creates completely distinct token IDs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1 shadow-sm">
                    <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      3. LM Studio Local API Boundaries
                    </span>
                    <p className="text-text-muted">
                      When connecting to LM Studio, standard OpenAI-compatible endpoints expose generated text, chunk tokens, and top log-probabilities. They do not expose intermediate layer activations or weight tensors due to API boundaries.
                    </p>
                  </div>
                </div>

                {/* Starting recommendation */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] flex items-start gap-3">
                  <Compass className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[12px] font-bold text-text-main">
                      Recommended First-Time Path:
                    </span>
                    <p className="text-[12px] text-text-secondary leading-relaxed">
                      Begin in <strong>Stage 1 (Tokenization)</strong>, click through stages 1 to 7 using the top stepper, and try clicking on cells in Stage 4 (Attention Map) to inspect specific token connections. Once finished with the walkthrough, jump into the <strong>Live Generation Loop</strong> to test your own prompts!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="px-5 sm:px-7 py-3.5 border-t border-border bg-surface-raised/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Don't show again toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-text-muted hover:text-text-main font-mono">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary accent-emerald-500 focus-ring cursor-pointer"
              />
              <span>Don't show this again on this device</span>
            </label>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">

              <button
                type="button"
                onClick={handleDismiss}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white dark:text-black text-[12px] font-mono font-bold hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all active:scale-[0.98] focus-ring"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
