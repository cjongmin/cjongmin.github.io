# AI Researcher Profile Website 🎓

A production-ready, single-source-of-truth academic profile website built with Next.js, TypeScript, and Tailwind CSS. Designed specifically for researchers and academics, deployed via GitHub Pages.

## ✨ Features

- **Single-Source Content**: Edit ONLY `/data/info.json` - no code changes needed
- **Comprehensive Validation**: Zod schema validation with clear error messages
- **Responsive Design**: Beautiful on desktop, tablet, and mobile
- **Publications Management**: Search, filter, sort with BibTeX export
- **Dark Mode**: Optional theme toggle with localStorage persistence
- **SEO Optimized**: OpenGraph, Twitter Cards, proper metadata
- **GitHub Pages Ready**: Supports both user/org and project page deployments
- **Academic Features**: Author highlighting, citation metrics, CV download, project showcases

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
npm install
```

### 2. Edit Your Content

**This is the ONLY file you need to edit:**

```bash
# Edit /data/info.json with your information
nano data/info.json
```

Add your:
- Profile information (name, affiliation, bio)
- Publications with BibTeX
- Projects
- Experience/education
- CV and contact details

### 3. Add Your Assets

```bash
# Add your headshot
cp your-photo.jpg public/assets/headshot.jpg

# Add your CV
cp your-cv.pdf public/pdfs/cv.pdf

# (Optional) Add custom OG image
cp your-og-image.png public/assets/og.png
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📝 Content Editing Guide

### Structure of info.json

Your `/data/info.json` contains all website content:

```json
{
  "site": {
    "title": "Your Name - Researcher",
    "description": "Brief description",
    "theme": {
      "defaultMode": "light",
      "allowToggle": true
    },
    "lastUpdated": "auto"
  },
  "profile": {
    "name": { "full": "...", "preferred": "..." },
    "tagline": "...",
    "email": { "address": "...", "display": "plain" },
    // ... more fields
  },
  "publications": {
    "settings": {
      "authorEmphasis": {
        "myNameVariants": ["Your Name", "Y. Name"],
        "style": "bold"
      },
      "collapseYears": {
        "enabled": true,
        "expandedYearsCount": 2
      }
    },
    "items": [
      {
        "id": "unique-id",
        "title": "Paper Title",
        "authorsList": ["Author 1", "Author 2"],
        "venue": { "name": "Conference", "short": "CONF" },
        "year": 2024,
        "type": "conference",
        "bibtex": "@inproceedings{...}",
        // ... more fields
      }
    ]
  }
  // ... more sections
}
```

### Adding a Publication

1. Give it a unique `id` (e.g., `"yourname2024title"`)
2. Fill in required fields: `title`, `authorsList`, `venue`, `year`, `type`, `bibtex`
3. Add optional fields: `links` (pdf, code, etc.), `awards`, `keywords`, `abstract`

### Enabling/Disabling Sections

Set `enabled: false` in `sections` to hide a section:

```json
{
  "sections": {
    "publications": { "enabled": true, "label": "Publications" },
    "teaching": { "enabled": false, "label": "Teaching" }
  }
}
```

## ✅ Validation

Before building, validate your `info.json`:

```bash
npm run validate
```

This will check for:
- Missing required fields
- Invalid year ranges
- Duplicate IDs
- Malformed URLs
- Empty BibTeX entries

## 🌐 Deployment to GitHub Pages

### Mode A: User/Organization Page (`username.github.io`)

1. **Repository name must be**: `<username>.github.io`

2. **Leave `NEXT_PUBLIC_BASE_PATH` empty** in `.github/workflows/deploy.yml`

3. **GitHub Settings**:
   - Go to Settings → Pages
   - Source: GitHub Actions

4. **Push to main**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

5. Visit: `https://username.github.io/`

### Mode B: Project Page (`username.github.io/repo`)

1. **Any repository name** (e.g., `my-academic-site`)

2. **Edit `.github/workflows/deploy.yml`**:
   ```yaml
   env:
     NEXT_PUBLIC_BASE_PATH: /your-repo-name  # ← Uncomment and set this
   ```

3. **GitHub Settings**:
   - Go to Settings → Pages
   - Source: GitHub Actions

4. **Push to main**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

5. Visit: `https://username.github.io/your-repo-name/`

### Verify Deployment

After pushing, check:
- Actions tab: Workflow should run successfully
- Your site loads at the URL
- Images and assets load correctly
- Dark mode toggle works (if enabled)

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to change color palette:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Main accent color */
  /* ... other colors */
}
```

### Fonts

Edit `src/app/layout.tsx`:

```typescript
import { Inter, Roboto } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
// Use different font
```

## 📁 Project Structure

```
profilepage/
├── data/
│   └── info.json          ← EDIT THIS ONLY
├── public/
│   ├── assets/
│   │   ├── headshot.jpg   ← Your photo
│   │   └── og.png         ← Social preview
│   └── pdfs/
│       └── cv.pdf         ← Your CV
├── src/
│   ├── app/               ← Next.js App Router
│   ├── components/        ← React components
│   └── lib/
│       ├── schema.ts      ← Zod validation
│       ├── loadInfo.ts    ← Data loader
│       └── utils.ts       ← Helper functions
├── .github/workflows/
│   └── deploy.yml         ← GitHub Actions
└── next.config.ts         ← Static export config
```

## 🐛 Troubleshooting

### Build fails with validation errors

Run `npm run validate` to see detailed errors. Common issues:
- Missing required fields in `info.json`
- Duplicate publication IDs
- Invalid year or date formats
- Empty `bibtex` field

### Images don't load on GitHub Pages

Ensure you're using the correct `NEXT_PUBLIC_BASE_PATH` in deployment workflow. For project pages, this must match your repository name.

### Dark mode doesn't persist

Check that `site.theme.allowToggle` is `true` in `info.json`. The theme is saved in localStorage and should persist across sessions.

### Publications not showing

Check that:
1. `sections.publications.enabled` is `true`
2. `publications.items` array has entries
3. Each publication has required fields (especially `bibtex`)

## 📚 Advanced Features

### Author Name Highlighting

Automatically highlights your name in publication author lists:

```json
{
  "publications": {
    "settings": {
      "authorEmphasis": {
        "myNameVariants": ["Jane Doe", "J. Doe", "Jane A. Doe"],
        "style": "bold"  // or "underline" or "highlight"
      }
    }
  }
}
```

### Collapsed Years for Large Publication Lists

For better performance with 50+ publications:

```json
{
  "publications": {
    "settings": {
      "collapseYears": {
        "enabled": true,
        "expandedYearsCount": 2  // Show most recent 2 years
      }
    }
  }
}
```

### Auto Last-Updated Timestamp

The workflow automatically injects the last git commit date:

```json
{
  "site": {
    "lastUpdated": "auto"  // Uses git commit date
  }
}
```

Or set manually:

```json
{
  "site": {
    "lastUpdated": "manual",
    "lastUpdatedValue": "January 2026"
  }
}
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.
