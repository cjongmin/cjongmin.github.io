import type { InfoData } from '@/lib/schema';

interface ContactProps {
    contact: NonNullable<InfoData['contact']>;
    profile: InfoData['profile'];
}

export function Contact({ contact, profile }: ContactProps) {
    if (!contact.enabled) return null;

    return (
        <section id="contact" className="py-16 bg-accent/30">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-8">{contact.label}</h2>

                <div className="bg-card border border-border rounded-lg p-8">
                    {contact.availability && (
                        <p className="text-lg mb-6 max-w-2xl">
                            {contact.availability}
                        </p>
                    )}

                    <div className="space-y-4">
                        {contact.showEmail && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                    Email
                                </h3>
                                <a
                                    href={`mailto:${profile.email.address}`}
                                    className="text-lg text-primary hover:underline"
                                >
                                    {profile.email.address}
                                </a>
                            </div>
                        )}

                        {contact.showSocialLinks && profile.links.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                    Connect
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {profile.links.map((link) => (
                                        <a
                                            key={link.url}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
