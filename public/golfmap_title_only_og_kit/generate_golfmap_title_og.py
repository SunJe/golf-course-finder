#!/usr/bin/env python3
"""
GolfMap Korea title-only OG image generator.
- Fixed master template image: golfmap_og_base_no_title.png
- Only title changes.
- Output: 1200x1200 PNG.

Usage:
  python generate_golfmap_title_og.py --title "나인홀 골프장" --out nine-hole.png
  python generate_golfmap_title_og.py --csv titles.csv --out-dir ./out

CSV columns: slug,title
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import argparse, csv, os

TITLE_COLOR=(2,65,54,255)
FONT_CANDIDATES=[
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    'C:/Windows/Fonts/malgunbd.ttf',
    'C:/Windows/Fonts/malgun.ttf',
]

def pick_font():
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    raise FileNotFoundError('No Korean font found. Install Noto Sans CJK KR or use C:/Windows/Fonts/malgunbd.ttf')

def fit_font(draw, text, font_path, max_width=760, start=126, min_size=74):
    for size in range(start, min_size-1, -2):
        font=ImageFont.truetype(font_path, size)
        bbox=draw.textbbox((0,0), text, font=font)
        if bbox[2]-bbox[0] <= max_width:
            return font, size, [text]
    parts=text.split(' ')
    if len(parts)>=2:
        line1=' '.join(parts[:-1]); line2=parts[-1]
    else:
        n=len(text); line1=text[:max(1,n//2)]; line2=text[max(1,n//2):]
    for size in range(96, 62, -2):
        font=ImageFont.truetype(font_path, size)
        widths=[draw.textbbox((0,0), l, font=font)[2] for l in [line1,line2]]
        if max(widths)<=max_width:
            return font,size,[line1,line2]
    return ImageFont.truetype(font_path, 64),64,[line1,line2]

def render(base_path, title, out_path):
    font_path=pick_font()
    img=Image.open(base_path).convert('RGBA')
    draw=ImageDraw.Draw(img)
    font,size,lines=fit_font(draw,title,font_path)
    x=75
    if len(lines)==1:
        y=768 - max(0,(size-118))*0.25
        draw.text((x,y), lines[0], font=font, fill=TITLE_COLOR)
    else:
        y=730
        for line in lines:
            draw.text((x,y), line, font=font, fill=TITLE_COLOR)
            y += size + 4
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, optimize=True)

if __name__ == '__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--base', default='golfmap_og_base_no_title.png')
    ap.add_argument('--title')
    ap.add_argument('--out')
    ap.add_argument('--csv')
    ap.add_argument('--out-dir', default='out')
    args=ap.parse_args()
    if args.csv:
        with open(args.csv, newline='', encoding='utf-8-sig') as f:
            for row in csv.DictReader(f):
                render(args.base, row['title'], Path(args.out_dir)/f"{row['slug']}.png")
    else:
        if not args.title or not args.out:
            raise SystemExit('Need --title and --out, or --csv and --out-dir')
        render(args.base, args.title, args.out)
