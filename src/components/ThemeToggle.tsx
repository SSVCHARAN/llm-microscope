import React from 'react';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme}
      onThemeChange={setTheme}
      className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-raised border border-border text-text-muted hover:text-text-main hover:bg-surface-subtle transition-all duration-200 focus-ring shadow-sm shrink-0 [&_svg]:w-4 [&_svg]:h-4 cursor-pointer"
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    />
  );
};

export { AnimatedThemeToggler };
export default ThemeToggle;
