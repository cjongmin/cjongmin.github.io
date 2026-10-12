"""Link-preview cards (1200x630 JPEG) for talk posts, shown when a post's
share page (/talks/<id>/) is posted on LinkedIn, Slack, KakaoTalk, X.

    python3 scripts/talk_og.py            # needs Pillow; writes public/talks/og/<id>.jpg

Each card is the talk's cover photo under a dark gradient with the event, the
paper title and the series number. Re-run after adding a talk or changing a title.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'cv' / 'fonts'
W, H, PAD = 1200, 630, 64


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def wrap(draw, text, fnt, width):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line); line = word
    return lines + [line]


def card(talk):
    cover = Image.open(ROOT / 'public' / talk['cover'].lstrip('/')).convert('RGB')
    scale = max(W / cover.width, H / cover.height)
    cover = cover.resize((round(cover.width * scale), round(cover.height * scale)), Image.LANCZOS)
    left, top = (cover.width - W) // 2, (cover.height - H) // 2
    img = cover.crop((left, top, left + W, top + H))

    # dark gradient rising from the bottom so the text reads on any photo
    shade = Image.new('L', (1, H))
    for y in range(H):
        t = max(0.0, (y - H * 0.04) / (H * 0.96))
        shade.putpixel((0, y), int(255 * min(0.9, 0.22 + 0.78 * t ** 0.85)))
    img = Image.composite(Image.new('RGB', (W, H), (8, 10, 18)), img, shade.resize((W, H)))

    d = ImageDraw.Draw(img)
    eyebrow = ' · '.join(x for x in (talk['event'], talk['type'], talk.get('location', '').split(',')[0]) if x).upper()
    title_font = font('SourceSans3-Bold.ttf', 50)
    lines = wrap(d, talk['title'], title_font, W - 2 * PAD)[:3]
    y = H - PAD - 34 - 18 - len(lines) * 60 - 16 - 30
    d.text((PAD, y), eyebrow, font=font('SourceSans3-Semibold.ttf', 26), fill=(255, 255, 255, 230)); y += 30 + 16
    for line in lines:
        d.text((PAD, y), line, font=title_font, fill='white'); y += 60
    y += 18
    d.text((PAD, y), f"Presentation Notes #{talk['no']}  ·  Jongmin Choi  ·  cjongmin.github.io",
           font=font('SourceSans3-Regular.ttf', 26), fill=(215, 218, 226))
    return img


def main():
    out = ROOT / 'public' / 'talks' / 'og'
    out.mkdir(parents=True, exist_ok=True)
    for talk in json.loads((ROOT / 'src' / 'data' / 'talks.json').read_text()):
        if not talk.get('published') or not talk.get('cover'):
            continue
        path = out / f"{talk['id']}.jpg"
        card(talk).save(path, 'JPEG', quality=86, optimize=True, progressive=True)
        print(path.relative_to(ROOT), f'{path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
