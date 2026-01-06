'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme: Theme;
    allowToggle: boolean;
}

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    allowToggle: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme, allowToggle }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Load theme from localStorage if toggle is allowed
        if (allowToggle) {
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                setTheme(savedTheme);
            }
        }
    }, [allowToggle]);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        if (allowToggle) {
            localStorage.setItem('theme', theme);
        }
    }, [theme, mounted, allowToggle]);

    const toggleTheme = () => {
        if (allowToggle) {
            setTheme(theme === 'light' ? 'dark' : 'light');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, allowToggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
