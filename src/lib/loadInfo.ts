/**
 * Data loader with validation for info.json
 * Build-time only - reads and validates data during static generation
 */

import fs from 'fs';
import path from 'path';
import { infoSchema, type InfoData, type Publication } from './schema';
import { parseAuthors } from './utils';

/**
 * Load and validate info.json
 * This runs at build time only (server-side)
 */
export function loadInfo(): InfoData {
    try {
        const filePath = path.join(process.cwd(), 'data', 'info.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const rawData = JSON.parse(fileContents);

        // Validate with Zod
        const validationResult = infoSchema.safeParse(rawData);

        if (!validationResult.success) {
            console.error('\n❌ VALIDATION FAILED: Invalid /data/info.json\n');
            console.error('Errors:\n');

            validationResult.error.issues.forEach((error) => {
                const fieldPath = error.path.join('.');
                console.error(`  • ${fieldPath || 'root'}: ${error.message}`);
            });

            console.error('\nPlease fix the errors above and try again.\n');
            process.exit(1);
        }

        const data = validationResult.data;

        // Normalize publications: convert authors string to authorsList
        if (data.publications) {
            data.publications.items = data.publications.items.map((pub) => {
                if (!pub.authorsList && pub.authors) {
                    return {
                        ...pub,
                        authorsList: parseAuthors(pub.authors),
                    };
                }
                return pub as Publication;
            });
        }

        return data;

    } catch (error) {
        if (error instanceof Error) {
            if ('code' in error && error.code === 'ENOENT') {
                console.error('\n❌ ERROR: /data/info.json not found\n');
                console.error('Please create /data/info.json with your profile information.\n');
                console.error('See /data/info.example.json for reference.\n');
            } else if (error instanceof SyntaxError) {
                console.error('\n❌ ERROR: Invalid JSON in /data/info.json\n');
                console.error(error.message);
                console.error('\nPlease check your JSON syntax.\n');
            } else {
                console.error('\n❌ ERROR: Failed to load /data/info.json\n');
                console.error(error.message);
            }
        }
        process.exit(1);
    }
}
