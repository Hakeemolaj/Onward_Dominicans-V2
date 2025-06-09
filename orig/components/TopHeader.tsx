
import React from 'react';
import { APP_NAME_PART1, APP_NAME_PART2 } from '../constants';
import ThemeToggleButton from './ThemeToggleButton';

type Theme = 'light' | 'dark';

interface TopHeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-slate-800 py-4 shadow-sm dark:shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-4xl font-extrabold text-yellow-500 dark:text-yellow-400 tracking-tight">
            {APP_NAME_PART1}
          </span>
          <span className="text-4xl font-extrabold text-slate-700 dark:text-slate-200 tracking-tight ml-1">
            {APP_NAME_PART2}
          </span>
        </div>
        <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};

export default TopHeader;