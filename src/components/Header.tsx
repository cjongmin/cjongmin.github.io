'use client';

import { useState, useEffect } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import type { InfoData } from '@/lib/schema';
import { cn } from '@/lib/utils';

interface HeaderProps {
    nav: InfoData['nav'];
    siteTitle: string;
    allowThemeToggle: boolean;
}

export function Header({ nav, siteTitle, allowThemeToggle }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const enabledItems = nav.items.filter((item) => item.enabled);

    const scrollToSection = (href: string) => {
        setIsMobileMenuOpen(false);

        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                const offset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg'
                    : 'bg-transparent'
            )}
        >
            <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo/Site title */}
                    <Link
                        href="/"
                        className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity"
                    >
                        {siteTitle}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {enabledItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={(e) => {
                                    if (item.type === 'anchor') {
                                        e.preventDefault();
                                        scrollToSection(item.href);
                                    }
                                }}
                                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-200 rounded-lg hover:bg-accent/10 group"
                            >
                                {item.label}
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 gradient-bg group-hover:w-3/4 transition-all duration-300" />
                            </a>
                        ))}

                        {/* Theme Toggle */}
                        {allowThemeToggle && (
                            <div className="ml-2">
                                <ThemeToggle />
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center gap-2">
                        {allowThemeToggle && <ThemeToggle />}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <HiX className="h-6 w-6" />
                            ) : (
                                <HiMenu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 glass-card rounded-2xl mt-2 mb-4">
                        <div className="flex flex-col space-y-1 px-2">
                            {enabledItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.type === 'anchor') {
                                            e.preventDefault();
                                            scrollToSection(item.href);
                                        }
                                    }}
                                    className="px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/10 rounded-lg transition-all"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
