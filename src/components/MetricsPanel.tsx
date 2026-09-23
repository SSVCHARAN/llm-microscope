import React from 'react';
import { GenerationMetrics } from '../types';
import { Tooltip } from './Tooltip';
import { Activity, Clock, Zap, Gauge, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  metrics: GenerationMetrics;
}

export function MetricsPanel({ metrics }: Props) {
  const formatTime = (ms: number | null) => (ms !== null ? `${ms.toFixed(0)} ms` : '--');
  const formatNum = (num: number | null, decimals = 1) => (num !== null ? num.toFixed(decimals) : '--');

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between gap-4 font-sans">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-500" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-text-main">
            Performance Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono text-primary-600 dark:text-emerald-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
          Real-Time
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-mono">
        {/* TTFT */}
        <Tooltip content="Time elapsed from sending the request until the very first generated token chunk is received.">
          <div className="text-text-muted hover:text-text-main transition-colors cursor-help border-b border-dotted border-border-strong pb-0.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span>Time to 1st token:</span>
          </div>
        </Tooltip>
        <div className="text-right font-bold text-text-main tabular-nums">
          {formatTime(metrics.timeToFirstToken)}
        </div>

        {/* Tokens / Sec */}
        <Tooltip content="Throughput rate: total completion tokens divided by total generation duration.">
          <div className="text-text-muted hover:text-text-main transition-colors cursor-help border-b border-dotted border-border-strong pb-0.5 flex items-center gap-1.5">
            <Gauge className="w-3 h-3 text-primary-500" />
            <span>Generation speed:</span>
          </div>
        </Tooltip>
        <div className="text-right font-bold text-primary-600 dark:text-emerald-400 tabular-nums">
          {metrics.tokensPerSecond !== null ? `${formatNum(metrics.tokensPerSecond)} t/s` : '--'}
        </div>

        {/* Avg Latency */}
        <Tooltip content="Average interval between consecutive incoming streamed tokens.">
          <div className="text-text-muted hover:text-text-main transition-colors cursor-help border-b border-dotted border-border-strong pb-0.5 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-text-muted" />
            <span>Avg token interval:</span>
          </div>
        </Tooltip>
        <div className="text-right text-text-main tabular-nums">
          {formatTime(metrics.averageLatency)}
        </div>

        {/* Current Latency */}
        <Tooltip content="Time elapsed between the most recent token and the one right before it.">
          <div className="text-text-muted hover:text-text-main transition-colors cursor-help border-b border-dotted border-border-strong pb-0.5 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-text-muted" />
            <span>Current token latency:</span>
          </div>
        </Tooltip>
        <div className="text-right text-text-main tabular-nums">
          {formatTime(metrics.currentLatency)}
        </div>

        {/* Tokens Counts */}
        <div className="text-text-muted flex items-center gap-1.5 pt-1">
          <CheckCircle2 className="w-3 h-3 text-primary-500" />
          <span>Generated tokens:</span>
        </div>
        <div className="text-right font-bold text-text-main tabular-nums pt-1">
          {metrics.generatedTokens}
        </div>

        <div className="text-text-muted flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-text-muted" />
          <span>Prompt tokens:</span>
        </div>
        <div className="text-right text-text-main tabular-nums">
          {metrics.promptTokens !== null ? metrics.promptTokens : '--'}
        </div>

        {/* Total Time */}
        <Tooltip content="Total cumulative elapsed generation time from initiation to stream completion.">
          <div className="text-text-muted hover:text-text-main transition-colors cursor-help border-b border-dotted border-border-strong pb-0.5 flex items-center gap-1.5 pt-1">
            <Clock className="w-3 h-3 text-text-muted" />
            <span>Total elapsed time:</span>
          </div>
        </Tooltip>
        <div className="text-right font-bold text-text-main tabular-nums pt-1">
          {formatTime(metrics.totalTime)}
        </div>
      </div>
    </div>
  );
}
