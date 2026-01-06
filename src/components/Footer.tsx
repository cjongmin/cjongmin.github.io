interface FooterProps {
    siteName: string;
    lastUpdated?: string;
}

export function Footer({ siteName, lastUpdated }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 border-t border-border">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>
                        © {currentYear} {siteName}. All rights reserved.
                    </p>

                    {lastUpdated && (
                        <p>
                            Last updated: {lastUpdated}
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}
