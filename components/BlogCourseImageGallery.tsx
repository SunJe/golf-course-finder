"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SafeContentImage from "@/components/content/SafeContentImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";

interface BlogCourseImageGalleryProps {
  images: string[];
  courseName: string;
  regionLabel?: string;
  imageCredit?: string;
}

const IMAGE_HEIGHT_CLASS = "h-[220px] sm:h-[240px] md:h-[260px]";
const IMAGE_WIDTH_CLASS = "w-[300px] sm:w-[360px]";

const SCROLL_ROW_CLASS =
  "flex gap-2 overflow-x-auto overscroll-x-contain border-t border-stone-100 bg-stone-100 p-2 touch-pan-x snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function buildImageAlt(courseName: string, regionLabel?: string): string {
  const region = regionLabel?.trim();
  if (region) return `${courseName} ${region} 골프장 사진`;
  return `${courseName} 골프장 사진`;
}

function normalizeSrcList(images: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of images) {
    const src = raw?.trim() ?? "";
    if (!src || src === "undefined" || src === "null") continue;
    if (seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

export function BlogCourseImageGallery({
  images,
  courseName,
  regionLabel,
  imageCredit,
}: BlogCourseImageGalleryProps) {
  const initial = useMemo(() => normalizeSrcList(images), [images]);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const visible = useMemo(
    () => initial.filter((src) => !failed.has(src)),
    [initial, failed],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(
    null,
  );
  const [thumb, setThumb] = useState({ left: 0, width: 100 });
  const [scrollable, setScrollable] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const markFailed = useCallback((src: string) => {
    setFailed((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
    setLightboxIndex((current) => {
      if (current === null) return current;
      const nextVisible = initial.filter((s) => s !== src && !failed.has(s));
      if (nextVisible.length === 0) return null;
      return Math.min(current, nextVisible.length - 1);
    });
  }, [failed, initial]);

  const syncThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 1) {
      setScrollable(false);
      setThumb({ left: 0, width: 100 });
      return;
    }

    setScrollable(true);
    const widthPct = Math.max(
      14,
      Math.min(100, (el.clientWidth / el.scrollWidth) * 100),
    );
    const leftPct = (el.scrollLeft / maxScroll) * (100 - widthPct);
    setThumb({ left: leftPct, width: widthPct });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    syncThumb();
    el.addEventListener("scroll", syncThumb, { passive: true });
    const resizeObserver = new ResizeObserver(syncThumb);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", syncThumb);
      resizeObserver.disconnect();
    };
  }, [syncThumb, visible.length]);

  useEffect(() => {
    const endDrag = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointerup", endDrag);
    return () => window.removeEventListener("pointerup", endDrag);
  }, []);

  const scrollFromTrackPosition = useCallback((clientX: number) => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    el.scrollLeft = ratio * maxScroll;
  }, []);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null
        ? current
        : (current - 1 + visible.length) % visible.length,
    );
  }, [visible.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? current : (current + 1) % visible.length,
    );
  }, [visible.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, showPrev, showNext]);

  if (visible.length === 0) return null;

  const alt = buildImageAlt(courseName, regionLabel);
  const credit = imageCredit ?? VISIT_KOREA_IMAGE_CREDIT;
  const single = visible.length === 1;

  return (
    <>
      <div
        ref={scrollRef}
        className={
          single
            ? `border-t border-stone-100 bg-stone-100 p-2`
            : SCROLL_ROW_CLASS
        }
        aria-label={`${courseName} 사진 목록`}
      >
        {visible.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxIndex(index)}
            aria-label={`${alt} ${index + 1} 확대 보기`}
            className={
              single
                ? `group relative w-full cursor-zoom-in overflow-hidden rounded-lg bg-stone-100 ${IMAGE_HEIGHT_CLASS}`
                : `group relative shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-lg bg-stone-100 ${IMAGE_WIDTH_CLASS} ${IMAGE_HEIGHT_CLASS}`
            }
          >
            <SafeContentImage
              src={src}
              alt={visible.length > 1 ? `${alt} ${index + 1}` : alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={
                single
                  ? "(max-width: 768px) 100vw, 900px"
                  : "(max-width: 640px) 300px, 360px"
              }
              draggable={false}
              onImageError={markFailed}
            />
          </button>
        ))}
      </div>

      {scrollable && !single ? (
        <div className="bg-stone-100 px-2 pb-2">
          <div
            ref={trackRef}
            role="scrollbar"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(thumb.left)}
            aria-label={`${courseName} 사진 가로 스크롤`}
            className="relative h-2 cursor-pointer rounded-full bg-stone-300/70"
            onPointerDown={(event) => {
              if (event.target !== event.currentTarget) return;
              scrollFromTrackPosition(event.clientX);
            }}
          >
            <div
              className="absolute top-0 h-2 cursor-grab rounded-full bg-stone-500 active:cursor-grabbing"
              style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const el = scrollRef.current;
                if (!el) return;
                dragRef.current = {
                  startX: event.clientX,
                  startScrollLeft: el.scrollLeft,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!dragRef.current) return;
                const el = scrollRef.current;
                const track = trackRef.current;
                if (!el || !track) return;

                const maxScroll = el.scrollWidth - el.clientWidth;
                const thumbWidth =
                  (el.clientWidth / el.scrollWidth) * track.clientWidth;
                const scrollableTrack = track.clientWidth - thumbWidth;
                if (scrollableTrack <= 0) return;

                const deltaX = event.clientX - dragRef.current.startX;
                const deltaScroll = (deltaX / scrollableTrack) * maxScroll;
                el.scrollLeft = Math.min(
                  maxScroll,
                  Math.max(0, dragRef.current.startScrollLeft + deltaScroll),
                );
              }}
            />
          </div>
        </div>
      ) : null}

      <p className="border-b border-stone-100 bg-stone-100 px-4 py-2 text-xs text-stone-500 sm:px-5">
        {credit}
      </p>

      {lightboxIndex !== null && visible[lightboxIndex] ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${courseName} 사진 확대`}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="닫기"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>

          {visible.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrev();
              }}
              aria-label="이전 사진"
              className="absolute left-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-6"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden />
            </button>
          ) : null}

          <figure
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[70vh] w-full">
              <SafeContentImage
                src={visible[lightboxIndex]}
                alt={`${alt} ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                onImageError={markFailed}
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-white/70">
              {credit}
              {visible.length > 1
                ? ` · ${lightboxIndex + 1} / ${visible.length}`
                : ""}
            </figcaption>
          </figure>

          {visible.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="다음 사진"
              className="absolute right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6"
            >
              <ChevronRight className="h-7 w-7" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
