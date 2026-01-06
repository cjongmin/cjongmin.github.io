'use client';

import { HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
    const { theme, toggleTheme, allowToggle } = useTheme();

    if (!allowToggle) return null;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <HiMoon className="h-5 w-5" />
            ) : (
                <HiSun className="h-5 w-5" />
            )}
        </button>
    );
}
