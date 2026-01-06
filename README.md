# AI Researcher Profile (GitHub Pages)

Minimal academic profile site in English with responsive layout and clean design.

Pages: `About (index)`, `Publications`, `Awards`, `Contact`.

Includes prominent buttons for CV (PDF), Google Scholar, GitHub, LinkedIn, and Mail.

## Local preview
Open `index.html` directly or run a static server:

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Deploy (two options)

### A) User site: `USERNAME.github.io`
```bash
git init
git add .
git commit -m "init: profile site"
git branch -M main
git remote add origin git@github.com:USERNAME/USERNAME.github.io.git
git push -u origin main
```
Then open `https://USERNAME.github.io`.

### B) Project site via Pages
Push to any repo, then Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.

## Customize
- Edit `assets/info.json` only — all pages render from it.
- Put your photo at `assets/images/profile.jpg` and CV at `assets/cv/cv.pdf`.
- Colors/spacing: `assets/css/styles.css`.
- Buttons, animations, theme toggle already included.

### Theme toggle
The site respects system preference by default. Use the toggle (☾/☀) to switch and it persists in `localStorage`.

### BibTeX (optional)
Publications page aggregates `bibtex` fields from `assets/info.json` into the BibTeX block automatically.

## `assets/info.json` schema
```json
{
  "profile": {
    "name": "Your Name",
    "title": "AI Researcher — ...",
    "email": "you@example.com",
    "affiliation": "Your Affiliation",
    "bio": "2–3 sentence intro...",
    "photo": "assets/images/profile.jpg",
    "cv": "assets/cv/cv.pdf",
    "links": { "scholar": "", "github": "", "linkedin": "" },
    "interests": ["LLMs", "Multimodal", "…"]
  },
  "news": [{ "date": "YYYY-MM-DD", "text": "Update…" }],
  "publications": [{
    "title": "...",
    "authors": "...",
    "venue": "In Conf/Journal, Year",
    "pdf": "https://...",
    "doi": "https://doi.org/...",
    "code": "https://github.com/...",
    "bibtex": "@inproceedings{...}"
  }],
  "awards": [{ "year": "2025", "name": "Best Paper", "by": "Conf" }],
  "stats": { "publications": 0, "awards": 0 }
}
```

## License
MIT (replace if needed)

