"""Publish the photo albums in gallery/ to the site.

    python3 scripts/build_gallery.py      # needs Pillow, and pillow-heif for .heic photos

gallery/<album>/ holds the original photos and an optional album.json. The originals are not in
git: phone photos carry GPS and full resolution. For each photo this writes upright sRGB WebP
copies with no metadata to public/gallery/<album>/, and it rewrites src/data/gallery.json, which
the pages read, with each photo's date in AoE when its time zone is known. Photos already written
and not changed since are kept as they are. See gallery/README.md.
"""
import io
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pillow_heif = None

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'gallery'
OUT = ROOT / 'public' / 'gallery'
DATA = ROOT / 'src' / 'data' / 'gallery.json'
LONG_EDGES = (640, 1280, 2200)   # thumbnails, phones and tiles, the large view
PHOTO_TYPES = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}
SRGB = ImageCms.createProfile('sRGB')
AOE = timezone(timedelta(hours=-12))   # Anywhere on Earth


def slugify(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    if not slug:
        sys.exit(f'{name}: no usable letters for a web address; set "slug" in its album.json')
    return slug


def taken_at(im):
    """When the photo was taken, and whether that is in AoE. The time zone comes from the EXIF offset,
    or else the GPS clock, which runs on UTC (only the time is read, never the place). With neither,
    it is the time as the camera wrote it. DateTimeOriginal comes first: DateTime changes on editing."""
    exif = im.getexif()
    sub, gps = exif.get_ifd(0x8769), exif.get_ifd(0x8825)
    try:
        local = datetime.strptime(str(sub.get(36867) or exif.get(306)).strip(), '%Y:%m:%d %H:%M:%S')
    except ValueError:
        local = None

    utc = None
    offset = re.fullmatch(r'([+-])(\d\d):(\d\d)', str(sub.get(36881) or sub.get(36880) or '').strip())
    if local and offset:
        delta = timedelta(hours=int(offset[2]), minutes=int(offset[3]))
        utc = local - delta if offset[1] == '+' else local + delta
    elif gps.get(29) and gps.get(7):
        try:
            h, m, s = (float(v) for v in gps[7])
            utc = datetime.strptime(str(gps[29]).strip(), '%Y:%m:%d') + timedelta(hours=h, minutes=m, seconds=s)
        except (TypeError, ValueError):
            pass
    if utc:
        return utc.replace(tzinfo=timezone.utc).astimezone(AOE).replace(tzinfo=None), True
    return local, False


def load(path):
    """The photo upright and in sRGB. iPhones shoot Display P3, which looks washed out if read as sRGB."""
    im = Image.open(path)
    taken, icc = taken_at(im), im.info.get('icc_profile')
    im = ImageOps.exif_transpose(im).convert('RGB')
    if icc:
        try:
            im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(icc)), SRGB, outputMode='RGB')
        except ImageCms.PyCMSError as e:
            print(f'  {path.name}: colour profile not applied ({e})')
    return im, taken


def outputs(slug, pid, width, height):
    long_edge = max(width, height)
    widths = sorted({round(width * min(edge, long_edge) / long_edge) for edge in LONG_EDGES})
    return widths, [OUT / slug / f'{pid}-{w}.webp' for w in widths]


def publish(path, slug, pid, known):
    """Write one photo's copies; returns its size, widths, placeholder colour and capture time."""
    if known:
        widths, files = outputs(slug, pid, known['width'], known['height'])
        if all(f.exists() and f.stat().st_mtime >= path.stat().st_mtime for f in files):
            with Image.open(path) as im:
                return known['width'], known['height'], widths, known['color'], taken_at(im)
    im, taken = load(path)
    width, height = im.size
    widths, files = outputs(slug, pid, width, height)
    for w, f in zip(widths, files):
        im.resize((w, round(height * w / width)), Image.LANCZOS).save(f, 'WEBP', quality=80, method=6)
        with Image.open(f) as check:
            leaked = {'exif', 'xmp', 'icc_profile'} & set(check.info)
        if leaked:
            sys.exit(f'{f}: still carries {leaked}')
        print(f'  {f.relative_to(ROOT)} {f.stat().st_size // 1024} KB')
    r, g, b = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    return width, height, widths, f'#{r:02x}{g:02x}{b:02x}', taken


def day(d):
    return f'{d:%b} {d.day}, {d.year}'


def day_span(taken):
    """The album's dates from (time, is AoE) pairs. It says AoE only if every photo's date is in AoE."""
    if not taken:
        return None
    first, last = min(t for t, _ in taken), max(t for t, _ in taken)
    if first.date() == last.date():
        span = day(first)
    elif (first.year, first.month) == (last.year, last.month):
        span = f'{first:%b} {first.day}–{last.day}, {first.year}'
    elif first.year == last.year:
        span = f'{first:%b} {first.day} – {last:%b} {last.day}, {first.year}'
    else:
        span = f'{day(first)} – {day(last)}'
    return f'{span} (AoE)' if all(aoe for _, aoe in taken) else span


def og_card(slug, photo):
    """A 1200x630 JPEG of the cover for link previews, which do not all read WebP."""
    with Image.open(OUT / slug / f"{photo['id']}-{photo['widths'][-1]}.webp") as im:
        im = ImageOps.fit(im.convert('RGB'), (1200, 630), Image.LANCZOS)
    im.save(OUT / slug / 'og.jpg', 'JPEG', quality=84, optimize=True, progressive=True)


def main():
    previous = {}
    if DATA.exists():
        for a in json.loads(DATA.read_text(encoding='utf-8'))['albums']:
            for p in a['photos']:
                previous[(a['slug'], p['id'])] = p

    albums, by_file = [], {}
    for folder in sorted(d for d in SRC.iterdir() if d.is_dir() and not d.name.startswith(('.', '_'))):
        meta_file = folder / 'album.json'
        meta = json.loads(meta_file.read_text(encoding='utf-8')) if meta_file.exists() else {}
        files = sorted(f for f in folder.iterdir() if f.suffix.lower() in PHOTO_TYPES and not f.name.startswith('.'))
        if not files:
            continue
        slug = meta.get('slug') or slugify(folder.name)
        (OUT / slug).mkdir(parents=True, exist_ok=True)
        print(slug)

        listed = {e['file']: e for e in meta.get('photos', [])}
        order = meta.get('order') or ([meta['cover']] if meta.get('cover') else [])
        for name in [*listed, *order]:
            if not (folder / name).exists():
                sys.exit(f'{meta_file}: no photo named {name}')
        rows = []
        for path in files:
            pid = slugify(path.stem)
            width, height, widths, color, (taken, aoe) = publish(path, slug, pid, previous.get((slug, pid)))
            entry = listed.get(path.name, {})
            rows.append((path.name, taken, aoe, {
                'id': pid, 'width': width, 'height': height, 'widths': widths, 'color': color,
                'alt': entry.get('alt') or entry.get('caption') or f"Photo from {meta.get('title', folder.name)}",
                **({'caption': entry['caption']} if entry.get('caption') else {}),
                **({'position': entry['position']} if entry.get('position') else {}),
                **({'date': day(taken) + (' (AoE)' if aoe else '')} if taken else {}),
            }))
        # the order album.json gives, or else the cover first; then the rest by when they were taken
        rows.sort(key=lambda r: (order.index(r[0]) if r[0] in order else len(order), r[1] or datetime.max, r[0]))
        photos = [r[3] for r in rows]
        taken = [(r[1], r[2]) for r in rows if r[1]]

        cover = next((r[3]['id'] for r in rows if r[0] == meta.get('cover')), photos[0]['id'])
        og_card(slug, next(p for p in photos if p['id'] == cover))
        albums.append({
            'slug': slug,
            'title': meta.get('title') or folder.name.replace('-', ' ').title(),
            **({'context': meta['context']} if meta.get('context') else {}),
            **({'date': meta.get('date') or day_span(taken)} if meta.get('date') or taken else {}),
            **({'link': meta['link']} if meta.get('link') else {}),
            'cover': cover,
            'photos': photos,
            '_sort': meta.get('sort') or (max(t for t, _ in taken).strftime('%Y-%m-%d') if taken else ''),
        })
        for name, _, _, photo in rows:
            by_file[f'{folder.name}/{name}'] = (slug, photo['id'])

    albums.sort(key=lambda a: a.pop('_sort'), reverse=True)

    # anything published earlier that is no longer in an album goes
    keep = {OUT / a['slug'] / 'og.jpg' for a in albums}
    for a in albums:
        for p in a['photos']:
            keep |= set(outputs(a['slug'], p['id'], p['width'], p['height'])[1])
    for f in OUT.rglob('*'):
        if f.is_file() and f not in keep:
            f.unlink()
            print('removed', f.relative_to(ROOT))
    for d in OUT.iterdir() if OUT.exists() else []:
        if d.is_dir() and not any(d.iterdir()):
            d.rmdir()

    settings = SRC / 'gallery.json'
    wanted = json.loads(settings.read_text(encoding='utf-8')).get('featured', []) if settings.exists() else []
    for name in wanted:
        if name not in by_file:
            sys.exit(f'gallery/gallery.json: no photo named {name}')
    featured = [{'album': by_file[n][0], 'photo': by_file[n][1]} for n in wanted]
    if not featured and albums:
        featured = [{'album': albums[0]['slug'], 'photo': p['id']} for p in albums[0]['photos'][:3]]

    DATA.write_text(json.dumps({'featured': featured, 'albums': albums}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f"{DATA.relative_to(ROOT)}: {len(albums)} albums, {sum(len(a['photos']) for a in albums)} photos")


if __name__ == '__main__':
    main()
