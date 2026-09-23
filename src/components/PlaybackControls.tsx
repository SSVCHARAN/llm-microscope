import React from 'react';
import { Play, Pause, SkipForward, FastForward, Clock } from 'lucide-react';
import { PlaybackSpeed } from '../hooks/usePipelineVisualizer';

interface Props {
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  speed: PlaybackSpeed;
  setSpeed: (s: PlaybackSpeed) => void;
  requestStep: () => void;
  jumpToLive?: () => void;
  queueLength: number;
  isGenerating: boolean;
  baseTime: number;
  playbackStatus: string;
  visualizationDuration: number;
  visualizedCount: number;
  realGenerationDuration: number;
  realTokensReceived: number;
}

export function PlaybackControls({
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  requestStep,
  jumpToLive,
  queueLength,
  playbackStatus,
  visualizationDuration,
  visualizedCount,
  realGenerationDuration,
  realTokensReceived
}: Props) {
  const speeds: PlaybackSpeed[] = ['0.25x', '0.5x', '1x', '2x', 'LIVE'];

  const getStatusBadge = () => {
    switch (playbackStatus) {
      case 'PAUSED':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'COMPLETE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'CAUGHT UP':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'BUFFERING':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const incomingRate = realGenerationDuration > 0 ? realTokensReceived / realGenerationDuration : 0;
  const playbackRate = visualizationDuration > 0 ? visualizedCount / visualizationDuration : 0;

  const playbackProgress = realTokensReceived > 0 ? Math.min(100, (visualizedCount / realTokensReceived) * 100) : 0;

  return (
    <div className="bg-[#111317] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4 shadow-xl font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <FastForward className="w-4 h-4 text-emerald-400" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
            Playback Buffer Controller
          </h3>
        </div>
        <span className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded border font-semibold ${getStatusBadge()}`}>
          {playbackStatus}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-text-muted font-mono">
            <span>Incoming Model Stream</span>
            <span className="text-white font-medium">{realTokensReceived} tokens ({incomingRate.toFixed(1)} t/s)</span>
          </div>
          <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500/40 rounded-full transition-all duration-300"
              style={{ width: realTokensReceived > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-text-muted font-mono">
            <span>Visualized Loop Progression</span>
            <span className="text-emerald-400 font-bold">{visualizedCount} tokens ({playbackRate.toFixed(1)} t/s)</span>
          </div>
          <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
        </div>

        {/* Timings */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider">Model Compute</span>
            <span className="font-mono text-xs font-bold text-white mt-0.5">{realGenerationDuration.toFixed(1)}s</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider">Visual Pacing</span>
            <span className="font-mono text-xs font-bold text-emerald-400 mt-0.5">{visualizationDuration.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between pt-1 border-t border-white/[0.06]">
        {/* Play/Pause & Step */}
        <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Playback' : 'Resume Playback'}
            className={`p-1.5 rounded-md transition-all active:scale-95 ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'hover:bg-white/10 text-text-muted hover:text-white'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={requestStep}
            aria-label="Step Forward One Pipeline Phase"
            title="Step Forward (1 Phase)"
            className="p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-white transition-all active:scale-95"
          >
            <SkipForward size={14} />
          </button>
          {jumpToLive && queueLength > 0 && (
            <button
              onClick={jumpToLive}
              aria-label="Catch up visualizer to live stream"
              title={`Skip ahead: ${queueLength} queued tokens`}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono hover:bg-emerald-500/20 active:scale-95 transition-all"
            >
              <FastForward size={12} />
              <span>Catch Up ({queueLength})</span>
            </button>
          )}
        </div>

        {/* Speed Selector */}
        <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.08] text-[10px] font-mono font-bold">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={`px-2 py-1 rounded transition-all active:scale-95 ${
                speed === s
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-text-muted hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
