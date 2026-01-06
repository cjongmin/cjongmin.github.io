'use client';

import Image from 'next/image';
import { HiMail, HiClipboardCopy, HiCheck } from 'react-icons/hi';
import {
    FaGithub,
    FaLinkedin,
    FaOrcid,
    FaGlobe,
    FaTwitter,
    FaGraduationCap
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useState } from 'react';
import type { InfoData } from '@/lib/schema';
import { withBasePath } from '@/lib/utils';

interface HeroProps {
    profile: InfoData['profile'];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    scholar: FaGraduationCap,
    github: FaGithub,
    linkedin: FaLinkedin,
    orcid: FaOrcid,
    x: FaXTwitter,
    twitter: FaTwitter,
    homepage: FaGlobe,
    blog: FaGlobe,
};

export function Hero({ profile }: HeroProps) {
    const [emailCopied, setEmailCopied] = useState(false);

    const copyEmail = () => {
        navigator.clipboard.writeText(profile.email.address);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
    };

    const obfuscateEmail = (email: string) => {
        return email.replace('@', ' [at] ').replace(/\./g, ' [dot] ');
    };

    return (
        <section id="about" className="pt-24 pb-16">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* Headshot */}
                    <div className="flex-shrink-0">
                        <Image
                            src={withBasePath(profile.headshot.src)}
                            alt={profile.headshot.alt}
                            width={200}
                            height={200}
                            className={
                                profile.headshot.shape === 'circle'
                                    ? 'rounded-full'
                                    : 'rounded-lg'
                            }
                            priority
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                            {profile.name.preferred}
                        </h1>

                        {profile.name.native && (
                            <p className="text-xl text-muted-foreground mb-2">
                                {profile.name.native}
                            </p>
                        )}

                        <p className="text-lg text-muted-foreground mb-4">
                            {profile.tagline}
                        </p>

                        <p className="text-base mb-2">{profile.affiliation}</p>

                        {profile.location && (
                            <p className="text-sm text-muted-foreground mb-4">
                                {profile.location}
                            </p>
                        )}

                        {/* Email */}
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                            <HiMail className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">
                                {profile.email.display === 'obfuscated'
                                    ? obfuscateEmail(profile.email.address)
                                    : profile.email.address}
                            </span>
                            {profile.email.showCopyButton && (
                                <button
                                    onClick={copyEmail}
                                    className="p-1 hover:bg-accent rounded transition-colors"
                                    aria-label="Copy email"
                                    title="Copy email"
                                >
                                    {emailCopied ? (
                                        <HiCheck className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <HiClipboardCopy className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                            {profile.links.map((link) => {
                                const Icon = iconMap[link.type] || FaGlobe;
                                return (
                                    <a
                                        key={link.url}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors"
                                        aria-label={link.label}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>

                        {/* Bio */}
                        <div className="space-y-4 mb-8 text-base leading-relaxed">
                            {profile.bio.map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        {/* Interests */}
                        {profile.interests.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold mb-3">Research Interests</h3>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {profile.interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Highlights */}
                        {profile.highlights.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {profile.highlights.map((highlight) => (
                                    <div
                                        key={highlight.label}
                                        className="text-center md:text-left p-4 bg-accent rounded-lg"
                                    >
                                        {highlight.url ? (
                                            <a
                                                href={highlight.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block hover:opacity-80 transition-opacity"
                                            >
                                                <div className="text-2xl font-bold text-primary">
                                                    {highlight.value}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {highlight.label}
                                                </div>
                                            </a>
                                        ) : (
                                            <>
                                                <div className="text-2xl font-bold text-primary">
                                                    {highlight.value}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {highlight.label}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
