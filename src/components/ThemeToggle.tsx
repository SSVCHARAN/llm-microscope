import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light Theme', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', label: 'Dark Theme', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'System Match', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode selection"
      className="flex items-center p-1 rounded-xl bg-surface-raised border border-border text-xs font-mono shadow-sm"
    >
      {options.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            aria-label={opt.label}
            title={`${opt.label}${opt.value === 'system' ? ` (currently ${resolvedTheme})` : ''}`}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center justify-center p-1.5 sm:px-2 sm:py-1 rounded-lg transition-all focus-ring ${
              isActive
                ? 'bg-primary text-black font-bold shadow-[0_0_12px_rgba(5,150,105,0.3)] dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
            }`}
          >
            {opt.icon}
            <span className="sr-only sm:not-sr-only sm:ml-1.5 text-[11px] hidden md:inline">
              {opt.value === 'light' ? 'Light' : opt.value === 'dark' ? 'Dark' : 'System'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
