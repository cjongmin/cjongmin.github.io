import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { loadInfo } from '@/lib/loadInfo';
import { withBasePath } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

// Load data at build time
const info = loadInfo();

export const metadata: Metadata = {
    title: info.site.title,
    description: info.site.description,
    openGraph: {
        title: info.site.title,
        description: info.site.description,
        type: 'website',
        images: info.site.ogImage ? [withBasePath(info.site.ogImage)] : [],
    },
    twitter: {
        card: 'summary_large_image',
        title: info.site.title,
        description: info.site.description,
        images: info.site.ogImage ? [withBasePath(info.site.ogImage)] : [],
    },
    icons: {
        icon: info.site.favicon ? withBasePath(info.site.favicon) : '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang={info.site.locale} suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    defaultTheme={info.site.theme.defaultMode}
                    allowToggle={info.site.theme.allowToggle}
                >
                    <a href="#main-content" className="skip-link">
                        Skip to main content
                    </a>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
