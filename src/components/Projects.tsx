'use client';

import { useState, useMemo } from 'react';
import { HiCode, HiExternalLink, HiVideoCamera } from 'react-icons/hi';
import Image from 'next/image';
import type { InfoData } from '@/lib/schema';
import { cn, withBasePath } from '@/lib/utils';

interface ProjectsProps {
    projects: NonNullable<InfoData['projects']>;
}

export function Projects({ projects }: ProjectsProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const { items, settings } = projects;

    // Get all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        items.forEach((project) => {
            project.tags.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [items]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        if (selectedTags.length === 0) return items;

        return items.filter((project) =>
            selectedTags.some((tag) => project.tags.includes(tag))
        );
    }, [items, selectedTags]);

    // Separate featured and non-featured
    const featuredProjects = filteredProjects.filter((p) => p.featured);
    const otherProjects = filteredProjects.filter((p) => !p.featured);

    const displayProjects = settings.featuredFirst
        ? [...featuredProjects, ...otherProjects]
        : filteredProjects;

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    return (
        <section id="projects" className="py-16">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-8">Projects</h2>

                {/* Tag filters */}
                {allTags.length > 0 && (
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-sm transition-colors',
                                        selectedTags.includes(tag)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary hover:bg-secondary/80'
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}

                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects grid */}
                {displayProjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No projects found matching your filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayProjects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {project.media?.thumbnail && (
                                    <div className="aspect-video bg-muted">
                                        <Image
                                            src={withBasePath(project.media.thumbnail)}
                                            alt={project.title}
                                            width={600}
                                            height={338}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold flex-1">
                                            {project.title}
                                        </h3>
                                        {project.featured && (
                                            <span className="text-amber-500" title="Featured">
                                                ⭐
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-4">
                                        {project.summary}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    {project.links && (
                                        <div className="flex flex-wrap gap-2">
                                            {project.links.code && (
                                                <a
                                                    href={project.links.code}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                                >
                                                    <HiCode className="h-3 w-3" />
                                                    Code
                                                </a>
                                            )}

                                            {project.links.demo && (
                                                <a
                                                    href={project.links.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                                >
                                                    <HiExternalLink className="h-3 w-3" />
                                                    Demo
                                                </a>
                                            )}

                                            {project.links.project && (
                                                <a
                                                    href={project.links.project}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                                >
                                                    <HiExternalLink className="h-3 w-3" />
                                                    Project Page
                                                </a>
                                            )}

                                            {project.links.video && (
                                                <a
                                                    href={project.links.video}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs font-medium transition-colors"
                                                >
                                                    <HiVideoCamera className="h-3 w-3" />
                                                    Video
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
