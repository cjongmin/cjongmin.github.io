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
        <section id="about" className="relative pt-32 pb-20 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                    {/* Headshot with floating animation */}
                    <div className="flex-shrink-0 float-animation">
                        <div className="relative group">
                            {/* Gradient glow ring */}
                            <div className="absolute -inset-1 gradient-bg rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity pulse-glow" />

                            <div className="relative">
                                <Image
                                    src={withBasePath(profile.headshot.src)}
                                    alt={profile.headshot.alt}
                                    width={240}
                                    height={240}
                                    className={`relative ${profile.headshot.shape === 'circle' ? 'rounded-full' : 'rounded-3xl'
                                        } shadow-2xl border-4 border-white dark:border-gray-800 transition-transform duration-300 group-hover:scale-105`}
                                    priority
                                />

                                {/* Online status indicator */}
                                <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg">
                                    <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info section */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        {/* Name with gradient */}
                        <div className="space-y-3">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold gradient-text leading-tight">
                                {profile.name.preferred}
                            </h1>

                            {profile.name.native && (
                                <p className="text-xl text-muted-foreground font-medium">
                                    {profile.name.native}
                                </p>
                            )}

                            <p className="text-2xl text-foreground/80 font-medium">
                                {profile.tagline}
                            </p>
                        </div>

                        {/* Affiliation & Location */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-base">
                            <span className="font-semibold text-foreground">{profile.affiliation}</span>
                            {profile.location && (
                                <>
                                    <span className="hidden sm:inline text-muted-foreground">•</span>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        📍 {profile.location}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Email with modern styling */}
                        <div className="inline-flex items-center gap-3 px-5 py-3 bg-secondary/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                            <HiMail className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">
                                {profile.email.display === 'obfuscated'
                                    ? obfuscateEmail(profile.email.address)
                                    : profile.email.address}
                            </span>
                            {profile.email.showCopyButton && (
                                <button
                                    onClick={copyEmail}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                                    aria-label="Copy email"
                                    title="Copy email"
                                >
                                    {emailCopied ? (
                                        <HiCheck className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <HiClipboardCopy className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Social links with modern cards */}
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                            {profile.links.map((link) => {
                                const Icon = iconMap[link.type] || FaGlobe;
                                return (
                                    <a
                                        key={link.url}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                        aria-label={link.label}
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {link.label}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>

                        {/* Bio with better typography */}
                        <div className="space-y-4 text-base leading-relaxed text-foreground/80 max-w-3xl">
                            {profile.bio.map((paragraph, i) => (
                                <p key={i} className="text-balance">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {/* Interests as modern tags */}
                        {profile.interests.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    Research Interests
                                </h3>
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                    {profile.interests.map((interest, index) => (
                                        <span
                                            key={interest}
                                            className="badge badge-primary hover:scale-105 transition-transform cursor-default"
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                            }}
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Highlights with gradient cards */}
                        {profile.highlights.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                                {profile.highlights.map((highlight, index) => (
                                    <div
                                        key={highlight.label}
                                        className="relative group"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        {highlight.url ? (
                                            <a
                                                href={highlight.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-5 modern-card text-center gradient-overlay"
                                            >
                                                <div className="text-3xl font-bold gradient-text mb-1">
                                                    {highlight.value}
                                                </div>
                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {highlight.label}
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="p-5 modern-card text-center gradient-overlay">
                                                <div className="text-3xl font-bold gradient-text mb-1">
                                                    {highlight.value}
                                                </div>
                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {highlight.label}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom gradient divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
