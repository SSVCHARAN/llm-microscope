import React from 'react';
import { GenerationMetrics } from '../types';
import { Tooltip } from './Tooltip';

export function MetricsPanel({ metrics }: { metrics: GenerationMetrics }) {
  const formatTime = (ms: number | null) => ms !== null ? `${ms.toFixed(0)} ms` : '--';
  const formatNum = (num: number | null, decimals = 2) => num !== null ? num.toFixed(decimals) : '--';
  
  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3 text-sm flex flex-col justify-between">
      <h3 className="font-semibold text-text-main mb-2">Metrics</h3>
      <div className="grid grid-cols-2 gap-2">
        <Tooltip content="Time from request initiation until the first generated token arrives.">
          <div className="text-text-muted cursor-help border-b border-dotted border-text-muted/40 pb-0.5">Time to first token:</div>
        </Tooltip>
        <div className="text-right text-text-main">{formatTime(metrics.timeToFirstToken)}</div>
        
        <Tooltip content="Generated tokens divided by generation time.">
          <div className="text-text-muted cursor-help border-b border-dotted border-text-muted/40 pb-0.5">Tokens / sec:</div>
        </Tooltip>
        <div className="text-right text-text-main">{formatNum(metrics.tokensPerSecond)}</div>
        
        <Tooltip content="Average interval between received generated tokens.">
          <div className="text-text-muted cursor-help border-b border-dotted border-text-muted/40 pb-0.5">Avg latency:</div>
        </Tooltip>
        <div className="text-right text-text-main">{formatTime(metrics.averageLatency)}</div>
        
        <Tooltip content="Latency is the time between receiving this token and the previous generation event. It is not the model's internal computation time.">
          <div className="text-text-muted cursor-help border-b border-dotted border-text-muted/40 pb-0.5">Current latency:</div>
        </Tooltip>
        <div className="text-right text-text-main">{formatTime(metrics.currentLatency)}</div>
        
        <div className="text-text-muted">Generated tokens:</div>
        <div className="text-right text-text-main">{metrics.generatedTokens}</div>
        
        <div className="text-text-muted">Prompt tokens:</div>
        <div className="text-right text-text-main">{metrics.promptTokens !== null ? metrics.promptTokens : '--'}</div>
        
        <Tooltip content="Total elapsed generation time.">
          <div className="text-text-muted cursor-help border-b border-dotted border-text-muted/40 pb-0.5">Total time:</div>
        </Tooltip>
        <div className="text-right text-text-main">{formatTime(metrics.totalTime)}</div>
      </div>
    </div>
  );
}
