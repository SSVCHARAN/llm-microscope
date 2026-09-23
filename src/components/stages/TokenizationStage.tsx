import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Binary, Layers, Hash, Sparkles, ArrowRight } from 'lucide-react';
import { TokenItem } from '../../types';

interface TokenizationStageProps {
  tokens: TokenItem[];
  rawPrompt: string;
  phase?: number;
}

export const TokenizationStage: React.FC<TokenizationStageProps> = ({ tokens, rawPrompt, phase }) => {
  const [selectedToken, setSelectedToken] = useState<TokenItem>(tokens[1]); // "cat"
  const [comparisonExample, setComparisonExample] = useState<'case' | 'space' | 'rare'>('space');

  // Educational Autoplay sequence
  useEffect(() => {
    if (phase === undefined) return;
    const t1 = setTimeout(() => {
      setSelectedToken(tokens[1]); // inspect "cat"
      setComparisonExample('space');
    }, 400);
    const t2 = setTimeout(() => {
      setSelectedToken(tokens[4]); // inspect terminal " the"
      setComparisonExample('case');
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, tokens]);

  const getTokenColorClass = (color: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 dark:border-indigo-500/40 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30';
      case 'emerald':
        return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30';
      case 'cyan':
        return 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/30 dark:border-cyan-500/40 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30';
      case 'amber':
        return 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40 hover:bg-amber-500/20 dark:hover:bg-amber-500/30';
      case 'rose':
        return 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40 hover:bg-rose-500/20 dark:hover:bg-rose-500/30';
      default:
        return 'bg-surface-raised text-text-main border-border hover:bg-surface-subtle';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Visual Token Stream */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm dark:shadow-2xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
              Subword BPE Chunks & Vocabulary IDs
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Click any token chunk to inspect internal representation
          </span>
        </div>

        {/* Educational Splitting Visualization: Raw text to BPE Slices */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-raised border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1. BPE Byte-Pair Tokenization Slicing
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Greedy longest-matching subwords
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 py-2 px-3 rounded-lg bg-surface border border-border font-mono text-base shadow-inner">
            <span className="text-text-muted text-[11px] uppercase tracking-wider font-sans mr-2">Raw String:</span>
            {tokens.map((t, idx) => (
              <React.Fragment key={t.id}>
                {idx > 0 && (
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: 0.15 + idx * 0.1, duration: 0.3 }}
                    className="w-[2px] h-6 bg-emerald-500 dark:bg-emerald-400 mx-1 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.6)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    title="BPE Token Boundary Cut"
                  />
                )}
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    selectedToken.id === t.id
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'text-text-main hover:text-primary'
                  }`}
                  onClick={() => setSelectedToken(t)}
                >
                  {t.display}
                </motion.span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
            <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Slices text into discrete vocabulary tokens. Notice the leading whitespace symbol <code className="text-emerald-700 dark:text-emerald-400 bg-surface-subtle px-1 py-0.2 rounded border border-border-subtle">␣</code> attached to words!</span>
          </div>
        </div>

        {/* Tokens Container */}
        <div className="flex flex-wrap items-center gap-3 py-3" role="group" aria-label="Tokenized prompt sequence">
          {tokens.map((t, idx) => {
            const isSelected = selectedToken.id === t.id;
            return (
              <motion.button
                key={t.id}
                initial={phase !== undefined ? { opacity: 0, scale: 0.85, y: 8 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 25,
                  delay: phase !== undefined ? idx * 0.08 : 0
                }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedToken(t)}
                aria-pressed={isSelected}
                aria-label={`Token ${idx}: "${t.display}", ID ${t.id}`}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all focus-ring cursor-pointer ${getTokenColorClass(
                  t.color
                )} ${
                  isSelected ? 'ring-2 ring-emerald-600 dark:ring-white border-emerald-600 dark:border-white shadow-[0_0_20px_rgba(5,150,105,0.25)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10' : ''
                }`}
              >
                <span className="font-mono text-[17px] font-bold tracking-tight whitespace-pre-wrap">
                  {t.display}
                </span>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-mono font-semibold">
                  <Hash className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.id}</span>
                </div>

                <span className="text-[10px] font-mono text-text-dim">
                  pos: {idx}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Array representation */}
        <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-raised border border-border-subtle font-mono text-[12px]">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            Raw Input Array Sent To Model Embedding Layer:
          </span>
          <div className="text-emerald-700 dark:text-emerald-400 font-bold overflow-x-auto select-all pt-0.5">
            input_ids = [{tokens.map((t) => t.id).join(', ')}]
          </div>
        </div>
      </div>

      {/* Deep Dive Inspector Card for Selected Token */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-border bg-surface shadow-sm dark:shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
            Selected Token Chunk
          </span>
          <span className="text-2xl font-mono font-bold text-text-main whitespace-pre-wrap">
            "{selectedToken.display}"
          </span>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
            Vocabulary Pointer: Token ID #{selectedToken.id}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-border bg-surface shadow-sm dark:shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
            Whitespace Boundary Encoding
          </span>
          <p className="text-[12px] leading-relaxed text-text-secondary">
            {selectedToken.text.startsWith(' ') ? (
              <span>
                Begins with a leading space (<code className="text-emerald-700 dark:text-emerald-400 font-mono">␣</code>). In GPT tokenizers, words preceded by a space have completely different IDs than words at the beginning of a line!
              </span>
            ) : (
              <span>
                No leading whitespace. This token either starts the sequence or connects directly to preceding punctuation.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-border bg-surface shadow-sm dark:shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
            Vocabulary Matrix Space
          </span>
          <div className="flex items-center gap-2 text-text-main font-mono text-[14px] font-bold">
            <Binary className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>50,257 Total Token Vocabulary</span>
          </div>
          <span className="text-[11px] text-text-muted leading-relaxed">
            Each ID is a row index into the model's 50,257 × 768 Embedding Matrix (Stage 2).
          </span>
        </div>
      </div>

      {/* Interactive BPE Quirk Demonstrator */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-surface shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
              BPE Tokenizer Quirks: Why Space & Casing Matter
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <button
              onClick={() => setComparisonExample('space')}
              className={`px-2 py-1 rounded transition-all ${
                comparisonExample === 'space'
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Leading Space
            </button>
            <button
              onClick={() => setComparisonExample('case')}
              className={`px-2 py-1 rounded transition-all ${
                comparisonExample === 'case'
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Capitalization
            </button>
            <button
              onClick={() => setComparisonExample('rare')}
              className={`px-2 py-1 rounded transition-all ${
                comparisonExample === 'rare'
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Subword Splitting
            </button>
          </div>
        </div>

        {comparisonExample === 'space' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-text-main font-bold">"the"</span> (start of sentence, no space)
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                ID #1169
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-text-main font-bold">" the"</span> (preceded by space)
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-bold">
                ID #262
              </span>
            </div>
          </div>
        )}

        {comparisonExample === 'case' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-text-main font-bold">"The"</span> (TitleCase)
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                ID #464
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-text-main font-bold">"THE"</span> (ALL-CAPS)
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold">
                ID #850
              </span>
            </div>
          </div>
        )}

        {comparisonExample === 'rare' && (
          <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle flex flex-col gap-1.5 text-xs font-mono pt-1">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Uncommon word:</span>
              <span className="text-text-main font-bold">"unbelievable"</span>
              <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Splits into 3 subwords!</span>
            </div>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-main">
                "un" (#705)
              </span>
              <span>+</span>
              <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-main">
                "believ" (#33842)
              </span>
              <span>+</span>
              <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-main">
                "able" (#1495)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
