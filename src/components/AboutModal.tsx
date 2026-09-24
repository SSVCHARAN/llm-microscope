import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { DeepLensIcon } from './DeepLensLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'llm_microscope_onboarding_dismissed';

const STAGES = [
  {
    step: '01',
    name: 'Tokenization',
    tag: 'Raw String → Token IDs',
    desc: 'Cuts raw text into subwords and whitespace tokens, mapping each to an integer ID from the vocabulary.',
  },
  {
    step: '02',
    name: 'Embedding & Positional Encoding',
    tag: 'IDs → Continuous Vectors',
    desc: 'Looks up 768-dimensional coordinate vectors from W_E and injects positional order encodings.',
  },
  {
    step: '03',
    name: 'QKV Projections',
    tag: 'Vector Projections (x · W)',
    desc: 'Multiplies vectors by projection matrices to derive Queries (search), Keys (tags), and Values (payload).',
  },
  {
    step: '04',
    name: 'Attention Heatmap & Causal Masking',
    tag: 'Softmax(Q · Kᵀ / √d)',
    desc: 'Calculates dot-product alignment between tokens, applying a causal mask to prevent peeking into future tokens.',
  },
  {
    step: '05',
    name: 'Feed-Forward Network (MLP)',
    tag: 'GELU Gating 4× Expansion',
    desc: 'Expands dimensions through a 4× layer with non-linear GELU activation to recall factual associations.',
  },
  {
    step: '06',
    name: 'Logits & Softmax',
    tag: 'Hidden Space → Vocab Probabilities',
    desc: 'Projects the final vector across vocabulary columns; Softmax normalizes raw scores into calibrated percentages.',
  },
  {
    step: '07',
    name: 'Sampling & Autoregressive Decode',
    tag: 'Temperature, Top-K & Top-P',
    desc: 'Applies temperature, Top-K, and nucleus (Top-P) probability bounds, then draws the winning next token.',
  },
];

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
}) => {
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
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-surface-raised to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)]" />
                <DeepLensIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    id="about-modal-title"
                    className="flex items-baseline gap-1 font-bold text-[15px] sm:text-[17px] tracking-tight text-text-main font-sans truncate"
                  >
                    <span>Deep<span className="text-emerald-700 dark:text-emerald-400">Lens</span></span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 tracking-wider leading-none">
                      AI
                    </span>
                  </h2>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    The 7 Stages
                  </span>
                </div>
                <p className="text-[11px] sm:text-[12px] text-text-muted truncate">
                  A single autoregressive token generation step unpacked across 7 physical transformations
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

          {/* Modal Content: Briefly show the 7 stages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 text-text-secondary text-[13px] leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
              {STAGES.map((s, idx) => (
                <div
                  key={s.step}
                  className={`p-3.5 rounded-xl border border-border bg-surface-raised/70 hover:border-emerald-500/30 transition-all shadow-sm flex flex-col justify-between gap-2 ${
                    idx === 6 ? 'sm:col-span-2 sm:flex-row sm:items-center' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      {s.step}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-text-main font-semibold text-[13px]">
                        {s.name}
                      </span>
                      <span className="text-text-muted font-sans text-[12px] leading-relaxed mt-0.5">
                        {s.desc}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border-subtle text-emerald-700 dark:text-emerald-400 shrink-0 self-start sm:self-auto font-mono">
                    {s.tag}
                  </span>
                </div>
              ))}
            </div>
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

            {/* Start Exploring Action */}
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
