/**
 * Utilities for the researcher profile website
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * CRITICAL: Add basePath to all static asset paths for GitHub Pages compatibility
 * Use this for ALL images, PDFs, and other static assets
 */
export function withBasePath(path: string): string {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Return with basePath prepended
    return `${basePath}${normalizedPath}`;
}

/**
 * Generate URL-safe slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Highlight author name in author list
 */
export function highlightAuthor(
    authorsList: string[],
    nameVariants: string[],
    style: 'bold' | 'underline' | 'highlight'
): { author: string; isHighlighted: boolean }[] {
    return authorsList.map((author) => {
        const isHighlighted = nameVariants.some((variant) =>
            author.toLowerCase().includes(variant.toLowerCase())
        );
        return { author, isHighlighted };
    });
}

/**
 * Parse author string to array
 */
export function parseAuthors(authors: string | string[]): string[] {
    if (Array.isArray(authors)) {
        return authors;
    }

    // Split by common delimiters: comma, semicolon, "and"
    return authors
        .split(/,|;|\band\b/i)
        .map((author) => author.trim())
        .filter((author) => author.length > 0);
}

/**
 * Format date range for experience
 */
export function formatDateRange(start: string, end: string): string {
    const formatDate = (dateStr: string) => {
        if (dateStr.toLowerCase() === 'present') return 'Present';
        const [year, month] = dateStr.split('-');
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return month ? `${monthNames[parseInt(month) - 1]} ${year}` : year;
    };

    return `${formatDate(start)} – ${formatDate(end)}`;
}

/**
 * Sort comparator functions
 */
export const sortComparators = {
    yearDesc: (a: { year: number }, b: { year: number }) => b.year - a.year,
    yearAsc: (a: { year: number }, b: { year: number }) => a.year - b.year,
    titleAZ: (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title),
};

/**
 * Group publications by year
 */
export function groupByYear<T extends { year: number }>(items: T[]): Map<number, T[]> {
    const grouped = new Map<number, T[]>();

    items.forEach((item) => {
        const existing = grouped.get(item.year) || [];
        grouped.set(item.year, [...existing, item]);
    });

    return grouped;
}
