"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TourismAwareImage from "@/components/TourismAwareImage";
import type { CourseVisitKoreaImageSet } from "@/lib/enrichment/courseVisitKoreaImages";

interface CourseVisitKoreaGalleryProps {
  courseName: string;
  regionLabel?: string;
  gallery: CourseVisitKoreaImageSet;
}

const IMAGE_HEIGHT_CLASS = "h-[200px] sm:h-[240px]";
const IMAGE_WIDTH_CLASS = "w-[300px] sm:w-[360px]";
const AUTO_SCROLL_SPEED = 0.45;

const SCROLL_ROW_CLASS =
  "flex gap-2 overflow-x-auto overscroll-x-contain bg-stone-100 p-2 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function buildImageAlt(courseName: string, regionLabel?: string): string {
  const region = regionLabel?.trim();
  if (region) return `${courseName} ${region} 골프장 사진`;
  return `${courseName} 골프장 사진`;
}

export function CourseVisitKoreaGallery({
  courseName,
  regionLabel,
  gallery,
}: CourseVisitKoreaGalleryProps) {
  const initialImages = useMemo(
    () =>
      gallery.images.filter((src) => {
        const trimmed = src?.trim() ?? "";
        return trimmed && trimmed !== "undefined" && trimmed !== "null";
      }),
    [gallery.images],
  );
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const images = useMemo(
    () => initialImages.filter((src) => !failed.has(src)),
    [initialImages, failed],
  );
  const markFailed = useCallback((src: string) => {
    setFailed((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);
  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const wheelResumeRef = useRef<number | null>(null);
  const loopWidthRef = useRef(0);
  const [loop, setLoop] = useState(false);
  const [thumb, setThumb] = useState({ left: 0, width: 100 });

  const getLoopWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const first = el.children[0] as HTMLElement | undefined;
    const mid = el.children[images.length] as HTMLElement | undefined;
    if (!first || !mid) return 0;
    return mid.offsetLeft - first.offsetLeft;
  }, [images.length]);

  const syncThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const lw = loopWidthRef.current;
    if (lw <= 0) {
      setThumb({ left: 0, width: 100 });
      return;
    }

    const pos = ((el.scrollLeft % lw) + lw) % lw;
    const widthPct = Math.max(14, Math.min(100, (el.clientWidth / lw) * 100));
    const leftPct = (pos / lw) * (100 - widthPct);
    setThumb({ left: leftPct, width: widthPct });
  }, []);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!loop) {
      const overflow = el.scrollWidth - el.clientWidth > 1;
      if (overflow) setLoop(true);
      return;
    }

    const lw = getLoopWidth();
    loopWidthRef.current = lw;
    if (lw - el.clientWidth <= 1) {
      loopWidthRef.current = 0;
      setLoop(false);
    }
    syncThumb();
  }, [loop, getLoopWidth, syncThumb]);

  const pauseAutoScroll = useCallback(() => {
    pauseRef.current = true;
  }, []);

  const resumeAutoScroll = useCallback(() => {
    pauseRef.current = false;
  }, []);

  const handleWheel = useCallback(() => {
    pauseAutoScroll();
    if (wheelResumeRef.current !== null) {
      window.clearTimeout(wheelResumeRef.current);
    }
    wheelResumeRef.current = window.setTimeout(() => {
      resumeAutoScroll();
      wheelResumeRef.current = null;
    }, 0);
  }, [pauseAutoScroll, resumeAutoScroll]);

  const scrollFromTrackPosition = useCallback(
    (clientX: number) => {
      const el = scrollRef.current;
      const track = trackRef.current;
      const lw = loopWidthRef.current;
      if (!el || !track || lw <= 0) return;

      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      el.scrollLeft = ratio * lw;
      syncThumb();
    },
    [syncThumb],
  );

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", syncThumb, { passive: true });
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", syncThumb);
      resizeObserver.disconnect();
    };
  }, [measure, syncThumb]);

  useEffect(() => {
    if (!loop) return;

    let rafId = 0;
    const tick = () => {
      const el = scrollRef.current;
      const lw = loopWidthRef.current;
      if (el && lw > 0 && !pauseRef.current) {
        let next = el.scrollLeft + AUTO_SCROLL_SPEED;
        if (next >= lw) next -= lw;
        el.scrollLeft = next;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [loop]);

  useEffect(() => {
    const endInteraction = () => {
      dragRef.current = null;
      resumeAutoScroll();
    };

    window.addEventListener("pointerup", endInteraction);
    window.addEventListener("touchend", endInteraction);
    return () => {
      window.removeEventListener("pointerup", endInteraction);
      window.removeEventListener("touchend", endInteraction);
    };
  }, [resumeAutoScroll]);

  useEffect(
    () => () => {
      if (wheelResumeRef.current !== null) {
        window.clearTimeout(wheelResumeRef.current);
      }
    },
    [],
  );

  if (images.length === 0) return null;

  const alt = buildImageAlt(courseName, regionLabel);
  const renderImages = loop ? [...images, ...images] : images;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-4 py-4 sm:px-6">
        <h2 className="text-base font-bold text-gray-900 sm:text-lg">골프장 사진</h2>
      </div>

      <div
        ref={scrollRef}
        className={SCROLL_ROW_CLASS}
        aria-label={`${courseName} 사진 목록`}
        onPointerEnter={pauseAutoScroll}
        onPointerLeave={resumeAutoScroll}
        onPointerDown={pauseAutoScroll}
        onWheel={handleWheel}
        onTouchStart={pauseAutoScroll}
      >
        {renderImages.map((src, index) => {
          const isClone = index >= images.length;
          return (
            <div
              key={`${src}-${isClone ? "clone" : "orig"}`}
              aria-hidden={isClone}
              className={`relative shrink-0 overflow-hidden rounded-lg bg-stone-100 ${IMAGE_WIDTH_CLASS} ${IMAGE_HEIGHT_CLASS}`}
            >
              <TourismAwareImage
                src={src}
                alt={
                  images.length > 1
                    ? `${alt} ${(index % images.length) + 1}`
                    : alt
                }
                fill
                className="object-cover"
                sizes="(max-width: 640px) 300px, 360px"
                draggable={false}
                onImageError={markFailed}
              />
            </div>
          );
        })}
      </div>

      {loop ? (
        <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 sm:px-6">
          <div
            ref={trackRef}
            role="scrollbar"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(thumb.left)}
            aria-label={`${courseName} 사진 가로 스크롤`}
            className="relative h-2 cursor-pointer rounded-full bg-stone-200"
            onPointerDown={(event) => {
              if (event.target !== event.currentTarget) return;
              pauseAutoScroll();
              scrollFromTrackPosition(event.clientX);
            }}
          >
            <div
              className="absolute top-0 h-2 cursor-grab rounded-full bg-stone-500 active:cursor-grabbing"
              style={{
                left: `${thumb.left}%`,
                width: `${thumb.width}%`,
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                pauseAutoScroll();

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
                const lw = loopWidthRef.current;
                if (!el || !track || lw <= 0) return;

                const trackWidth = track.clientWidth;
                const thumbWidth = (el.clientWidth / lw) * trackWidth;
                const scrollableTrack = trackWidth - thumbWidth;
                if (scrollableTrack <= 0) return;

                const deltaX = event.clientX - dragRef.current.startX;
                const deltaScroll = (deltaX / scrollableTrack) * lw;
                el.scrollLeft = Math.min(
                  lw,
                  Math.max(0, dragRef.current.startScrollLeft + deltaScroll),
                );
                syncThumb();
              }}
            />
          </div>
        </div>
      ) : null}

      <p className="px-4 py-2.5 text-xs text-stone-500 sm:px-6">
        출처: ⓒ한국관광콘텐츠랩
      </p>
    </section>
  );
}
