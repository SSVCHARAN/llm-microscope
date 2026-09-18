import React, { useEffect, useState, useMemo } from 'react';
import { GenerationStep } from '../types';
import { PipelineStage } from '../hooks/usePipelineVisualizer';
import { Tooltip } from './Tooltip';
import { HyperText } from './HyperText';
import { motion } from 'framer-motion';

interface Props {
  stage: PipelineStage;
  step: GenerationStep | null;
  promptTokens: number | null;
  visualizedSteps: GenerationStep[];
}

export function TokenPredictionLoop({ stage, step, promptTokens, visualizedSteps }: Props) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (step) setAnimKey(prev => prev + 1);
  }, [step?.index]);

  const formatProb = (p: number) => (p * 100).toFixed(2) + '%';

  // Simplified pipeline stages based on user request: Context -> Model -> Probabilities -> Selection -> Append
  const isContext = stage === 'idle' || stage === 'context';
  const isModel = stage === 'inference' || stage === 'logits';
  
  const isProbAny = stage.startsWith('prob_');
  const isSelect = stage === 'selection' || stage === 'token';
  const isAppend = stage === 'append';

  // Helper to render recent context context
  const renderContext = (includeCurrentStep: boolean) => {
    const recent = visualizedSteps.slice(-5);
    const count = (promptTokens || 0) + visualizedSteps.length - recent.length;
    return (
      <div className="flex flex-wrap items-center justify-center gap-[3px] text-xs font-mono bg-surface p-3 rounded-lg border border-border/40 shadow-sm">
        {count > 0 && (
          <span className="text-text-muted/60 bg-surface/50 px-2 py-1 rounded-md border border-border/20 text-[10px] tracking-wider uppercase mr-1">
            +{count} tokens
          </span>
        )}
        {recent.map((s, i) => (
          <span key={i} className="text-text-main bg-black/30 hover:bg-black/40 transition-colors px-2 py-1 rounded-md border border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {s.tokenText.replace(/\n/g, '↵') || '␣'}
          </span>
        ))}
        {includeCurrentStep && step && (
          <span className="text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/30 animate-pulse shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_8px_rgba(var(--color-primary),0.2)]">
            {step.tokenText.replace(/\n/g, '↵') || '␣'}
          </span>
        )}
      </div>
    );
  };

  const Connector = ({ active, handoff = false }: { active: boolean, handoff?: boolean }) => (
    <div className="flex justify-center py-2 relative">
      <div className={`w-0.5 h-6 transition-colors duration-500 relative overflow-hidden ${active ? 'bg-primary/20' : 'bg-border/30'}`}>
        <div className={`absolute top-0 left-0 w-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.5)] transition-all duration-300 ${active ? 'h-full' : 'h-0'}`} />
        {handoff && (
          <motion.div 
            initial={{ top: -10 }}
            animate={{ top: 24 }}
            transition={{ duration: 0.35, ease: "linear" }}
            className="absolute left-0 w-full h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,1)]"
          />
        )}
      </div>
    </div>
  );

  const getStatusIcon = (isActive: boolean, isPast: boolean, type: 'live' | 'derived' | 'conceptual') => {
    if (isActive) return <span className="text-primary animate-pulse">●</span>;
    if (isPast) return <span className="text-green-500">✓</span>;
    if (type === 'live') return <span className="text-text-muted">○</span>;
    if (type === 'derived') return <span className="text-text-muted">◇</span>;
    return <span className="text-text-muted">□</span>;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-0 shadow-sm relative overflow-hidden min-h-[700px] font-sans">
      
      {/* 1. CONTEXT */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isContext ? 'opacity-100' : 'opacity-60'}`}>
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isContext, !isContext, 'derived')} 
          <span className={isContext ? 'text-text-main' : ''}>1. Context</span>
          <span className="ml-auto text-[9px] text-text-muted/60 lowercase">The model looks at tokens generated so far</span>
        </div>
        <div className={`transition-all duration-500 rounded p-1 ${isContext ? 'bg-primary/5 border border-primary/20' : 'border border-transparent'}`}>
          {renderContext(false)}
        </div>
      </div>

      <Connector active={isModel || isContext} />

      {/* 2. MODEL PROCESSING */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isModel ? 'opacity-100' : 'opacity-60'}`}>
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isModel, isProbAny || isSelect || isAppend, 'conceptual')} 
          <span className={isModel ? 'text-text-main' : ''}>2. Model Processing (Conceptual)</span>
          <span className="ml-auto text-[9px] text-text-muted/60 lowercase">Educational approximation</span>
        </div>
        <div className="bg-surface/50 border border-border/40 rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden shadow-sm">
           <div className={`flex flex-col items-center gap-3 transition-all duration-700 ${isModel ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
             
             {/* Context Vector representation */}
             <div className="flex items-center justify-between w-full max-w-[280px]">
                <div className={`text-[10px] font-mono tracking-widest uppercase ${isModel ? 'text-primary' : 'text-text-muted'}`}>Embeddings</div>
                <div className="flex gap-[2px]">
                   {[...Array(12)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-4 rounded-[1px] transition-colors duration-500 ${isModel ? 'bg-primary/40' : 'bg-border/30'}`} />
                   ))}
                </div>
             </div>
             
             {/* Attention / MLP layers */}
             <div className={`w-full max-w-[280px] border rounded-md p-3 text-center flex flex-col gap-2 transition-all duration-500 ${isModel && stage === 'inference' ? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-border/30 bg-black/20'}`}>
                <div className={`text-[10px] font-mono tracking-widest uppercase ${isModel && stage === 'inference' ? 'text-purple-300' : 'text-text-muted'}`}>Transformer Block</div>
                <div className="flex justify-center gap-[3px]">
                   {/* Mini attention heads representation */}
                   {[...Array(6)].map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm transition-colors duration-300 ${isModel && stage === 'inference' ? 'bg-purple-400/40 animate-pulse' : 'bg-border/30'}`} style={{ animationDelay: `${i * 100}ms` }} />
                   ))}
                </div>
             </div>

             {/* Logits output representation */}
             <div className="flex items-center justify-between w-full max-w-[280px]">
                <div className={`text-[10px] font-mono tracking-widest uppercase ${isModel && stage === 'logits' ? 'text-blue-300' : 'text-text-muted'}`}>Vocab Logits</div>
                <div className="flex gap-[2px] items-end h-5">
                   {[4, 2, 8, 3, 5, 1, 10, 2, 6, 4].map((h, i) => (
                      <div key={i} className={`w-1.5 rounded-[1px] transition-all duration-500 ${isModel && stage === 'logits' ? 'bg-blue-400/60 animate-pulse' : 'bg-border/30'}`} style={{ height: `${h * 10}%`, animationDelay: `${i * 50}ms` }} />
                   ))}
                </div>
             </div>
             
           </div>
        </div>
      </div>

      <Connector active={isProbAny || isModel} />

      {/* 3. NEXT TOKEN PROBABILITIES */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isProbAny || isSelect || isAppend ? 'opacity-100' : 'opacity-40'}`}>
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isProbAny, isSelect || isAppend, 'live')} 
          <span className={isProbAny ? 'text-text-main' : ''}>3. Next Token Probabilities (Live Data)</span>
          <span className="ml-auto text-[9px] text-text-muted/60 lowercase">Probabilities assigned to possible next tokens</span>
        </div>
        
        <div className="w-full bg-surface border border-border/40 rounded-lg p-3 relative shadow-sm">
          {!step ? (
            <div className="text-center text-xs text-text-muted py-4">Waiting for generation...</div>
          ) : (
            <div className="flex flex-col gap-1.5 relative">
              <div className="grid grid-cols-12 text-[9px] text-text-muted uppercase tracking-widest border-b border-border/30 pb-1 px-1 mb-1">
                <div className="col-span-3">Token</div>
                <div className="col-span-2 text-right">Prob</div>
                <div className="col-span-2 text-right">Log Prob</div>
                <div className="col-span-5 pl-4">Distribution</div>
              </div>
              
              {(() => {
                // Calculate visual ordering dynamically
                const raw = [...step.alternatives];
                
                // If it's the reorder/handoff stage, or selection stage, ensure winner is at the top
                if (stage === 'prob_reorder' || stage === 'prob_handoff' || isSelect || isAppend) {
                   const winnerIndex = raw.findIndex(a => a.token === step.tokenText);
                   if (winnerIndex > 0) {
                     const winner = raw.splice(winnerIndex, 1)[0];
                     raw.unshift(winner);
                   }
                }

                return (
                  <div className="flex flex-col gap-1.5 relative">
                    {raw.map((alt, i) => {
                      const isSelected = alt.token === step.tokenText;
                      const isWinnerFinal = isSelected && (isSelect || isAppend);
                      const isWinnerProb = isSelected && (stage === 'prob_identify' || stage === 'prob_reorder' || stage === 'prob_handoff');
                      const isRevealPulse = stage === 'prob_reveal';
                      
                      let rowClasses = 'border border-transparent';
                      if (isWinnerFinal) {
                        rowClasses = 'bg-primary/10 border-primary/20';
                      } else if (isWinnerProb) {
                        rowClasses = 'bg-green-500/10 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]';
                      } else if ((isSelect || isAppend) && !isSelected) {
                        rowClasses = 'border-transparent opacity-30';
                      } else if (isRevealPulse) {
                        rowClasses = 'border-transparent bg-white/5';
                      }

                      return (
                        <motion.div 
                          layout
                          initial={false}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          key={alt.token} 
                          className={`grid grid-cols-12 items-center text-xs font-mono px-1 py-1 rounded transition-colors duration-300 border ${rowClasses}`}
                        >
                          <div className="col-span-3 truncate pl-1 relative">
                             <span className={`px-1.5 py-0.5 rounded transition-colors duration-500 ${isWinnerFinal ? 'bg-primary/20 text-blue-300' : 'bg-black/40 text-text-main'}`}>
                               {alt.token.replace(/\n/g, '↵') || ' '}
                             </span>
                          </div>
                          <div className={`col-span-2 text-right transition-colors duration-500 ${isWinnerFinal ? 'text-blue-300 font-bold' : (isRevealPulse ? 'text-white' : 'text-text-main')}`}>
                            {formatProb(alt.probability)}
                          </div>
                          <div className={`col-span-2 text-right text-[10px] transition-colors duration-500 ${isRevealPulse ? 'text-text-muted/90' : 'text-text-muted'}`}>
                            {alt.logProbability.toFixed(2)}
                          </div>
                          <div className="col-span-5 pl-4 pr-1">
                            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${(isWinnerFinal || isWinnerProb) ? (isWinnerProb ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)]') : (isRevealPulse ? 'bg-text-muted' : 'bg-text-muted/60')}`}
                                style={{ width: (isProbAny || isSelect || isAppend) ? `${Math.max(1, alt.probability * 100)}%` : '0%' }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <Connector active={isSelect || isProbAny} handoff={stage === 'prob_handoff'} />

      {/* 4. TOKEN SELECTION */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isSelect || isAppend ? 'opacity-100' : 'opacity-40'}`}>
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isSelect, isAppend, 'derived')} 
          <span className={isSelect ? 'text-text-main' : ''}>4. Token Selection</span>
          <span className="ml-auto text-[9px] text-text-muted/60 lowercase">The token that was actually chosen</span>
        </div>
        
        <div className={`p-5 rounded-lg border transition-all duration-500 flex items-center justify-between ${isSelect ? 'bg-surface border-primary/40 shadow-[0_0_20px_rgba(var(--color-primary),0.1)]' : 'bg-surface/50 border-border/40 shadow-sm'}`}>
           <div className="flex items-center gap-4">
             <div className="flex flex-col items-start gap-1">
               {step && (
                 <div className="text-[9px] text-primary/80 uppercase tracking-widest font-mono">
                   <HyperText key={`label-${step.index}`} duration={400} className="font-mono font-normal">
                     {`TOKEN #${step.index}`}
                   </HyperText>
                 </div>
               )}
               <div className={`text-xl font-mono px-3 py-1 rounded transition-colors duration-300 ${isSelect || isAppend ? 'bg-black/40 text-text-main border border-border/50 min-w-[3rem] text-center' : 'text-text-muted/50 bg-black/20'}`}>
                 {(isSelect || isAppend) && step ? (
                   <HyperText key={`val-${step.index}`} duration={600} className="font-mono font-normal inline-block">
                     {step.tokenText.replace(/\n/g, '↵') || '␣'}
                   </HyperText>
                 ) : (
                   <span className="text-sm italic">predicting...</span>
                 )}
               </div>
             </div>
             {(isSelect || isAppend) && step && (
               <div className="flex flex-col text-xs font-mono text-text-muted">
                 <span>Prob: {formatProb(step.probability)}</span>
                 <span>Rank: #{step.rank}</span>
               </div>
             )}
           </div>
           {(isSelect || isAppend) && step && step.rank > 1 && (
             <div className="text-xs text-yellow-400/80 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
               Selected by sampling
             </div>
           )}
        </div>
      </div>

      <Connector active={isAppend || isSelect} />

      {/* 5. ADD TO CONTEXT */}
      <div className={`flex flex-col z-10 transition-all duration-500 ${isAppend ? 'opacity-100' : 'opacity-40'}`}>
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-semibold flex items-center gap-2 mb-2">
          {getStatusIcon(isAppend, false, 'derived')} 
          <span className={isAppend ? 'text-text-main' : ''}>5. Add to Context</span>
          <span className="ml-auto text-[9px] text-text-muted/60 lowercase">Selected token is incorporated into context</span>
        </div>
        <div className={`transition-all duration-500 rounded-lg p-2 ${isAppend ? 'bg-surface border border-primary/30 shadow-[0_0_15px_rgba(var(--color-primary),0.05)]' : 'border border-transparent'}`}>
          {isAppend ? renderContext(true) : renderContext(false)}
        </div>
      </div>

    </div>
  );
}
