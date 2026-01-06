'use client';

import { useState, useMemo } from 'react';
import { HiSearch, HiX, HiFilter } from 'react-icons/hi';
import { PublicationCard } from './PublicationCard';
import type { InfoData } from '@/lib/schema';

interface PublicationsProps {
    publications: NonNullable<InfoData['publications']>;
}

export function Publications({ publications }: PublicationsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
    const [selectedType, setSelectedType] = useState<string>('all');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
    const [sortBy, setSortBy] = useState('year_desc');
    const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

    const { items, settings } = publications;

    // Get unique years and types
    const years = useMemo(() => {
        return Array.from(new Set(items.map((p) => p.year))).sort((a, b) => b - a);
    }, [items]);

    const types = useMemo(() => {
        return Array.from(new Set(items.map((p) => p.type)));
    }, [items]);

    // Initialize collapsed years
    useMemo(() => {
        if (settings.collapseYears?.enabled && collapsedYears.size === 0) {
            const yearsToCollapse = years.slice(settings.collapseYears.expandedYearsCount);
            setCollapsedYears(new Set(yearsToCollapse));
        }
    }, [years, settings.collapseYears, collapsedYears.size]);

    // Filter and sort publications
    const filteredPubs = useMemo(() => {
        let filtered = items.filter((pub) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchText = `${pub.title} ${pub.authorsList?.join(' ')} ${pub.venue.name} ${pub.keywords?.join(' ') || ''}`.toLowerCase();
                if (!searchText.includes(query)) return false;
            }

            // Year filter
            if (selectedYears.size > 0 && !selectedYears.has(pub.year)) return false;

            // Type filter
            if (selectedType !== 'all' && pub.type !== selectedType) return false;

            // Featured filter
            if (showFeaturedOnly && !pub.featured) return false;

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'year_desc') return b.year - a.year;
            if (sortBy === 'year_asc') return a.year - b.year;
            if (sortBy === 'title_az') return a.title.localeCompare(b.title);
            return 0;
        });

        return filtered;
    }, [items, searchQuery, selectedYears, selectedType, showFeaturedOnly, sortBy]);

    // Group by year
    const groupedPubs = useMemo(() => {
        const groups = new Map<number, typeof items>();
        filteredPubs.forEach((pub) => {
            if (!groups.has(pub.year)) groups.set(pub.year, []);
            groups.get(pub.year)!.push(pub);
        });
        return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
    }, [filteredPubs]);

    const toggleYear = (year: number) => {
        setSelectedYears((prev) => {
            const next = new Set(prev);
            if (next.has(year)) next.delete(year);
            else next.add(year);
            return next;
        });
    };

    const toggleYearCollapse = (year: number) => {
        setCollapsedYears((prev) => {
            const next = new Set(prev);
            if (next.has(year)) next.delete(year);
            else next.add(year);
            return next;
        });
    };

    return (
        <section id="publications" className="py-20 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background -z-10" />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
                        Publications
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {filteredPubs.length} publication{filteredPubs.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Modern Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by title, author, venue, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 bg-card border-2 border-border rounded-2xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-lg transition-colors"
                            >
                                <HiX className="h-5 w-5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-10 items-center justify-center">
                    {/* Year filters */}
                    <div className="flex flex-wrap gap-2">
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => toggleYear(year)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedYears.has(year)
                                    ? 'gradient-bg text-primary-foreground shadow-lg shadow-primary/30'
                                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    {/* Type filter */}
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 bg-card border-2 border-border rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium"
                    >
                        <option value="all">All Types</option>
                        {types.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Featured toggle */}
                    <button
                        onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${showFeaturedOnly
                            ? 'gradient-bg text-primary-foreground shadow-lg shadow-primary/30'
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            }`}
                    >
                        ⭐ Featured
                    </button>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-card border-2 border-border rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium"
                    >
                        <option value="year_desc">Latest First</option>
                        <option value="year_asc">Oldest First</option>
                        <option value="title_az">Title (A-Z)</option>
                    </select>

                    {/* Clear filters */}
                    {(selectedYears.size > 0 || selectedType !== 'all' || showFeaturedOnly) && (
                        <button
                            onClick={() => {
                                setSelectedYears(new Set());
                                setSelectedType('all');
                                setShowFeaturedOnly(false);
                            }}
                            className="text-sm text-primary hover:text-primary/80 underline font-medium"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Publications by year */}
                {groupedPubs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-xl text-muted-foreground">No publications found</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {groupedPubs.map(([year, pubs]) => (
                            <div key={year} className="space-y-6">
                                {/* Year header */}
                                <button
                                    onClick={() => toggleYearCollapse(year)}
                                    className="flex items-center gap-3 group w-full"
                                >
                                    <h3 className="text-3xl font-bold gradient-text">{year}</h3>
                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                                    <span className="text-sm font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                                        {pubs.length} paper{pubs.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        {collapsedYears.has(year) ? '▼' : '▲'}
                                    </span>
                                </button>

                                {/* Publications */}
                                {!collapsedYears.has(year) && (
                                    <div className="grid gap-6">
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
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
