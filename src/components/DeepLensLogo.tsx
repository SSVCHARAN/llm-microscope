import React from 'react';

export const DeepLensIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 sm:w-5 sm:h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} relative z-10 transition-transform duration-300 group-hover:scale-105`}
    stroke="currentColor"
    aria-hidden="true"
  >
    {/* Outer reticle / aperture ring */}
    <circle
      cx="12"
      cy="12"
      r="9"
      strokeWidth="1.2"
      className="stroke-emerald-500/40 dark:stroke-emerald-400/30"
      strokeDasharray="2.5 2.5"
    />
    {/* Precision crosshair ticks */}
    <line x1="12" y1="1.5" x2="12" y2="4" strokeWidth="1.5" strokeLinecap="round" className="stroke-emerald-600 dark:stroke-emerald-400" />
    <line x1="12" y1="20" x2="12" y2="22.5" strokeWidth="1.5" strokeLinecap="round" className="stroke-emerald-600 dark:stroke-emerald-400" />
    <line x1="1.5" y1="12" x2="4" y2="12" strokeWidth="1.5" strokeLinecap="round" className="stroke-emerald-600 dark:stroke-emerald-400" />
    <line x1="20" y1="12" x2="22.5" y2="12" strokeWidth="1.5" strokeLinecap="round" className="stroke-emerald-600 dark:stroke-emerald-400" />
    {/* Bi-convex optical lens geometry */}
    <path
      d="M12 4C8 7.5 8 16.5 12 20C16 16.5 16 7.5 12 4Z"
      strokeWidth="1.5"
      className="stroke-emerald-600 dark:stroke-emerald-400 fill-emerald-500/10 dark:fill-emerald-400/15"
      strokeLinejoin="round"
    />
    {/* Internal concentric focal ring */}
    <circle
      cx="12"
      cy="12"
      r="4"
      strokeWidth="1"
      className="stroke-emerald-500/30 dark:stroke-emerald-400/25"
    />
    {/* Core focal point / beam emission */}
    <circle cx="12" cy="12" r="1.75" className="fill-emerald-600 dark:fill-emerald-400" />
  </svg>
);

interface DeepLensBrandProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export const DeepLensBrand: React.FC<DeepLensBrandProps> = ({
  className = '',
  iconSize = 'md',
  showBadge = true,
  showSubtitle = true,
  subtitleText = 'LLM Diagnostics'
}) => {
  const iconContainerSize =
    iconSize === 'sm'
      ? 'w-7 h-7 rounded-lg'
      : iconSize === 'lg'
      ? 'w-10 h-10 rounded-2xl'
      : 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 group select-none ${className}`}>
      {/* Bespoke Optical Lens Badge */}
      <div
        className={`relative ${iconContainerSize} bg-gradient-to-br from-emerald-500/15 via-surface-raised to-emerald-950/20 dark:from-emerald-500/20 dark:via-surface-raised dark:to-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.18)] shrink-0 overflow-hidden transition-all duration-300 group-hover:border-emerald-500/60 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_75%)]" />
        <DeepLensIcon />
      </div>

      {/* Brand Typography */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-[15px] sm:text-[16px] tracking-tight text-text-main font-sans">
            Deep<span className="text-emerald-700 dark:text-emerald-400">Lens</span>
          </span>
          {showBadge && (
            <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 tracking-wider leading-none">
              AI
            </span>
          )}
        </div>

        {showSubtitle && (
          <span className="hidden 2xl:inline-flex items-center h-5 text-[9px] font-mono uppercase tracking-widest text-text-muted/80 pl-2 border-l border-border whitespace-nowrap leading-none">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
