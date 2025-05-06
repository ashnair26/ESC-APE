'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import clsx from 'clsx';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={clsx('flex items-center space-x-2 rounded-full p-1 bg-slate-200 dark:bg-slate-800', className)}>
      <button
        onClick={() => setTheme('light')}
        className={clsx(
          'p-2 rounded-full transition-colors',
          theme === 'light'
            ? 'bg-white text-brand shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        )}
        aria-label="Light mode"
      >
        <Sun className="h-5 w-5" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={clsx(
          'p-2 rounded-full transition-colors',
          theme === 'dark'
            ? 'bg-slate-700 text-brand-light shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-5 w-5" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={clsx(
          'p-2 rounded-full transition-colors',
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-brand dark:text-brand-light shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        )}
        aria-label="System theme"
      >
        <Laptop className="h-5 w-5" />
      </button>
    </div>
  );
}
