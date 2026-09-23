import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Binary, Layers, Hash, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { TokenItem } from '../../types';

interface TokenizationStageProps {
  tokens: TokenItem[];
  rawPrompt: string;
}

export const TokenizationStage: React.FC<TokenizationStageProps> = ({ tokens, rawPrompt }) => {
  const [selectedToken, setSelectedToken] = useState<TokenItem>(tokens[1]); // "cat"
  const [comparisonExample, setComparisonExample] = useState<'case' | 'space' | 'rare'>('space');

  const getTokenColorClass = (color: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
      case 'rose':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
      default:
        return 'bg-white/10 text-white border-white/20 hover:bg-white/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Visual Token Stream */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-white font-bold">
              Subword BPE Chunks & Vocabulary IDs
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Click any token chunk to inspect internal representation
          </span>
        </div>

        {/* Tokens Container */}
        <div className="flex flex-wrap items-center gap-3 py-4" role="group" aria-label="Tokenized prompt sequence">
          {tokens.map((t, idx) => {
            const isSelected = selectedToken.id === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedToken(t)}
                aria-pressed={isSelected}
                aria-label={`Token ${idx}: "${t.display}", ID ${t.id}`}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all focus-ring cursor-pointer ${getTokenColorClass(
                  t.color
                )} ${
                  isSelected ? 'ring-2 ring-white border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10' : ''
                }`}
              >
                <span className="font-mono text-[17px] font-bold tracking-tight whitespace-pre-wrap">
                  {t.display}
                </span>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[10px] font-mono font-semibold">
                  <Hash className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{t.id}</span>
                </div>

                <span className="text-[10px] font-mono text-white/70">
                  pos: {idx}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Array representation */}
        <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-black/80 border border-white/[0.06] font-mono text-[12px]">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            Raw Input Array Sent To Model Embedding Layer:
          </span>
          <div className="text-emerald-400 font-bold overflow-x-auto select-all pt-0.5">
            input_ids = [{tokens.map((t) => t.id).join(', ')}]
          </div>
        </div>
      </div>

      {/* Deep Dive Inspector Card for Selected Token */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-white/[0.08] bg-[#111317] shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
            Selected Token Chunk
          </span>
          <span className="text-2xl font-mono font-bold text-white whitespace-pre-wrap">
            "{selectedToken.display}"
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            Vocabulary Pointer: Token ID #{selectedToken.id}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-white/[0.08] bg-[#111317] shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
            Whitespace Boundary Encoding
          </span>
          <p className="text-[12px] leading-relaxed text-text-secondary">
            {selectedToken.text.startsWith(' ') ? (
              <span>
                Begins with a leading space (<code className="text-emerald-400 font-mono">␣</code>). In GPT tokenizers, words preceded by a space have completely different IDs than words at the beginning of a line!
              </span>
            ) : (
              <span>
                No leading whitespace. This token either starts the sequence or connects directly to preceding punctuation.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-white/[0.08] bg-[#111317] shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
            Vocabulary Matrix Space
          </span>
          <div className="flex items-center gap-2 text-white font-mono text-[14px] font-bold">
            <Binary className="w-4 h-4 text-emerald-400" />
            <span>50,257 Total Token Vocabulary</span>
          </div>
          <span className="text-[11px] text-text-muted leading-relaxed">
            Each ID is a row index into the model's 50,257 × 768 Embedding Matrix (Stage 2).
          </span>
        </div>
      </div>

      {/* Interactive BPE Quirk Demonstrator */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-emerald-500/20 bg-black/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-white font-bold">
              BPE Tokenizer Quirks: Why Space & Casing Matter
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <button
              onClick={() => setComparisonExample('space')}
              className={`px-2 py-1 rounded transition-all ${
                comparisonExample === 'space'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Leading Space
            </button>
            <button
              onClick={() => setComparisonExample('case')}
              className={`px-2 py-1 rounded transition-all ${
                comparisonExample === 'case'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Capitalization
            </button>
            <button
              onClick={() => setComparisonExample('rare')}
              className={`px-2 py-1 rounded transition-all ${
                comparisonExample === 'rare'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Subword Splitting
            </button>
          </div>
        </div>

        {comparisonExample === 'space' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-white font-bold">"the"</span> (start of sentence, no space)
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ID #1169
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-white font-bold">" the"</span> (preceded by space)
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                ID #262
              </span>
            </div>
          </div>
        )}

        {comparisonExample === 'case' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-white font-bold">"The"</span> (TitleCase)
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                ID #464
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-white font-bold">"THE"</span> (ALL-CAPS)
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                ID #850
              </span>
            </div>
          </div>
        )}

        {comparisonExample === 'rare' && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1.5 text-xs font-mono pt-1">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Uncommon word:</span>
              <span className="text-white font-bold">"unbelievable"</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Splits into 3 subwords!</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">
                "un" (#705)
              </span>
              <span>+</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">
                "believ" (#33842)
              </span>
              <span>+</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">
                "able" (#1495)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
