import React from 'react';
import { GenerationMetrics } from '../types';
import { Tooltip } from './Tooltip';
import { Activity, Clock, Zap, Gauge, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  metrics: GenerationMetrics;
}

interface MetricItem {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor?: string;
  tooltip: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export function MetricsPanel({ metrics }: Props) {
  const formatNum = (num: number | null, decimals = 1) => (num !== null ? num.toFixed(decimals) : '--');

  const items: MetricItem[] = [
    {
      id: 'ttft',
      label: 'Time to 1st token',
      icon: Clock,
      tooltip: 'Time elapsed from sending the request until the very first generated token chunk is received.',
      value: metrics.timeToFirstToken !== null ? Math.round(metrics.timeToFirstToken) : '--',
      unit: metrics.timeToFirstToken !== null ? 'ms' : undefined,
    },
    {
      id: 'tps',
      label: 'Generation speed',
      icon: Gauge,
      iconColor: 'text-primary-500',
      tooltip: 'Throughput rate: total completion tokens divided by total generation duration.',
      value: metrics.tokensPerSecond !== null ? formatNum(metrics.tokensPerSecond, 1) : '--',
      unit: metrics.tokensPerSecond !== null ? 't/s' : undefined,
      highlight: true,
    },
    {
      id: 'avg_latency',
      label: 'Avg token interval',
      icon: Zap,
      tooltip: 'Average interval between consecutive incoming streamed tokens.',
      value: metrics.averageLatency !== null ? Math.round(metrics.averageLatency) : '--',
      unit: metrics.averageLatency !== null ? 'ms' : undefined,
    },
    {
      id: 'curr_latency',
      label: 'Current token latency',
      icon: Activity,
      tooltip: 'Time elapsed between the most recent token and the one right before it.',
      value: metrics.currentLatency !== null ? Math.round(metrics.currentLatency) : '--',
      unit: metrics.currentLatency !== null ? 'ms' : undefined,
    },
    {
      id: 'gen_tokens',
      label: 'Generated tokens',
      icon: CheckCircle2,
      iconColor: 'text-primary-500',
      tooltip: 'Total number of completion tokens generated in the current response.',
      value: metrics.generatedTokens,
      unit: 'tokens',
    },
    {
      id: 'prompt_tokens',
      label: 'Prompt tokens',
      icon: FileText,
      tooltip: 'Total number of input tokens in the prompt context window.',
      value: metrics.promptTokens !== null ? metrics.promptTokens : '--',
      unit: metrics.promptTokens !== null ? 'tokens' : undefined,
    },
    {
      id: 'total_time',
      label: 'Total elapsed time',
      icon: Clock,
      tooltip: 'Total cumulative elapsed generation time from initiation to stream completion.',
      value: metrics.totalTime !== null ? Math.round(metrics.totalTime) : '--',
      unit: metrics.totalTime !== null ? 'ms' : undefined,
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
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

      {/* Structured Metrics Table */}
      <div className="flex flex-col divide-y divide-border-subtle/50 text-xs font-mono">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-1.5 px-1 hover:bg-surface-raised/60 rounded-md transition-colors"
          >
            {/* Left: Icon + Label with Tooltip */}
            <Tooltip content={item.tooltip} icon={false}>
              <div className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors cursor-help">
                <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.iconColor || 'text-text-muted'}`} />
                <span className="border-b border-dotted border-border-strong pb-px">
                  {item.label}:
                </span>
              </div>
            </Tooltip>

            {/* Right: Numeric Value + Fixed-Width Unit Column */}
            <div className="flex items-baseline justify-end gap-1.5 tabular-nums">
              <span
                className={`font-bold ${
                  item.highlight
                    ? 'text-primary-600 dark:text-emerald-400 font-extrabold'
                    : 'text-text-main'
                }`}
              >
                {item.value}
              </span>
              <span className="text-[10px] text-text-muted font-normal w-10 text-left shrink-0">
                {item.unit || ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
