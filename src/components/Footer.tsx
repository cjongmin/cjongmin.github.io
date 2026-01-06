interface FooterProps {
    siteName: string;
    lastUpdated?: string;
}

export function Footer({ siteName, lastUpdated }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-12 border-t border-border/50 overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent -z-10" />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    {/* Site name */}
                    <p className="text-lg font-bold gradient-text">
                        {siteName}
                    </p>

                    {/* Copyright */}
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} All rights reserved
                    </p>

                    {/* Last updated */}
                    {lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                            Last updated: <span className="font-semibold">{lastUpdated}</span>
                        </p>
                    )}

                    {/* Built with love */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        Built with
                        <span className="text-red-500 animate-pulse">❤️</span>
                        and Next.js
                    </p>
                </div>
            </div>
        </footer>
    );
}
