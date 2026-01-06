import { HiAcademicCap, HiBriefcase, HiOfficeBuilding, HiLocationMarker } from 'react-icons/hi';
import type { InfoData, Experience as ExperienceType } from '@/lib/schema';
import { formatDateRange } from '@/lib/utils';

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

const categoryGradients: Record<ExperienceType['category'], string> = {
    education: 'from-blue-500 to-cyan-500',
    position: 'from-green-500 to-emerald-500',
    internship: 'from-purple-500 to-pink-500',
    visiting: 'from-yellow-500 to-orange-500',
    service: 'from-red-500 to-rose-500',
};

export function Experience({ experience }: ExperienceProps) {
    // Sort by end date (most recent first)
    const sortedItems = [...experience.items].sort((a, b) => {
        const endA = a.end.toLowerCase() === 'present' ? 999999 : parseInt(a.end.replace('-', ''));
        const endB = b.end.toLowerCase() === 'present' ? 999999 : parseInt(b.end.replace('-', ''));

        if (endA !== endB) return endB - endA;

        const startA = parseInt(a.start.replace('-', ''));
        const startB = parseInt(b.start.replace('-', ''));
        return startB - startA;
    });

    return (
        <section id="experience" className="py-20 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-accent/[0.03] to-background -z-10" />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
                        Experience
                    </h2>
                </div>

                {/* Timeline */}
                <div className="relative grid gap-8">
                    {/* Vertical line (desktop only) */}
                    <div className="hidden lg:block absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary" style={{ transform: 'translateX(-50%)' }} />

                    {sortedItems.map((item, index) => {
                        const Icon = categoryIcons[item.category];
                        const isLeft = index % 2 === 0;

                        return (
                            <div
                                key={item.id}
                                className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${isLeft ? '' : 'lg:grid-flow-col-dense'
                                    }`}
                            >
                                {/* Icon (desktop) */}
                                <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10">
                                    <div className={`p-4 rounded-full bg-gradient-to-br ${categoryGradients[item.category]} shadow-2xl ring-4 ring-background group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className={`hidden lg:block ${isLeft ? '' : 'lg:col-start-2'}`} />

                                {/* Content */}
                                <div className={`${isLeft ? 'lg:col-start-2' : 'lg:col-start-1'} ${isLeft ? 'lg:pl-8' : 'lg:pr-8'}`}>
                                    <div className="modern-card group">
                                        {/* Icon (mobile) */}
                                        <div className={`lg:hidden absolute -left-3 top-6 p-3 rounded-full bg-gradient-to-br ${categoryGradients[item.category]} shadow-lg`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>

                                        <div className="pl-12 lg:pl-0 space-y-4">
                                            {/* Header */}
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                                    <div className="flex-1">
                                                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {item.role}
                                                        </h3>
                                                        {item.links?.org ? (
                                                            <a
                                                                href={item.links.org}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-lg text-primary hover:underline font-semibold"
                                                            >
                                                                {item.org}
                                                            </a>
                                                        ) : (
                                                            <p className="text-lg text-foreground/80 font-semibold">{item.org}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                            {formatDateRange(item.start, item.end)}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryGradients[item.category]}`}>
                                                            {categoryLabels[item.category]}
                                                        </span>
                                                    </div>
                                                </div>

                                                {item.location && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <HiLocationMarker className="h-4 w-4" />
                                                        <span className="text-sm">{item.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bullets */}
                                            {item.bullets.length > 0 && (
                                                <ul className="space-y-2">
                                                    {item.bullets.map((bullet, i) => (
                                                        <li key={i} className="flex gap-3 text-sm text-foreground/80">
                                                            <span className="text-primary font-bold mt-0.5">▸</span>
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Additional links */}
                                            {(item.links?.lab || item.links?.advisor) && (
                                                <div className="flex flex-wrap gap-3 pt-2">
                                                    {item.links.lab && (
                                                        <a
                                                            href={item.links.lab}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold"
                                                        >
                                                            Lab Website →
                                                        </a>
                                                    )}
                                                    {item.links.advisor && (
                                                        <a
                                                            href={item.links.advisor}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold"
                                                        >
                                                            Advisor →
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
