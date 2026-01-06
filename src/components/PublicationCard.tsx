'use client';

import { useState } from 'react';
import { HiExternalLink, HiCode, HiDocumentText, HiVideoCamera } from 'react-icons/hi';
import { BibTeXModal } from './BibTeXModal';
import type { Publication } from '@/lib/schema';
import type { InfoData } from '@/lib/schema';
import { withBasePath, highlightAuthor } from '@/lib/utils';

interface PublicationCardProps {
    publication: Publication;
    settings: NonNullable<InfoData['publications']>['settings'];
}

export function PublicationCard({ publication, settings }: PublicationCardProps) {
    const [showBibTeX, setShowBibTeX] = useState(false);

    const typeColors: Record<string, string> = {
        conference: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        journal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        preprint: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        thesis: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        demo: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };

    const authorHtml = highlightAuthor(
        publication.authorsList || [],
        settings.authorEmphasis.myNameVariants,
        settings.authorEmphasis.style
    );

    return (
        <>
            <article className="modern-card group gradient-overlay">
                {/* Featured badge */}
                {publication.featured && (
                    <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 gradient-bg text-primary-foreground rounded-full text-xs font-bold shadow-lg">
                            ⭐ Featured
                        </span>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors pr-20">
                        {publication.links?.project || publication.links?.pdf ? (
                            <a
                                href={publication.links.project || withBasePath(publication.links.pdf!)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                {publication.title}
                            </a>
                        ) : (
                            publication.title
                        )}
                    </h3>

                    {/* Authors */}
                    <div
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: authorHtml }}
                    />

                    {/* Venue & Year */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-semibold text-foreground">
                            {publication.venue.short || publication.venue.name}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{publication.year}</span>

                        {/* Type badge */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[publication.type]}`}>
                            {publication.type.toUpperCase()}
                        </span>

                        {/* Status badge */}
                        {publication.status && publication.status !== 'published' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-semibold">
                                {publication.status.replace('_', ' ').toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Awards */}
                    {publication.awards && publication.awards.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {publication.awards.map((award, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-900 dark:text-yellow-200 rounded-full text-xs font-bold"
                                >
                                    🏆 {award}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Metrics */}
                    {settings.showMetrics && publication.metrics?.citations !== undefined && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm">
                            <span className="font-semibold text-foreground">{publication.metrics.citations}</span>
                            <span className="text-muted-foreground">citations</span>
                        </div>
                    )}

                    {/* Keywords */}
                    {publication.keywords && publication.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {publication.keywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="badge badge-secondary text-xs"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Links */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {publication.links?.pdf && (
                            <a
                                href={withBasePath(publication.links.pdf)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 rounded-lg text-sm  font-semibold transition-all hover:scale-105"
                            >
                                <HiDocumentText className="h-4 w-4" />
                                PDF
                            </a>
                        )}

                        {publication.links?.arxiv && (
                            <a
                                href={publication.links.arxiv}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            >
                                <HiExternalLink className="h-4 w-4" />
                                arXiv
                            </a>
                        )}

                        {publication.links?.code && (
                            <a
                                href={publication.links.code}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            >
                                <HiCode className="h-4 w-4" />
                                Code
                            </a>
                        )}

                        {publication.links?.project && (
                            <a
                                href={publication.links.project}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            >
                                <HiExternalLink className="h-4 w-4" />
                                Project
                            </a>
                        )}

                        {publication.links?.video && (
                            <a
                                href={publication.links.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            >
                                <HiVideoCamera className="h-4 w-4" />
                                Video
                            </a>
                        )}

                        {publication.bibtex && (
                            <button
                                onClick={() => setShowBibTeX(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border hover:border-primary hover:bg-primary/5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            >
                                📄 BibTeX
                            </button>
                        )}
                    </div>
                </div>
            </article>

            {/* BibTeX Modal */}
      {/* BibTeX Modal */}
      <BibTeXModal
        isOpen={showBibTeX}
        onClose={() => setShowBibTeX(false)}
        publication={publication}
      />
        </>
    );
}
