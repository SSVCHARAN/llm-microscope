import React, { useRef, useEffect } from 'react';
import { GenerationStep } from '../types';

interface Props {
  steps: GenerationStep[];
  currentAnimStep?: GenerationStep | null;
  stage?: string;
  selectedStepIndex: number | null;
  onStepClick: (index: number) => void;
  showTokenBoundaries: boolean;
  setShowTokenBoundaries: (v: boolean) => void;
  isGenerating: boolean;
}

export function GeneratedTextView({ steps, currentAnimStep, stage, selectedStepIndex, onStepClick, showTokenBoundaries, setShowTokenBoundaries, isGenerating }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Auto-scroll logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isGenerating || !autoScrollRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [steps, isGenerating]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    // If user scrolled up, disable auto-scroll. If they are at the bottom, enable it.
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    autoScrollRef.current = isAtBottom;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col h-full min-h-[400px] max-h-[calc(100vh-120px)]">
      <div className="flex flex-col mb-3 gap-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-main">GENERATED OUTPUT</h3>
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer hover:text-text-main transition-colors">
            <input 
              type="checkbox" 
              checked={showTokenBoundaries} 
              onChange={e => setShowTokenBoundaries(e.target.checked)}
              className="rounded border-border bg-black/40 text-primary focus:ring-primary focus:ring-offset-background"
            />
            Token boundaries
          </label>
        </div>
        {showTokenBoundaries && (
          <div className="text-[10px] text-text-muted/70 italic">
            Each outlined region is one streamed token. Tokens are not necessarily words.
          </div>
        )}
      </div>
      
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 bg-black/40 border border-border/50 rounded p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap relative scroll-smooth"
      >
        {steps.map(step => {
          const isNewline = step.tokenText.includes('\n');
          const displaySpace = showTokenBoundaries && !isNewline && /^\s+$/.test(step.tokenText);
          const displayNewline = showTokenBoundaries && isNewline;
          
          return (
            <span 
              key={step.index}
              onClick={() => onStepClick(step.index)}
              className={`
                relative cursor-pointer transition-colors
                ${showTokenBoundaries ? 'border border-border/60 mx-[1px] px-[1px] rounded-sm' : ''}
                ${selectedStepIndex === step.index ? 'bg-primary/30 text-white border-primary/50' : 'hover:bg-primary/20'}
              `}
              title={`Token ${step.index}: ${step.logProbability.toFixed(2)}`}
            >
              {displayNewline && <span className="absolute right-0 top-0 text-text-muted/30 select-none pointer-events-none text-[10px]">↵</span>}
              {displaySpace && <span className="absolute inset-0 flex items-center justify-center text-text-muted/20 select-none pointer-events-none text-[10px]">·</span>}
              {step.tokenText}
            </span>
          );
        })}
        {currentAnimStep && (stage === 'selection' || stage === 'token' || stage === 'append') && (
          <span 
            key={`anim-${currentAnimStep.index}`}
            className={`
              relative cursor-pointer transition-all duration-300
              ${showTokenBoundaries ? 'border mx-[1px] px-[1px] rounded-sm' : ''}
              bg-primary/20 border-primary/50 text-white animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.3)]
            `}
          >
            {currentAnimStep.tokenText}
          </span>
        )}
        {steps.length === 0 && !currentAnimStep && (
          <span className="text-text-muted italic select-none">Waiting for generation...</span>
        )}
      </div>
    </div>
  );
}
