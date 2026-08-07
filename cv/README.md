# CV

The CV is authored as HTML + CSS ([cv.html](cv.html)) and rendered to PDF with
[WeasyPrint](https://weasyprint.org/). Fonts are embedded from `fonts/`, so the
output is identical on any machine — no LaTeX toolchain required.

## Rebuild

```bash
# one-time setup
conda create -n cvpdf -c conda-forge -y python=3.11 weasyprint

./build.sh          # → cv/Jongmin_Choi_CV.pdf and public/Jongmin_Choi_CV.pdf
```

`build.sh` also copies the PDF into `public/`, which is what the website's
**CV** button links to (`cvFile` in `src/data/profile.json`).

## Editing

Everything lives in `cv.html`: content in the `<body>`, styling in the `<style>`
block at the top. The layout is tuned to fit on a single page — if you add
entries, check the page count after rebuilding and adjust `section { margin-top }`
or the base `font-size` if it spills onto a second page.

Fonts: Source Serif 4 (headings, titles) + Source Sans 3 (body), with a Noto Sans KR
subset covering only the Korean glyphs used in the document.
