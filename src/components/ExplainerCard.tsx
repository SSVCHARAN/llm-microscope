import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { StageDefinition } from '../types';
import { STAGGER } from '../motion/tokens';

interface ExplainerCardProps {
  stage: StageDefinition;
  /** When defined, only shows the first N howItWorks points (progressive reveal during autoplay) */
  visiblePoints?: number;
}

export function ExplainerCard({ stage, visiblePoints }: ExplainerCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const showAll = visiblePoints === undefined;
  const pointsToShow = showAll ? stage.howItWorks : stage.howItWorks.slice(0, visiblePoints);
  const showInsight = showAll || (visiblePoints !== undefined && visiblePoints >= stage.howItWorks.length);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface backdrop-blur-md p-5 shadow-sm dark:shadow-xl font-sans transition-colors duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between cursor-pointer select-none text-left w-full focus-ring rounded-lg py-1"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-text-main">
            Architecture Mechanics &amp; Theory
          </h3>
        </div>
        <div className="text-text-muted hover:text-text-main p-1 rounded transition-colors flex items-center gap-1 text-[11px] font-mono">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 pt-3 border-t border-border-subtle">
          {/* Step points — progressively revealed during autoplay */}
          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {pointsToShow.map((step, idx) => (
                <motion.div
                  key={`${stage.id}-point-${idx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: showAll ? 0 : idx * STAGGER.normal,
                  }}
                  className="text-[13px] leading-relaxed text-text-secondary font-sans flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(5,150,105,0.6)] dark:shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span>{step}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Key insight callout box — shown when all points are revealed */}
          {showInsight && (
            <motion.div
              initial={showAll ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 flex items-start gap-3 mt-1 shadow-sm"
            >
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                  Key Pedagogical Insight
                </span>
                <p className="text-[13px] leading-relaxed text-text-main font-medium">
                  {stage.keyInsight}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
