import React, { ReactNode } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: ReactNode;
  children?: ReactNode;
  icon?: boolean;
}

export function Tooltip({ content, children, icon = true }: TooltipProps) {
  return (
    <div className="group relative inline-flex items-center justify-center cursor-help">
      {children}
      {icon && <Info className="w-3.5 h-3.5 ml-1.5 text-text-muted hover:text-text-main transition-colors" />}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-surface border border-border rounded-md text-xs text-text-main shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-left font-sans font-normal leading-relaxed">
        {content}
        {/* Triangle pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border"></div>
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface"></div>
      </div>
    </div>
  );
}
