"""Smaller copies of each talk cover for the home-page carousel's srcset.

    python3 scripts/responsive_images.py      # needs Pillow

For public/talks/<name>.webp (the 2000px covers) it writes <name>-960.webp and
<name>-1440.webp next to it. Re-run after adding or replacing a cover.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (960, 1440)

for src in sorted((ROOT / 'public' / 'talks').glob('*.webp')):
    if src.stem.endswith(tuple(f'-{w}' for w in WIDTHS)):
        continue
    im = Image.open(src).convert('RGB')
    for w in WIDTHS:
        if im.width <= w:
            continue
        out = src.with_name(f'{src.stem}-{w}.webp')
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
        print(out.relative_to(ROOT), f'{out.stat().st_size // 1024} KB')
