import type { InfoData } from '@/lib/schema';

interface ContactProps {
    contact: NonNullable<InfoData['contact']>;
    profile: InfoData['profile'];
}

export function Contact({ contact, profile }: ContactProps) {
    if (!contact.enabled) return null;

    return (
        <section id="contact" className="py-24 relative overflow-hidden">
            {/* Gradient backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent -z-10" />

            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-bold gradient-text">
                            {contact.label}
                        </h2>
                        {contact.availability && (
                            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                                {contact.availability}
                            </p>
                        )}
                    </div>

                    {/* Contact info card */}
                    <div className="modern-card max-w-2xl mx-auto space-y-6 glass-card">
                        {contact.showEmail && (
                            <div className="space-y-2">
                                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    Email
                                </p>
                                <a
                                    href={`mailto:${profile.email.address}`}
                                    className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity inline-block"
                                >
                                    {profile.email.address}
                                </a>
                            </div>
                        )}

                        {contact.showSocialLinks && profile.links.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-border">
                                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    Connect
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {profile.links.map((link) => (
                                        <a
                                            key={link.url}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 gradient-bg text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <p className="text-lg text-muted-foreground">
                        Let's collaborate on something amazing! 🚀
                    </p>
                </div>
            </div>
        </section>
    );
}
