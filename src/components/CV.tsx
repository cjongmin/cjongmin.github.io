import { HiDownload } from 'react-icons/hi';
import type { InfoData } from '@/lib/schema';
import { withBasePath } from '@/lib/utils';

interface CVProps {
    cv: NonNullable<InfoData['cv']>;
}

export function CV({ cv }: CVProps) {
    if (!cv.enabled) return null;

    return (
        <section id="cv" className="py-20 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/10 -z-10" />

            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="modern-card text-center space-y-6 glass-card gradient-overlay">
                    <div className="space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
                            {cv.label}
                        </h2>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Download my complete curriculum vitae for a comprehensive overview of my education, research, publications, and professional experience.
                        </p>
                    </div>

                    <a
                        href={withBasePath(cv.pdfPath)}
                        download
                        className="btn btn-primary inline-flex items-center gap-3 text-lg group"
                    >
                        <HiDownload className="h-6 w-6 group-hover:animate-bounce" />
                        {cv.buttonLabel}
                    </a>

                    {/* Decorative elements */}
                    <div className="flex justify-center gap-8 pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <span>PDF Format</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📋</span>
                            <span>Complete CV</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
