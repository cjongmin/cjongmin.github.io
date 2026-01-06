import { loadInfo } from '@/lib/loadInfo';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Publications } from '@/components/Publications';
import { Projects } from '@/components/Projects';
import { Experience } from '@/components/Experience';
import { CV } from '@/components/CV';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

export default function Home() {
    // Load data at build time (server component)
    const info = loadInfo();

    // Determine last updated value
    let lastUpdated: string | undefined;
    if (info.site.lastUpdated === 'auto') {
        // This will be injected by GitHub Actions via NEXT_PUBLIC_LAST_UPDATED
        lastUpdated = process.env.NEXT_PUBLIC_LAST_UPDATED;
    } else if (info.site.lastUpdated === 'manual' && info.site.lastUpdatedValue) {
        lastUpdated = info.site.lastUpdatedValue;
    }

    return (
        <>
            <Header
                nav={info.nav}
                siteTitle={info.site.title}
                allowThemeToggle={info.site.theme.allowToggle}
            />

            <main id="main-content">
                {/* Hero / About */}
                {info.sections.about?.enabled && (
                    <Hero profile={info.profile} />
                )}

                {/* Publications */}
                {info.sections.publications?.enabled && info.publications && (
                    <Publications publications={info.publications} />
                )}

                {/* Projects */}
                {info.sections.projects?.enabled && info.projects && (
                    <Projects projects={info.projects} />
                )}

                {/* Experience */}
                {info.sections.experience?.enabled && info.experience && (
                    <Experience experience={info.experience} />
                )}

                {/* CV */}
                {info.sections.cv?.enabled && info.cv && (
                    <CV cv={info.cv} />
                )}

                {/* Contact */}
                {info.sections.contact?.enabled && info.contact && (
                    <Contact contact={info.contact} profile={info.profile} />
                )}
            </main>

            <Footer
                siteName={info.profile.name.preferred}
                lastUpdated={lastUpdated}
            />
        </>
    );
}
