'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiMenu, HiX } from 'react-icons/hi';
import { ThemeToggle } from './ThemeToggle';
import type { InfoData } from '@/lib/schema';
import { cn } from '@/lib/utils';

interface HeaderProps {
    nav: InfoData['nav'];
    siteTitle: string;
    allowThemeToggle: boolean;
}

export function Header({ nav, siteTitle, allowThemeToggle }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const enabledItems = nav.items.filter((item) => item.enabled);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-all duration-300',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
                    : 'bg-transparent'
            )}
        >
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
                        {siteTitle.split(' - ')[0]}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {enabledItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}

                        {allowThemeToggle && <ThemeToggle />}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        {allowThemeToggle && <ThemeToggle />}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-border">
                        {enabledItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
}
