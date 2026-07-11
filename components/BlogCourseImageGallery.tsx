"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SafeContentImage from "@/components/content/SafeContentImage";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";

export type BlogCourseGalleryImage = {
  src: string;
  alt?: string;
  sourcePage?: string;
};

interface BlogCourseImageGalleryProps {
  images: string[] | BlogCourseGalleryImage[];
  courseName: string;
  regionLabel?: string;
  imageCredit?: string;
  /** 단일 sourcePage (하위 호환) */
  imageSourcePage?: string;
  /** 이미지별 sourcePage가 다를 때 */
  imageSourcePages?: string[];
  /** 단일 alt (하위 호환) */
  imageAlt?: string;
  /** 이미지별 alt */
  imageAlts?: string[];
}

function buildImageAlt(courseName: string, regionLabel?: string): string {
  const region = regionLabel?.trim();
  if (region) return `${courseName} ${region} 골프장 사진`;
  return `${courseName} 골프장 사진`;
}

function normalizeImages(
  images: string[] | BlogCourseGalleryImage[],
  fallbackAlt: string,
  imageAlt?: string,
  imageAlts?: string[],
  imageSourcePage?: string,
  imageSourcePages?: string[],
): BlogCourseGalleryImage[] {
  const seen = new Set<string>();
  const out: BlogCourseGalleryImage[] = [];

  images.forEach((raw, index) => {
    const entry =
      typeof raw === "string"
        ? { src: raw }
        : { src: raw.src, alt: raw.alt, sourcePage: raw.sourcePage };
    const src = entry.src?.trim() ?? "";
    if (!src || src === "undefined" || src === "null") return;
    if (seen.has(src)) return;
    seen.add(src);
    out.push({
      src,
      alt:
        entry.alt?.trim() ||
        imageAlts?.[index]?.trim() ||
        (index === 0 ? imageAlt?.trim() : undefined) ||
        (out.length === 0 ? fallbackAlt : `${fallbackAlt} ${out.length + 1}`),
      sourcePage:
        entry.sourcePage?.trim() ||
        imageSourcePages?.[index]?.trim() ||
        imageSourcePage?.trim() ||
        undefined,
    });
  });

  return out;
}

export function BlogCourseImageGallery({
  images,
  courseName,
  regionLabel,
  imageCredit,
  imageSourcePage,
  imageSourcePages,
  imageAlt,
  imageAlts,
}: BlogCourseImageGalleryProps) {
  const fallbackAlt = useMemo(
    () => buildImageAlt(courseName, regionLabel),
    [courseName, regionLabel],
  );
  const initial = useMemo(
    () =>
      normalizeImages(
        images,
        fallbackAlt,
        imageAlt,
        imageAlts,
        imageSourcePage,
        imageSourcePages,
      ),
    [
      images,
      fallbackAlt,
      imageAlt,
      imageAlts,
      imageSourcePage,
      imageSourcePages,
    ],
  );
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const visible = useMemo(
    () => initial.filter((img) => !failed.has(img.src)),
    [initial, failed],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const markFailed = useCallback((src: string) => {
    setFailed((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const syncActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el || visible.length === 0) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    children.forEach((child, index) => {
      const center = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    setActiveIndex(best);
  }, [visible.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncActive();
    el.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
    return () => {
      el.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, [syncActive, visible.length]);

  useEffect(() => {
    setActiveIndex((prev) =>
      visible.length === 0 ? 0 : Math.min(prev, visible.length - 1),
    );
  }, [visible.length]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const nextIndex = Math.min(
      visible.length - 1,
      Math.max(0, activeIndex + dir),
    );
    const target = children[nextIndex];
    if (!target) return;
    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  if (visible.length === 0) return null;

  const credit = imageCredit ?? VISIT_KOREA_IMAGE_CREDIT;
  const count = visible.length;
  const sourcePages = Array.from(
    new Set(
      visible
        .map((img) => img.sourcePage)
        .filter((url): url is string => Boolean(url)),
    ),
  );

  return (
    <div className="border-t border-stone-100 bg-white">
      {count === 1 ? (
        <div className="bg-stone-50/40 p-2 sm:p-3">
          <SafeContentImage
            src={visible[0].src}
            alt={visible[0].alt ?? fallbackAlt}
            width={1200}
            height={800}
            className="mx-auto h-auto max-h-[520px] w-full object-contain"
            sizes="(max-width: 768px) 100vw, 900px"
            onImageError={markFailed}
          />
        </div>
      ) : null}

      {count === 2 ? (
        <>
          <div className="hidden gap-2 bg-stone-50/40 p-2 sm:grid sm:grid-cols-2 sm:p-3">
            {visible.map((img) => (
              <SafeContentImage
                key={img.src}
                src={img.src}
                alt={img.alt ?? fallbackAlt}
                width={900}
                height={600}
                className="h-auto max-h-[360px] w-full rounded-lg object-contain"
                sizes="(max-width: 768px) 100vw, 450px"
                onImageError={markFailed}
              />
            ))}
          </div>
          <div
            className="flex gap-2 overflow-x-auto overscroll-x-contain bg-stone-50/40 p-2 touch-pan-x snap-x snap-mandatory sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={`${courseName} 사진 목록`}
          >
            {visible.map((img) => (
              <div
                key={img.src}
                className="w-[88%] shrink-0 snap-center rounded-lg bg-stone-50"
              >
                <SafeContentImage
                  src={img.src}
                  alt={img.alt ?? fallbackAlt}
                  width={900}
                  height={600}
                  className="h-auto max-h-[320px] w-full object-contain"
                  sizes="88vw"
                  onImageError={markFailed}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}

      {count >= 3 ? (
        <div className="relative bg-stone-50/40">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto overscroll-x-contain p-2 touch-pan-x snap-x snap-mandatory sm:p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={`${courseName} 사진 캐러셀`}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollByDir(-1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollByDir(1);
              }
            }}
          >
            {visible.map((img) => (
              <div
                key={img.src}
                className="w-[90%] shrink-0 snap-center rounded-lg bg-stone-50 sm:w-[58%]"
              >
                <SafeContentImage
                  src={img.src}
                  alt={img.alt ?? fallbackAlt}
                  width={900}
                  height={600}
                  className="h-auto max-h-[360px] w-full object-contain sm:max-h-[420px]"
                  sizes="(max-width: 640px) 90vw, 58vw"
                  onImageError={markFailed}
                />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 sm:px-2">
            <button
              type="button"
              aria-label="이전 사진"
              onClick={() => scrollByDir(-1)}
              disabled={activeIndex <= 0}
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-700 shadow-sm transition hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              onClick={() => scrollByDir(1)}
              disabled={activeIndex >= count - 1}
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-700 shadow-sm transition hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <p className="pb-2 text-center text-xs font-medium text-stone-500">
            {activeIndex + 1} / {count}
          </p>
        </div>
      ) : null}

      <p className="border-b border-stone-100 bg-white px-4 py-2 text-xs text-stone-500 sm:px-5">
        {credit}
        {sourcePages.length === 1 ? (
          <>
            {" · "}
            <a
              href={sourcePages[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-stone-700"
            >
              원문 보기
            </a>
          </>
        ) : null}
        {sourcePages.length > 1
          ? sourcePages.map((url, index) => (
              <span key={url}>
                {" · "}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-stone-700"
                >
                  원문 {index + 1}
                </a>
              </span>
            ))
          : null}
      </p>
    </div>
  );
}
