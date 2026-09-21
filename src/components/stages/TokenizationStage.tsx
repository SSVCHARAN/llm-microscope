import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Binary, Layers, Hash } from 'lucide-react';
import { TokenItem } from '../../types';

interface TokenizationStageProps {
  tokens: TokenItem[];
  rawPrompt: string;
}

export const TokenizationStage: React.FC<TokenizationStageProps> = ({ tokens, rawPrompt }) => {
  const [selectedToken, setSelectedToken] = useState<TokenItem>(tokens[1]); // "cat"

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
    <div className="flex flex-col gap-6 w-full">
      {/* Visual Token Stream */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Subword BPE Chunks & Vocabulary IDs
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#888]">
            Click any token to inspect
          </span>
        </div>

        {/* Tokens Container */}
        <div className="flex flex-wrap items-center gap-3 py-4">
          {tokens.map((t, idx) => {
            const isSelected = selectedToken.id === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedToken(t)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${getTokenColorClass(
                  t.color
                )} ${
                  isSelected ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''
                }`}
              >
                <span className="font-mono text-[16px] font-bold tracking-tight whitespace-pre-wrap">
                  {t.display}
                </span>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono">
                  <Hash className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{t.id}</span>
                </div>

                <span className="text-[9px] font-mono text-white/50">
                  pos: {idx}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Array representation */}
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-black/80 border border-white/[0.06] font-mono text-[12px]">
          <span className="text-[10px] text-[#777] uppercase tracking-wider">
            Raw Input Array Sent To Model:
          </span>
          <div className="text-emerald-400 overflow-x-auto select-all">
            input_ids = [{tokens.map((t) => t.id).join(', ')}]
          </div>
        </div>
      </div>

      {/* Deep Dive Inspector Card for Selected Token */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#111111]/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#888]">
            Selected Chunk
          </span>
          <span className="text-2xl font-mono font-bold text-white whitespace-pre-wrap">
            "{selectedToken.display}"
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Internal Representation: Token ID #{selectedToken.id}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#111111]/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#888]">
            Whitespace Encoding
          </span>
          <p className="text-[12px] leading-relaxed text-[#EDEDED]">
            {selectedToken.text.startsWith(' ') ? (
              <span>
                Begins with a space (<code className="text-emerald-400">␣</code>). In GPT tokenizers, words preceded by a space have completely different IDs than words at the start of a sentence!
              </span>
            ) : (
              <span>
                No leading whitespace. This token either starts the sequence or connects directly to punctuation.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#111111]/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#888]">
            Vocabulary Space
          </span>
          <div className="flex items-center gap-2 text-white font-mono text-[14px]">
            <Binary className="w-4 h-4 text-emerald-400" />
            <span>50,257 Total Vocab</span>
          </div>
          <span className="text-[11px] text-[#A0A0A0] leading-snug">
            Each ID is a pointer into the 50,257-row Embedding Matrix.
          </span>
        </div>
      </div>
    </div>
  );
};
