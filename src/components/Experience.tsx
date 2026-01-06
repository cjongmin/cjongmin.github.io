import { HiAcademicCap, HiBriefcase, HiOfficeBuilding } from 'react-icons/hi';
import type { InfoData, Experience as ExperienceType } from '@/lib/schema';
import { formatDateRange, cn } from '@/lib/utils';

interface ExperienceProps {
    experience: NonNullable<InfoData['experience']>;
}

const categoryIcons: Record<ExperienceType['category'], React.ComponentType<{ className?: string }>> = {
    education: HiAcademicCap,
    position: HiBriefcase,
    internship: HiBriefcase,
    visiting: HiOfficeBuilding,
    service: HiOfficeBuilding,
};

const categoryLabels: Record<ExperienceType['category'], string> = {
    education: 'Education',
    position: 'Position',
    internship: 'Internship',
    visiting: 'Visiting',
    service: 'Service',
};

const categoryColors: Record<ExperienceType['category'], string> = {
    education: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    position: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    internship: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    visiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    service: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function Experience({ experience }: ExperienceProps) {
    // Sort by end date (most recent first), then start date
    const sortedItems = [...experience.items].sort((a, b) => {
        const endA = a.end.toLowerCase() === 'present' ? 999999 : parseInt(a.end.replace('-', ''));
        const endB = b.end.toLowerCase() === 'present' ? 999999 : parseInt(b.end.replace('-', ''));

        if (endA !== endB) return endB - endA;

        const startA = parseInt(a.start.replace('-', ''));
        const startB = parseInt(b.start.replace('-', ''));
        return startB - startA;
    });

    return (
        <section id="experience" className="py-16 bg-accent/30">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-12">Experience</h2>

                {/* Timeline */}
                <div className="space-y-8">
                    {sortedItems.map((item, index) => {
                        const Icon = categoryIcons[item.category];

                        return (
                            <div key={item.id} className="relative">
                                {/* Timeline line (desktop only) */}
                                {index < sortedItems.length - 1 && (
                                    <div className="hidden md:block absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                                )}

                                <div className="flex gap-6">
                                    {/* Icon */}
                                    <div className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-card border border-border rounded-lg p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-1">
                                                    {item.role}
                                                </h3>
                                                <p className="text-base text-muted-foreground">
                                                    {item.links?.org ? (
                                                        <a
                                                            href={item.links.org}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-primary transition-colors"
                                                        >
                                                            {item.org}
                                                        </a>
                                                    ) : (
                                                        item.org
                                                    )}
                                                </p>
                                                {item.location && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.location}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {formatDateRange(item.start, item.end)}
                                                </span>
                                                <span className={cn('px-2 py-1 rounded text-xs font-medium', categoryColors[item.category])}>
                                                    {categoryLabels[item.category]}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bullets */}
                                        {item.bullets.length > 0 && (
                                            <ul className="space-y-2 text-sm">
                                                {item.bullets.map((bullet, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="text-primary mt-1.5">•</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Additional links */}
                                        {(item.links?.lab || item.links?.advisor) && (
                                            <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                                {item.links.lab && (
                                                    <a
                                                        href={item.links.lab}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Lab Website →
                                                    </a>
                                                )}
                                                {item.links.advisor && (
                                                    <a
                                                        href={item.links.advisor}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Advisor →
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
