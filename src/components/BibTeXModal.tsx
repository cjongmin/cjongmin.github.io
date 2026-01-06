'use client';

import { useEffect, useState } from 'react';
import { HiX, HiClipboardCopy, HiCheck, HiDownload } from 'react-icons/hi';
import type { Publication } from '@/lib/schema';
import { cn } from '@/lib/utils';

interface BibTeXModalProps {
    isOpen: boolean;
    onClose: () => void;
    publication: Publication;
}

export function BibTeXModal({ isOpen, onClose, publication }: BibTeXModalProps) {
    const [copied, setCopied] = useState(false);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publication.bibtex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadBibTeX = () => {
        const blob = new Blob([publication.bibtex], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${publication.id}.bib`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bibtex-title"
        >
            <div
                className="bg-card border border-border rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 id="bibtex-title" className="text-lg font-semibold">
                        BibTeX Citation
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                        aria-label="Close"
                    >
                        <HiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        {publication.title}
                    </p>

                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                        <code>{publication.bibtex}</code>
                    </pre>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-4 border-t border-border">
                    <button
                        onClick={copyToClipboard}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1',
                            copied
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                    >
                        {copied ? (
                            <>
                                <HiCheck className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <HiClipboardCopy className="h-4 w-4" />
                                Copy to Clipboard
                            </>
                        )}
                    </button>

                    <button
                        onClick={downloadBibTeX}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors flex-1"
                    >
                        <HiDownload className="h-4 w-4" />
                        Download .bib
                    </button>
                </div>
            </div>
        </div>
    );
}
