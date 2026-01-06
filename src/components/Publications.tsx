'use client';

import { useState, useMemo } from 'react';
import { HiSearch, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import type { InfoData, Publication } from '@/lib/schema';
import { groupByYear, highlightAuthor } from '@/lib/utils';
import { PublicationCard } from './PublicationCard';
import { cn } from '@/lib/utils';

interface PublicationsProps {
    publications: NonNullable<InfoData['publications']>;
}

export function Publications({ publications }: PublicationsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYears, setSelectedYears] = useState<number[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showFeatured, setShowFeatured] = useState(false);
    const [sortBy, setSortBy] = useState(publications.settings.defaultSort);
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

    const { items, settings } = publications;

    // Initialize expanded years (show most recent N years by default if collapse is enabled)
    useMemo(() => {
        if (settings.collapseYears?.enabled && expandedYears.size === 0) {
            const years = [...new Set(items.map(p => p.year))].sort((a, b) => b - a);
            const yearsToExpand = years.slice(0, settings.collapseYears.expandedYearsCount || 2);
            setExpandedYears(new Set(yearsToExpand));
        }
    }, [items, settings.collapseYears, expandedYears.size]);

    // Get unique years and types
    const allYears = useMemo(
        () => [...new Set(items.map((p) => p.year))].sort((a, b) => b - a),
        [items]
    );
    const allTypes = useMemo(
        () => [...new Set(items.map((p) => p.type))],
        [items]
    );

    // Filter publications
    const filteredPubs = useMemo(() => {
        let filtered = items;

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((pub) => {
                const searchFields = [
                    pub.title,
                    pub.authorsList?.join(' ') || '',
                    pub.venue.name,
                    pub.venue.short || '',
                    ...(pub.keywords || []),
                ].join(' ').toLowerCase();

                return searchFields.includes(query);
            });
        }

        // Year filter
        if (selectedYears.length > 0) {
            filtered = filtered.filter((pub) => selectedYears.includes(pub.year));
        }

        // Type filter
        if (selectedTypes.length > 0) {
            filtered = filtered.filter((pub) => selectedTypes.includes(pub.type));
        }

        // Featured filter
        if (showFeatured) {
            filtered = filtered.filter((pub) => pub.featured);
        }

        // Sort
        if (sortBy === 'year_desc') {
            filtered = filtered.sort((a, b) => {
                if (b.year !== a.year) return b.year - a.year;
                if (b.month && a.month) return b.month - a.month;
                return 0;
            });
        } else if (sortBy === 'year_asc') {
            filtered = filtered.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                if (a.month && b.month) return a.month - b.month;
                return 0;
            });
        } else if (sortBy === 'title_az') {
            filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
    }, [items, searchQuery, selectedYears, selectedTypes, showFeatured, sortBy]);

    // Group by year
    const groupedPubs = useMemo(() => {
        return groupByYear(filteredPubs);
    }, [filteredPubs]);

    const toggleYear = (year: number) => {
        setSelectedYears((prev) =>
            prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
        );
    };

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedYears([]);
        setSelectedTypes([]);
        setShowFeatured(false);
    };

    const toggleYearExpanded = (year: number) => {
        setExpandedYears((prev) => {
            const next = new Set(prev);
            if (next.has(year)) {
                next.delete(year);
            } else {
                next.add(year);
            }
            return next;
        });
    };

    const hasActiveFilters = searchQuery || selectedYears.length > 0 || selectedTypes.length > 0 || showFeatured;

    return (
        <section id="publications" className="py-16 bg-accent/30">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-8">Publications</h2>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search titles, authors, venues, keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                                aria-label="Clear search"
                            >
                                <HiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Year filter */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Year:</span>
                            {allYears.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => toggleYear(year)}
                                    className={cn(
                                        'px-3 py-1 rounded-md text-sm transition-colors',
                                        selectedYears.includes(year)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary hover:bg-secondary/80'
                                    )}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>

                        {/* Type filter */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Type:</span>
                            {allTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={cn(
                                        'px-3 py-1 rounded-md text-sm capitalize transition-colors',
                                        selectedTypes.includes(type)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary hover:bg-secondary/80'
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Featured toggle */}
                        <button
                            onClick={() => setShowFeatured(!showFeatured)}
                            className={cn(
                                'px-3 py-1 rounded-md text-sm transition-colors',
                                showFeatured
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary hover:bg-secondary/80'
                            )}
                        >
                            ⭐ Featured
                        </button>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="px-3 py-1 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="year_desc">Year (newest)</option>
                                <option value="year_asc">Year (oldest)</option>
                                <option value="title_az">Title (A-Z)</option>
                            </select>
                        </div>

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-muted-foreground hover:text-foreground underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Publications List */}
                {filteredPubs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No publications found matching your filters.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Array.from(groupedPubs.entries())
                            .sort(([yearA], [yearB]) => yearB - yearA)
                            .map(([year, pubs]) => {
                                const isExpanded = !settings.collapseYears?.enabled || expandedYears.has(year);

                                return (
                                    <div key={year}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-2xl font-semibold">{year}</h3>

                                            {settings.collapseYears?.enabled && (
                                                <button
                                                    onClick={() => toggleYearExpanded(year)}
                                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <HiChevronUp className="h-4 w-4" />
                                                            Collapse
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiChevronDown className="h-4 w-4" />
                                                            Expand ({pubs.length})
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-4">
                                                {pubs.map((pub) => (
                                                    <PublicationCard
                                                        key={pub.id}
                                                        publication={pub}
                                                        settings={settings}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </section>
    );
}
