"use client";

import { useState } from "react";
import SafeContentImage from "@/components/content/SafeContentImage";
import { getOfficialPhotosForEvent } from "@/lib/tournamentOfficialPhotos";

type TournamentOfficialGalleryProps = {
  eventSlug: string;
  photoIds?: string[];
  /** Optional override; defaults to each photo's caption + source link */
  creditLine?: string;
  className?: string;
};

export function TournamentOfficialGallery({
  eventSlug,
  photoIds,
  creditLine,
  className = "",
}: TournamentOfficialGalleryProps) {
  const photos = getOfficialPhotosForEvent(eventSlug, photoIds);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const visible = photos.filter((photo) => !failed.has(photo.localPath));
  if (visible.length === 0) return null;

  const sourcePages = Array.from(
    new Set(visible.map((photo) => photo.sourcePage).filter(Boolean)),
  );

  const captionText =
    creditLine ??
    (visible.length === 1
      ? visible[0]!.caption
      : visible
          .map((photo) => photo.caption)
          .filter((value, index, arr) => arr.indexOf(value) === index)
          .join(" · "));

  return (
    <figure className={`mt-5 ${className}`}>
      <div
        className={
          visible.length === 1
            ? "overflow-hidden rounded-2xl border border-stone-200 bg-white"
            : "flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
        aria-label="공식 대회 사진"
      >
        {visible.map((photo) => (
          <div
            key={photo.id}
            className={
              visible.length === 1
                ? "w-full"
                : "w-[88%] shrink-0 snap-start overflow-hidden rounded-2xl border border-stone-200 bg-white sm:w-[320px]"
            }
          >
            <SafeContentImage
              src={photo.localPath}
              alt={photo.alt}
              width={photo.width || 1200}
              height={photo.height || 800}
              className="h-auto max-h-[420px] w-full object-contain"
              sizes="(max-width: 640px) 88vw, 640px"
              onImageError={() =>
                setFailed((prev) => {
                  if (prev.has(photo.localPath)) return prev;
                  const next = new Set(prev);
                  next.add(photo.localPath);
                  return next;
                })
              }
            />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-stone-500">
        {captionText}
        {sourcePages.length === 1 ? (
          <>
            {" · "}
            <a
              href={sourcePages[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              원문 보기
            </a>
          </>
        ) : sourcePages.length > 1 ? (
          <>
            {" · "}
            {sourcePages.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-2 font-medium text-brand-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                원문 {index + 1}
              </a>
            ))}
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
