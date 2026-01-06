/**
 * Comprehensive Zod schema for info.json validation
 */

import { z } from 'zod';

// Helper schemas
const yearSchema = z.number().int().min(1900).max(2100);
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}$|^present$/i, 'Must be YYYY-MM or "present"');
const urlOrPathSchema = z.string().min(1);

// Site metadata
export const siteSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    locale: z.string().default('en'),
    theme: z.object({
        defaultMode: z.enum(['light', 'dark']).default('light'),
        allowToggle: z.boolean().default(true),
    }).default({ defaultMode: "light", allowToggle: true }),
    basePath: z.string().optional(),
    ogImage: z.string().optional(),
    favicon: z.string().optional(),
    lastUpdated: z.enum(['auto', 'manual']).default('auto'),
    lastUpdatedValue: z.string().optional(),
});

// Navigation
export const navItemSchema = z.object({
    id: z.string(),
    label: z.string(),
    href: z.string(),
    type: z.enum(['anchor', 'route']).default('anchor'),
    enabled: z.boolean().default(true),
});

export const navSchema = z.object({
    items: z.array(navItemSchema),
});

// Sections configuration
export const sectionConfigSchema = z.object({
    enabled: z.boolean().default(true),
    label: z.string(),
    layout: z.string().optional(),
});

export const sectionsSchema = z.record(z.string(), sectionConfigSchema);

// Profile
export const profileSchema = z.object({
    name: z.object({
        full: z.string().min(1),
        preferred: z.string().min(1),
        native: z.string().optional(),
    }),
    tagline: z.string(),
    affiliation: z.string(),
    location: z.string().optional(),
    email: z.object({
        address: z.string().email(),
        display: z.enum(['plain', 'obfuscated']).default('plain'),
        showCopyButton: z.boolean().default(true),
    }),
    headshot: z.object({
        src: z.string(),
        alt: z.string(),
        shape: z.enum(['circle', 'rounded']).default('circle'),
    }),
    links: z.array(z.object({
        type: z.string(),
        label: z.string(),
        url: urlOrPathSchema,
        icon: z.string().optional(),
    })),
    bio: z.array(z.string()),
    interests: z.array(z.string()),
    highlights: z.array(z.object({
        icon: z.string().optional(),
        label: z.string(),
        value: z.string(),
        url: urlOrPathSchema.optional(),
    })),
});

// Publications
export const publicationSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    // Support both authors string and authorsList array
    authors: z.string().optional(),
    authorsList: z.array(z.string()).optional(),
    venue: z.object({
        name: z.string(),
        short: z.string().optional(),
    }),
    year: yearSchema,
    month: z.number().int().min(1).max(12).optional(),
    type: z.enum(['conference', 'journal', 'workshop', 'preprint', 'thesis', 'demo']),
    status: z.enum(['published', 'accepted', 'under_review', 'in_preparation']).optional(),
    featured: z.boolean().default(false),
    awards: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    abstract: z.string().optional(),
    links: z.object({
        pdf: urlOrPathSchema.optional(),
        arxiv: urlOrPathSchema.optional(),
        doi: urlOrPathSchema.optional(),
        code: urlOrPathSchema.optional(),
        project: urlOrPathSchema.optional(),
        video: urlOrPathSchema.optional(),
        slides: urlOrPathSchema.optional(),
        poster: urlOrPathSchema.optional(),
    }).optional(),
    bibtex: z.string().min(1, 'BibTeX is required'),
    media: z.object({
        thumbnail: z.string().optional(),
    }).optional(),
    metrics: z.object({
        citations: z.number().int().min(0).optional(),
    }).optional(),
}).refine(
    (data) => data.authors || data.authorsList,
    { message: 'Either authors or authorsList must be provided' }
);

export const publicationsSchema = z.object({
    settings: z.object({
        authorEmphasis: z.object({
            myNameVariants: z.array(z.string()),
            style: z.enum(['bold', 'underline', 'highlight']).default('bold'),
        }),
        equalContributionMarker: z.string().default('*'),
        correspondingAuthorMarker: z.string().default('†'),
        groupBy: z.enum(['year']).default('year'),
        defaultSort: z.enum(['year_desc', 'year_asc', 'title_az']).default('year_desc'),
        showMetrics: z.boolean().default(false),
        collapseYears: z.object({
            enabled: z.boolean().default(true),
            expandedYearsCount: z.number().int().min(1).default(2),
        }).optional(),
    }),
    items: z.array(publicationSchema),
});

// Projects
export const projectSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    links: z.object({
        code: urlOrPathSchema.optional(),
        demo: urlOrPathSchema.optional(),
        paper: urlOrPathSchema.optional(),
        project: urlOrPathSchema.optional(),
        video: urlOrPathSchema.optional(),
    }).optional(),
    media: z.object({
        thumbnail: z.string().optional(),
    }).optional(),
});

export const projectsSchema = z.object({
    settings: z.object({
        featuredFirst: z.boolean().default(true),
    }),
    items: z.array(projectSchema),
});

// Experience
export const experienceSchema = z.object({
    id: z.string().min(1),
    category: z.enum(['education', 'position', 'internship', 'visiting', 'service']),
    org: z.string(),
    role: z.string(),
    location: z.string().optional(),
    start: dateStringSchema,
    end: dateStringSchema,
    bullets: z.array(z.string()),
    links: z.object({
        org: urlOrPathSchema.optional(),
        lab: urlOrPathSchema.optional(),
        advisor: urlOrPathSchema.optional(),
    }).optional(),
});

export const experienceListSchema = z.object({
    items: z.array(experienceSchema),
});

// CV
export const cvSchema = z.object({
    enabled: z.boolean().default(true),
    label: z.string().default('Curriculum Vitae'),
    pdfPath: z.string(),
    buttonLabel: z.string().default('Download CV'),
    previewImage: z.string().optional(),
    alsoInLinks: z.boolean().default(false),
});

// Optional sections
export const talkSchema = z.object({
    title: z.string(),
    event: z.string(),
    date: dateStringSchema,
    location: z.string().optional(),
    links: z.object({
        slides: urlOrPathSchema.optional(),
        video: urlOrPathSchema.optional(),
        abstract: urlOrPathSchema.optional(),
    }).optional(),
});

export const teachingSchema = z.object({
    course: z.string(),
    org: z.string(),
    term: z.string(),
    role: z.string(),
    links: z.object({
        website: urlOrPathSchema.optional(),
        materials: urlOrPathSchema.optional(),
    }).optional(),
});

export const serviceSchema = z.object({
    role: z.string(),
    venueOrOrg: z.string(),
    year: yearSchema,
    details: z.string().optional(),
});

export const awardSchema = z.object({
    title: z.string(),
    org: z.string(),
    year: yearSchema,
    details: z.string().optional(),
    links: z.object({
        url: urlOrPathSchema.optional(),
    }).optional(),
});

export const talksListSchema = z.object({
    items: z.array(talkSchema),
});

export const teachingListSchema = z.object({
    items: z.array(teachingSchema),
});

export const serviceListSchema = z.object({
    items: z.array(serviceSchema),
});

export const awardsListSchema = z.object({
    items: z.array(awardSchema),
});

// Contact
export const contactSchema = z.object({
    enabled: z.boolean().default(true),
    label: z.string().default('Contact'),
    showEmail: z.boolean().default(true),
    showForm: z.boolean().default(false),
    showSocialLinks: z.boolean().default(true),
    availability: z.string().optional(),
});

// Root schema
export const infoSchema = z.object({
    site: siteSchema,
    nav: navSchema,
    sections: sectionsSchema,
    profile: profileSchema,
    publications: publicationsSchema.optional(),
    projects: projectsSchema.optional(),
    experience: experienceListSchema.optional(),
    cv: cvSchema.optional(),
    talks: talksListSchema.optional(),
    teaching: teachingListSchema.optional(),
    service: serviceListSchema.optional(),
    awards: awardsListSchema.optional(),
    contact: contactSchema.optional(),
}).refine(
    (data) => {
        // Validate unique IDs for publications
        if (data.publications) {
            const ids = data.publications.items.map((p) => p.id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                return false;
            }
        }

        // Validate unique IDs for projects
        if (data.projects) {
            const ids = data.projects.items.map((p) => p.id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                return false;
            }
        }

        // Validate unique IDs for experience
        if (data.experience) {
            const ids = data.experience.items.map((e) => e.id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                return false;
            }
        }

        return true;
    },
    { message: 'Duplicate IDs found in publications, projects, or experience' }
);

export type InfoData = z.infer<typeof infoSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
