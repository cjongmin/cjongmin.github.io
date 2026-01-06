'use client';

import { useState } from 'react';
import {
    HiDocumentText,
    HiCode,
    HiExternalLink,
    HiVideoCamera,
    HiDocument
} from 'react-icons/hi';
import type { Publication } from '@/lib/schema';
import { highlightAuthor, cn } from '@/lib/utils';
import { BibTeXModal } from './BibTeXModal';

interface PublicationCardProps {
    publication: Publication;
    settings: {
        authorEmphasis: {
            myNameVariants: string[];
            style: 'bold' | 'underline' | 'highlight';
        };
        showMetrics?: boolean;
    };
}

const typeColors: Record<Publication['type'], string> = {
    conference: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    journal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    workshop: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    preprint: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    thesis: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    demo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

const statusLabels: Record<NonNullable<Publication['status']>, string> = {
    published: 'Published',
    accepted: 'Accepted',
    under_review: 'Under Review',
    in_preparation: 'In Preparation',
};

export function PublicationCard({ publication, settings }: PublicationCardProps) {
    const [showBibTeX, setShowBibTeX] = useState(false);

    const highlightedAuthors = publication.authorsList
        ? highlightAuthor(
            publication.authorsList,
            settings.authorEmphasis.myNameVariants,
            settings.authorEmphasis.style
        )
        : [];

    const mainLink = publication.links?.pdf || publication.links?.arxiv || publication.links?.doi;

    return (
        <>
            <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h4 className="text-lg font-semibold mb-2 leading-tight">
                            {mainLink ? (
                                <a
                                    href={mainLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                >
                                    {publication.title}
                                </a>
                            ) : (
                                publication.title
                            )}
                        </h4>

                        {/* Authors */}
                        <p className="text-sm text-muted-foreground mb-2">
                            {highlightedAuthors.map(({ author, isHighlighted }, i) => (
                                <span key={i}>
                                    {i > 0 && ', '}
                                    <span
                                        className={cn(
                                            isHighlighted &&
                                            settings.authorEmphasis.style === 'bold' &&
                                            'font-bold text-foreground',
                                            isHighlighted &&
                                            settings.authorEmphasis.style === 'underline' &&
                                            'underline text-foreground',
                                            isHighlighted &&
                                            settings.authorEmphasis.style === 'highlight' &&
                                            'bg-primary/20 px-1 rounded text-foreground'
                                        )}
                                    >
                                        {author}
                                    </span>
                                </span>
                            ))}
                        </p>

                        {/* Venue and Year */}
                        <p className="text-sm text-muted-foreground mb-3">
                            <span className="font-medium">
                                {publication.venue.short || publication.venue.name}
                            </span>
                            {' '}
                            {publication.year}
                            {publication.month && ` (${new Date(publication.year, publication.month - 1).toLocaleString('default', { month: 'short' })})`}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {/* Type badge */}
                            <span className={cn('px-2 py-1 rounded text-xs font-medium capitalize', typeColors[publication.type])}>
                                {publication.type}
                            </span>

                            {/* Status badge */}
                            {publication.status && publication.status !== 'published' && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                    {statusLabels[publication.status]}
                                </span>
                            )}

                            {/* Featured */}
                            {publication.featured && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    ⭐ Featured
                                </span>
                            )}

                            {/* Awards */}
                            {publication.awards?.map((award) => (
                                <span
                                    key={award}
                                    className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                >
                                    🏆 {award}
                                </span>
                            ))}

                            {/* Metrics */}
                            {settings.showMetrics && publication.metrics?.citations !== undefined && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                    {publication.metrics.citations} citations
                                </span>
                            )}
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-2">
                            {publication.links?.pdf && (
                                <a
                                    href={publication.links.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="PDF"
                                >
                                    <HiDocumentText className="h-3 w-3" />
                                    PDF
                                </a>
                            )}

                            {publication.links?.arxiv && (
                                <a
                                    href={publication.links.arxiv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="arXiv"
                                >
                                    <HiDocument className="h-3 w-3" />
                                    arXiv
                                </a>
                            )}

                            {publication.links?.code && (
                                <a
                                    href={publication.links.code}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="Code"
                                >
                                    <HiCode className="h-3 w-3" />
                                    Code
                                </a>
                            )}

                            {publication.links?.project && (
                                <a
                                    href={publication.links.project}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="Project"
                                >
                                    <HiExternalLink className="h-3 w-3" />
                                    Project
                                </a>
                            )}

                            {publication.links?.video && (
                                <a
                                    href={publication.links.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="Video"
                                >
                                    <HiVideoCamera className="h-3 w-3" />
                                    Video
                                </a>
                            )}

                            {publication.links?.slides && (
                                <a
                                    href={publication.links.slides}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="Slides"
                                >
                                    <HiDocumentText className="h-3 w-3" />
                                    Slides
                                </a>
                            )}

                            {publication.links?.poster && (
                                <a
                                    href={publication.links.poster}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                    aria-label="Poster"
                                >
                                    <HiDocumentText className="h-3 w-3" />
                                    Poster
                                </a>
                            )}

                            <button
                                onClick={() => setShowBibTeX(true)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs font-medium transition-colors"
                                aria-label="BibTeX"
                            >
                                BibTeX
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <BibTeXModal
                isOpen={showBibTeX}
                onClose={() => setShowBibTeX(false)}
                publication={publication}
            />
        </>
    );
}
