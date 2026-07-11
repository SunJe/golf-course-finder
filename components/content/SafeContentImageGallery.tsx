"use client";

import { useMemo, useState } from "react";
import SafeContentImage from "@/components/content/SafeContentImage";

export type SafeContentGalleryImage = {
  src: string;
  alt: string;
};

export type SafeContentImageGalleryProps = {
  images: SafeContentGalleryImage[];
  /** Shown only while at least one image is visible. */
  credit?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  /** Fixed height classes for gallery tiles. */
  heightClassName?: string;
  /** Width for multi-image scroll tiles; ignored for single image. */
  widthClassName?: string;
};

function normalizeImages(
  images: SafeContentGalleryImage[],
): SafeContentGalleryImage[] {
  const seen = new Set<string>();
  const out: SafeContentGalleryImage[] = [];
  for (const image of images) {
    const src = image.src?.trim() ?? "";
    if (!src || src === "undefined" || src === "null") continue;
    if (seen.has(src)) continue;
    seen.add(src);
    out.push({ src, alt: image.alt || "" });
  }
  return out;
}

const DEFAULT_HEIGHT = "h-[200px] sm:h-[220px]";
const DEFAULT_WIDTH = "w-[300px] sm:w-[360px]";
const SCROLL_ROW =
  "flex gap-2 overflow-x-auto overscroll-x-contain border-t border-stone-100 bg-stone-100 p-2 touch-pan-x snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/**
 * Content gallery that drops failed/empty URLs and hides entirely when none remain.
 */
export default function SafeContentImageGallery({
  images,
  credit,
  className = "",
  imageClassName = "object-cover",
  sizes = "(max-width: 640px) 300px, 360px",
  heightClassName = DEFAULT_HEIGHT,
  widthClassName = DEFAULT_WIDTH,
}: SafeContentImageGalleryProps) {
  const initial = useMemo(() => normalizeImages(images), [images]);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());

  const visible = initial.filter((image) => !failed.has(image.src));

  if (visible.length === 0) return null;

  const markFailed = (src: string) => {
    setFailed((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  const single = visible.length === 1;

  return (
    <div className={className}>
      <div
        className={
          single
            ? `border-t border-stone-100 bg-stone-100 p-2`
            : SCROLL_ROW
        }
        aria-label="사진 목록"
      >
        {visible.map((image) => (
          <div
            key={image.src}
            className={
              single
                ? `relative w-full overflow-hidden rounded-lg bg-stone-100 ${heightClassName}`
                : `relative shrink-0 snap-start overflow-hidden rounded-lg bg-stone-100 ${widthClassName} ${heightClassName}`
            }
          >
            <SafeContentImage
              src={image.src}
              alt={image.alt}
              fill
              className={imageClassName}
              sizes={single ? "(max-width: 768px) 100vw, 900px" : sizes}
              onImageError={markFailed}
            />
          </div>
        ))}
      </div>
      {credit ? (
        <p className="border-b border-stone-100 bg-stone-100 px-4 py-2 text-xs text-stone-500 sm:px-5">
          {credit}
        </p>
      ) : null}
    </div>
  );
}
