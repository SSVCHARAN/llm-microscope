import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Binary,
  Layers,
  Hash,
  Sparkles,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Database,
  SlidersHorizontal
} from 'lucide-react';
import { TokenItem } from '../../types';

interface TokenizationStageProps {
  tokens: TokenItem[];
  rawPrompt: string;
  phase?: number;
}

export const TokenizationStage: React.FC<TokenizationStageProps> = ({
  tokens,
  rawPrompt,
  phase
}) => {
  const [selectedToken, setSelectedToken] = useState<TokenItem>(tokens[1]); // " cat"
  const [comparisonExample, setComparisonExample] = useState<'case' | 'space' | 'rare'>('space');

  // Educational Autoplay sequence
  useEffect(() => {
    if (phase === undefined) return;
    const t1 = setTimeout(() => {
      setSelectedToken(tokens[1]); // inspect " cat"
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
      {/* ========================================================================= */}
      {/* 1. PRIMARY VISUALIZATION: THE TOKENIZATION PIPELINE */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm dark:shadow-2xl transition-colors duration-200">
        {/* Pipeline Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
              Tokenization Pipeline: Text to Token IDs
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Click any token below to inspect its details
          </span>
        </div>

        {/* Step 1A: Raw String & BPE Boundary Slicing */}
        <div className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-xl bg-surface-raised border border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Step 1: Subword Slicing (Byte-Pair Encoding)
            </span>
          </div>

          {/* Interactive BPE Slicing Track */}
          <div className="flex items-center flex-wrap gap-1.5 py-2.5 px-3.5 rounded-lg bg-surface border border-border font-mono text-sm sm:text-base shadow-inner overflow-x-auto">
            <span className="text-text-muted text-[11px] uppercase tracking-wider font-sans shrink-0 mr-1 font-semibold">
              Raw String:
            </span>
            {tokens.map((t, idx) => (
              <React.Fragment key={t.id}>
                {idx > 0 && (
                  <div
                    className="w-[2px] h-6 bg-emerald-500 dark:bg-emerald-400 mx-1 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.6)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0"
                    title={`BPE Cut between "${tokens[idx - 1].display}" and "${t.display}"`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setSelectedToken(t)}
                  className={`px-2 py-0.5 rounded font-bold transition-all focus-ring text-sm ${
                    selectedToken.id === t.id
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500 shadow-sm'
                      : 'text-text-main hover:text-primary hover:bg-surface-subtle'
                  }`}
                >
                  {t.display}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted pt-0.5">
            <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Green vertical cuts mark BPE boundaries. Notice the whitespace marker (
              <code className="text-emerald-700 dark:text-emerald-400 bg-surface px-1 py-0.5 rounded border border-border-subtle font-mono">
                ␣
              </code>
              ) prefixed to words preceded by spaces.
            </span>
          </div>
        </div>

        {/* Downward Pipeline Flow Connector */}
        <div className="flex items-center justify-center -my-1 text-text-muted gap-2">
          <div className="h-px bg-border flex-1 max-w-[120px]" />
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-raised border border-border text-[10px] font-mono uppercase tracking-wider text-text-muted shadow-sm">
            <ArrowDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Maps Each Subword to Vocabulary ID</span>
          </div>
          <div className="h-px bg-border flex-1 max-w-[120px]" />
        </div>

        {/* Step 1B: Discrete Vocabulary Token Sequence */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className="font-semibold text-text-main uppercase tracking-wider text-[10px]">
              Step 2: Token Sequence ({tokens.length} tokens detected)
            </span>
            <span className="text-text-muted text-[10px]">
              Active Token: <strong className="text-emerald-700 dark:text-emerald-400">"{selectedToken.display}"</strong> (pos {tokens.findIndex(t => t.id === selectedToken.id)})
            </span>
          </div>

          {/* 5-Column Responsive Structured Token Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            role="group"
            aria-label="Tokenized prompt sequence"
          >
            {tokens.map((t, idx) => {
              const isSelected = selectedToken.id === t.id;
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  initial={phase !== undefined ? { opacity: 0, scale: 0.9, y: 8 } : false}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                    delay: phase !== undefined ? idx * 0.06 : 0
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedToken(t)}
                  aria-pressed={isSelected}
                  aria-label={`Token ${idx}: "${t.display}", ID ${t.id}`}
                  className={`w-full flex flex-col items-center justify-between p-3.5 rounded-xl border transition-all focus-ring text-left cursor-pointer min-h-[105px] relative ${getTokenColorClass(
                    t.color
                  )} ${idx === tokens.length - 1 && tokens.length % 2 !== 0 ? 'col-span-2 sm:col-span-1' : ''} ${
                    isSelected
                      ? 'ring-2 ring-emerald-600 dark:ring-white border-emerald-600 dark:border-white shadow-[0_0_20px_rgba(5,150,105,0.25)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10'
                      : 'shadow-sm'
                  }`}
                >
                  {/* Top card row: Position & Selection Dot */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-text-dim">
                    <span className="font-semibold">pos: {idx}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  {/* Token display representation */}
                  <div className="py-1 text-center w-full">
                    <span className="font-mono text-lg sm:text-xl font-bold tracking-tight whitespace-pre-wrap break-all block">
                      {t.display}
                    </span>
                  </div>

                  {/* Bottom card row: Vocabulary Hash ID */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-mono font-semibold shadow-xs">
                    <Hash className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t.id}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SUPPORTING VISUALIZATION & DETAILS: 2-COLUMN BALANCED DESKTOP GRID */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (7 cols): Selected Token Deep Dive Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
                Token Deep Dive: "{selectedToken.display}"
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Vocabulary ID #{selectedToken.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {/* Box 1: Whitespace Encoding Analysis */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-raised border border-border-subtle">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-bold">
                Whitespace Prefix Encoding
              </span>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                {selectedToken.text.startsWith(' ') ? (
                  <span>
                    Begins with a leading space (
                    <code className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">␣</code>
                    ). In GPT BPE, words preceded by a space have completely different IDs than words at the start of a sentence or line.
                  </span>
                ) : (
                  <span>
                    No leading whitespace. This token either starts the sequence or connects directly to preceding punctuation without a space.
                  </span>
                )}
              </p>
            </div>

            {/* Box 2: Vocabulary Embedding Space Pointer */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-raised border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-bold">
                  Embedding Table Pointer
                </span>
                <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400">
                  Row {selectedToken.id}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-main font-mono text-[13px] font-bold pt-0.5">
                <Binary className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>50,257 Total Token Vocabulary</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                ID <code className="text-text-main font-bold">#{selectedToken.id}</code> acts as a row index into the model's 50,257 × 768 embedding lookup table in Stage 2.
              </p>
            </div>
          </div>

          {/* Quick Context Summary */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-border text-[11px] font-mono text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Sequence index: <strong>Position {tokens.findIndex(t => t.id === selectedToken.id)}</strong> of {tokens.length - 1} | Byte length: {new TextEncoder().encode(selectedToken.text).length} bytes
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive BPE Quirks Demonstrator */}
        <div className="lg:col-span-5 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
                BPE Quirks: Space &amp; Casing
              </span>
            </div>

            {/* Quirk Tabs */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setComparisonExample('space')}
                className={`px-2 py-1 rounded transition-all focus-ring ${
                  comparisonExample === 'space'
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                Space
              </button>
              <button
                type="button"
                onClick={() => setComparisonExample('case')}
                className={`px-2 py-1 rounded transition-all focus-ring ${
                  comparisonExample === 'case'
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                Casing
              </button>
              <button
                type="button"
                onClick={() => setComparisonExample('rare')}
                className={`px-2 py-1 rounded transition-all focus-ring ${
                  comparisonExample === 'rare'
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                Subwords
              </button>
            </div>
          </div>

          {/* Comparison Panels */}
          <div className="flex-1 flex flex-col justify-center">
            {comparisonExample === 'space' && (
              <div className="flex flex-col gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-text-main font-bold">"the"</span> (no leading space)
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                    ID #1169
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-text-main font-bold">" the"</span> (preceded by space)
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-bold text-[11px]">
                    ID #262
                  </span>
                </div>
                <span className="text-[11px] text-text-muted pt-1">
                  Because of the leading space, these are treated as completely distinct entities in vocabulary space.
                </span>
              </div>
            )}

            {comparisonExample === 'case' && (
              <div className="flex flex-col gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-text-main font-bold">"The"</span> (TitleCase)
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold text-[11px]">
                    ID #464
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-text-main font-bold">"THE"</span> (ALL-CAPS)
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold text-[11px]">
                    ID #850
                  </span>
                </div>
                <span className="text-[11px] text-text-muted pt-1">
                  Case matters! Capitalized and lowercase tokens have non-overlapping vocabulary rows.
                </span>
              </div>
            )}

            {comparisonExample === 'rare' && (
              <div className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle flex flex-col gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Uncommon word:</span>
                  <span className="text-text-main font-bold">"unbelievable"</span>
                  <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">3 Subwords</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
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
                <span className="text-[11px] text-text-muted">
                  Rare words decompose cleanly into frequent syllables rather than throwing Out-Of-Vocabulary errors.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RESULT / OUTPUT: STAGE 1 OUTPUT TENSOR ARRAY */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-surface p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-text-main font-bold">
              Stage 1 Output: Token ID Vector (input_ids)
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {tokens.length} token IDs
          </span>
        </div>

        {/* Formatted Array with Synced Highlights */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-raised border border-border-subtle font-mono text-[12px]">
          <div className="flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            <span>Model Input Array:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono">
              Ready for Stage 2 (Embedding)
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-sm sm:text-base font-bold py-1 overflow-x-auto select-all">
            <span className="text-text-muted">input_ids = [</span>
            {tokens.map((t, idx) => {
              const isSelected = selectedToken.id === t.id;
              return (
                <span
                  key={t.id}
                  onClick={() => setSelectedToken(t)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary text-white dark:text-black shadow-sm ring-1 ring-primary'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-surface hover:text-text-main'
                  }`}
                  title={`Token ${idx}: "${t.display}" -> ID ${t.id}`}
                >
                  {t.id}
                  {idx < tokens.length - 1 ? ',' : ''}
                </span>
              );
            })}
            <span className="text-text-muted">]</span>
          </div>
        </div>

        {/* Narrative Handoff Bridge */}
        <div className="flex items-start gap-2.5 text-[12px] text-text-secondary leading-relaxed pt-1">
          <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>What happens next:</strong> In <strong>Stage 2 (Embedding)</strong>, each of these {tokens.length} integers acts as a row selector into the model's 50,257 × 768 matrix, retrieving a 768-dimensional coordinate vector before self-attention begins.
          </span>
        </div>
      </section>
    </div>
  );
};
