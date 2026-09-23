import React, { useState, useMemo } from 'react';
import { ApiEvent } from '../types';
import { Terminal, ChevronDown, ChevronUp, Copy, Check, Trash2, Filter } from 'lucide-react';

interface Props {
  events: ApiEvent[];
  onClear?: () => void;
}

export function RawEventInspector({ events, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const eventTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.type));
    return ['all', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter((e) => e.type === filterType);
  }, [events, filterType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy', e);
    }
  };

  const getBadgeColor = (type: string) => {
    if (type.includes('error')) return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    if (type.includes('chunk')) return 'bg-primary-500/15 text-emerald-800 dark:text-emerald-300 border-primary-500/30';
    if (type.includes('usage') || type.includes('complete')) return 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30';
    return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm dark:shadow-xl font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between p-4 bg-transparent hover:bg-surface-raised transition-colors text-left w-full focus-ring cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-primary-500" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-text-main">
            Raw SSE & Engine Event Inspector
          </h3>
          <span className="bg-primary-500/10 text-primary-600 dark:text-emerald-400 border border-primary-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
            {events.length} frames
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
          <span>{isOpen ? 'Collapse' : 'Expand Stream Log'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col border-t border-border-subtle bg-surface-raised">
          {/* Action & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-border-subtle bg-surface-subtle">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
              <Filter className="w-3.5 h-3.5 text-text-muted shrink-0 mr-1" />
              {eventTypes.slice(0, 6).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-0.5 rounded-md border transition-all ${
                    filterType === type
                      ? 'bg-primary-500/20 text-emerald-800 dark:text-emerald-300 border-primary-500/40 font-bold'
                      : 'bg-surface text-text-muted border-border hover:text-text-main'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Copy and Clear */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                aria-label="Copy All Events JSON"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface-raised text-text-muted hover:text-text-main text-[10px] font-mono border border-border transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-primary-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              {onClear && (
                <button
                  onClick={onClear}
                  aria-label="Clear Event History"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Event Stream List */}
          <div className="p-4 h-72 overflow-y-auto space-y-2.5 scrollbar-hide font-mono bg-surface-raised">
            {filteredEvents.length === 0 ? (
              <div className="text-text-muted text-xs italic py-8 text-center">
                No events recorded. Start generation or send a prompt to stream raw SSE frames.
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="text-xs border-l-2 border-primary-500/50 pl-3 py-1 bg-surface/60 rounded-r hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-[10px] text-text-muted mb-1">
                    <span>{new Date(ev.timestamp).toISOString().split('T')[1].replace('Z', '')}</span>
                    <span className={`px-1.5 py-0.2 rounded border font-semibold ${getBadgeColor(ev.type)}`}>
                      {ev.type}
                    </span>
                  </div>
                  <pre className="text-text-main text-[11px] whitespace-pre-wrap break-all leading-tight">
                    {typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
