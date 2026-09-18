import React, { useState } from 'react';
import { ApiEvent } from '../types';

export function RawEventInspector({ events }: { events: ApiEvent[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-surface hover:bg-border/30 transition-colors text-left"
      >
        <h3 className="font-semibold text-text-main text-sm flex items-center gap-2">
          Raw Event Inspector
          <span className="bg-border text-text-muted px-2 py-0.5 rounded-full text-xs font-mono">
            {events.length}
          </span>
        </h3>
        <span className="text-text-muted text-xs">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-border bg-black/40 h-64 overflow-y-auto space-y-2">
          {events.length === 0 && (
            <div className="text-text-muted text-sm italic">No events recorded.</div>
          )}
          {events.map(ev => (
            <div key={ev.id} className="text-xs font-mono border-l-2 border-primary/50 pl-3 py-1">
              <div className="flex gap-3 text-text-muted mb-1">
                <span>{new Date(ev.timestamp).toISOString().split('T')[1]}</span>
                <span className="text-primary/80">{ev.type}</span>
              </div>
              <pre className="text-text-main whitespace-pre-wrap break-all">
                {typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
