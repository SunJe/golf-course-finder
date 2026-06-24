#!/usr/bin/env python3
"""
GolfMap Korea title-only OG image generator.
Fixed base image + title text overlay only. Output: 1200x1200 PNG.

Usage:
  python scripts/generateGolfMapTitleOg.py --csv data/seo-image-titles.csv
  python scripts/generateGolfMapTitleOg.py --title "나인홀 골프장" --out public/seo-images/collections/nine-hole.png
"""
from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

TITLE_COLOR = (2, 65, 54, 255)

FONT_CANDIDATES = [
    "public/seo-assets/fonts/malgunbd.ttf",
    "C:/Windows/Fonts/malgunbd.ttf",
    "C:/Windows/Fonts/NotoSansKR-VF.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
]


def project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def resolve_path(root: Path, value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else root / path


def pick_font(root: Path) -> str:
    for candidate in FONT_CANDIDATES:
        path = resolve_path(root, candidate)
        if path.exists():
            return str(path)
    raise FileNotFoundError(
        "No Korean font found. Place malgunbd.ttf in public/seo-assets/fonts/ "
        "or install Noto Sans CJK KR."
    )


def split_balanced_two_lines(text: str, font_path: str, size: int, draw: ImageDraw.ImageDraw) -> tuple[str, str]:
    words = text.strip().split()
    if len(words) >= 2:
        best_split = 1
        best_diff = float("inf")
        for i in range(1, len(words)):
            line1 = " ".join(words[:i])
            line2 = " ".join(words[i:])
            w1 = draw.textbbox((0, 0), line1, font=ImageFont.truetype(font_path, size))[2]
            w2 = draw.textbbox((0, 0), line2, font=ImageFont.truetype(font_path, size))[2]
            diff = abs(w1 - w2)
            if diff < best_diff:
                best_diff = diff
                best_split = i
        return " ".join(words[:best_split]), " ".join(words[best_split:])

    best_split = max(1, len(text) // 2)
    best_diff = float("inf")
    font = ImageFont.truetype(font_path, size)
    for i in range(1, len(text)):
        line1 = text[:i]
        line2 = text[i:]
        w1 = draw.textbbox((0, 0), line1, font=font)[2]
        w2 = draw.textbbox((0, 0), line2, font=font)[2]
        diff = abs(w1 - w2)
        if diff < best_diff:
            best_diff = diff
            best_split = i
    return text[:best_split], text[best_split:]


def fit_font(draw: ImageDraw.ImageDraw, text: str, font_path: str, max_width: int = 760, start: int = 126, min_size: int = 74):
    for size in range(start, min_size - 1, -2):
        font = ImageFont.truetype(font_path, size)
        bbox = draw.textbbox((0, 0), text, font=font)
        if bbox[2] - bbox[0] <= max_width:
            return font, size, [text]

    for size in range(96, 62, -2):
        line1, line2 = split_balanced_two_lines(text, font_path, size, draw)
        font = ImageFont.truetype(font_path, size)
        widths = [draw.textbbox((0, 0), line, font=font)[2] for line in [line1, line2]]
        if max(widths) <= max_width:
            return font, size, [line1, line2]

    line1, line2 = split_balanced_two_lines(text, font_path, 64, draw)
    font = ImageFont.truetype(font_path, 64)
    return font, 64, [line1, line2]


def render(base_path: Path, title: str, out_path: Path, font_path: str) -> None:
    img = Image.open(base_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    font, size, lines = fit_font(draw, title, font_path)

    x = 75
    if len(lines) == 1:
        y = 768 - max(0, (size - 118)) * 0.25
        draw.text((x, y), lines[0], font=font, fill=TITLE_COLOR)
    else:
        y = 730
        for line in lines:
            draw.text((x, y), line, font=font, fill=TITLE_COLOR)
            y += size + 4

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, optimize=True)


def load_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def main() -> int:
    root = project_root()
    default_base = root / "public/seo-assets/golfmap_og_base_no_title.png"
    default_csv = root / "data/seo-image-titles.csv"

    parser = argparse.ArgumentParser(description="Generate GolfMap title-only OG images from CSV.")
    parser.add_argument("--base", default=str(default_base), help="Base PNG without title")
    parser.add_argument("--csv", default=str(default_csv), help="Title manifest CSV")
    parser.add_argument("--title", help="Single title (use with --out)")
    parser.add_argument("--out", help="Single output PNG path")
    parser.add_argument("--limit", type=int, default=0, help="Process only first N rows (0 = all)")
    args = parser.parse_args()

    base_path = resolve_path(root, args.base)
    if not base_path.exists():
        print(f"Base image not found: {base_path}", file=sys.stderr)
        return 1

    font_path = pick_font(root)

    if args.title and args.out:
        render(base_path, args.title, resolve_path(root, args.out), font_path)
        print(f"Wrote {args.out}")
        return 0

    csv_path = resolve_path(root, args.csv)
    if not csv_path.exists():
        print(f"CSV not found: {csv_path}", file=sys.stderr)
        return 1

    rows = load_rows(csv_path)
    if args.limit and args.limit > 0:
        rows = rows[: args.limit]

    written = 0
    for index, row in enumerate(rows, start=1):
        title = (row.get("title") or "").strip()
        if not title:
            print(f"[skip] row {index}: empty title (slug={row.get('slug', '')})")
            continue

        output_value = (row.get("output_path") or "").strip()
        if output_value:
            out_path = resolve_path(root, output_value)
        else:
            slug = (row.get("slug") or f"row-{index}").strip()
            out_path = root / "public/seo-images" / f"{slug}.png"

        render(base_path, title, out_path, font_path)
        written += 1
        if written <= 5 or written % 100 == 0 or written == len(rows):
            print(f"[{written}/{len(rows)}] {out_path.as_posix()}")

    print(f"Done. Generated {written} image(s) from {csv_path.as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
