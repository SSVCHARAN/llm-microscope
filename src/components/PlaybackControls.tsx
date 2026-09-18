import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { PlaybackSpeed, PipelineStage } from '../hooks/usePipelineVisualizer';

interface Props {
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  speed: PlaybackSpeed;
  setSpeed: (s: PlaybackSpeed) => void;
  requestStep: () => void;
  queueLength: number;
  isGenerating: boolean;
  baseTime: number;
  playbackStatus: string;
  visualizationDuration: number;
  visualizedCount: number;
  realGenerationDuration: number; // passed from metrics
  realTokensReceived: number; // passed from rawSteps length
}

export function PlaybackControls({ 
  isPlaying, setIsPlaying, speed, setSpeed, requestStep, 
  queueLength, isGenerating, baseTime, playbackStatus,
  visualizationDuration, visualizedCount, realGenerationDuration, realTokensReceived
}: Props) {
  const speeds: PlaybackSpeed[] = ['0.25x', '0.5x', '1x', '2x', 'LIVE'];

  const getStatusColor = () => {
    if (playbackStatus === 'PAUSED') return 'text-yellow-500 bg-yellow-500/10';
    if (playbackStatus === 'COMPLETE') return 'text-green-500 bg-green-500/10';
    if (playbackStatus === 'CAUGHT UP') return 'text-primary bg-primary/10';
    if (playbackStatus === 'BUFFERING') return 'text-orange-400 bg-orange-400/10';
    return 'text-blue-400 bg-blue-400/10';
  };

  const incomingRate = realGenerationDuration > 0 ? (realTokensReceived / realGenerationDuration) : 0;
  const playbackRate = visualizationDuration > 0 ? (visualizedCount / visualizationDuration) : 0;

  return (
    <div className="bg-surface border border-border/50 rounded-lg p-4 flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <h3 className="font-semibold text-text-main text-[10px] uppercase tracking-wider flex items-center gap-1.5">
          PLAYBACK BUFFER
        </h3>
        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${getStatusColor()}`}>
          {playbackStatus}
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Progress Bars */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[10px] text-text-muted font-mono">
            <span>Incoming</span>
            <span>{realTokensReceived} tokens ({incomingRate.toFixed(1)} t/s)</span>
          </div>
          <div className="h-1.5 w-full bg-black/40 rounded overflow-hidden">
             <div className="h-full bg-primary/40 rounded transition-all duration-300" style={{ width: `${Math.min(100, (realTokensReceived / Math.max(1, realTokensReceived)) * 100)}%` }} />
          </div>
          
          <div className="flex justify-between text-[10px] text-text-muted font-mono mt-1">
            <span>Playback</span>
            <span>{visualizedCount} tokens ({playbackRate.toFixed(1)} t/s)</span>
          </div>
          <div className="h-1.5 w-full bg-black/40 rounded overflow-hidden">
             <div className="h-full bg-primary rounded transition-all duration-300" style={{ width: `${Math.min(100, (visualizedCount / Math.max(1, realTokensReceived)) * 100)}%` }} />
          </div>
        </div>

        {/* Timings */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-black/20 p-2 rounded border border-border/30 flex flex-col">
            <span className="text-[9px] uppercase text-text-muted/70 tracking-wider">Model Time</span>
            <span className="font-mono text-xs">{realGenerationDuration.toFixed(1)}s</span>
          </div>
          <div className="bg-black/20 p-2 rounded border border-border/30 flex flex-col">
            <span className="text-[9px] uppercase text-text-muted/70 tracking-wider">Vis Time</span>
            <span className="font-mono text-xs">{visualizationDuration.toFixed(1)}s</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 items-center justify-between mt-1">
        <div className="flex gap-1 bg-black/40 p-1 rounded border border-border/30">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded transition-colors ${isPlaying ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-text-muted hover:text-text-main'}`}
            title={isPlaying ? "Pause Visualization" : "Play Visualization"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button 
            onClick={requestStep}
            className="p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
            title="Step Forward (1 Phase)"
          >
            <SkipForward size={14} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded border border-border/30 text-[9px] uppercase font-semibold">
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-1 rounded transition-colors ${speed === s ? 'bg-primary/20 text-primary border border-primary/20' : 'text-text-muted hover:text-text-main border border-transparent'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
