import { HiDownload } from 'react-icons/hi';
import type { InfoData } from '@/lib/schema';
import { withBasePath } from '@/lib/utils';

interface CVProps {
    cv: NonNullable<InfoData['cv']>;
}

export function CV({ cv }: CVProps) {
    if (!cv.enabled) return null;

    return (
        <section id="cv" className="py-16">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">{cv.label}</h2>

                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Download my complete curriculum vitae for a comprehensive overview of my education, research, publications, and professional experience.
                    </p>

                    <a
                        href={withBasePath(cv.pdfPath)}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        <HiDownload className="h-5 w-5" />
                        {cv.buttonLabel}
                    </a>
                </div>
            </div>
        </section>
    );
}
