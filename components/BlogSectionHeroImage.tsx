"use client";

import { useEffect, useId, useState } from "react";
import SafeContentImage from "@/components/content/SafeContentImage";

export type BlogSectionImageLayout = "cover" | "natural";

export function BlogSectionHeroImage({
  src,
  alt,
  mobileSrc,
  layout = "cover",
  enableLightbox = false,
}: {
  src: string;
  alt: string;
  mobileSrc?: string;
  /** cover: existing 4:3 crop. natural: intrinsic ratio, width 100% / height auto */
  layout?: BlogSectionImageLayout;
  /** natural 레이아웃에서 클릭 확대 (기본 false — region-guide 등 기존 표시 유지) */
  enableLightbox?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const titleId = useId();
  if (!src.trim() || failed) return null;

  const isContentAsset = src.includes("/promo-assets/blog/content/");

  if (isContentAsset) {
    const desktop = src;
    const mobile = mobileSrc?.trim() || src;
    return (
      <div className="mb-6 overflow-x-auto overflow-y-hidden rounded-2xl border border-stone-200/80 bg-white">
        <picture>
          <source media="(max-width: 640px)" srcSet={mobile} />
          <source media="(min-width: 641px)" srcSet={desktop} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktop}
            alt={alt}
            width={1600}
            height={1080}
            className="mx-auto h-auto max-h-[520px] w-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        </picture>
      </div>
    );
  }

  if (layout === "natural") {
    return (
      <>
        <figure className="mb-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
          {enableLightbox ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              aria-label={`${alt} 원본 확대 보기`}
            >
              <SafeContentImage
                src={src}
                alt={alt}
                width={1600}
                height={2400}
                className="h-auto w-full max-w-full"
                sizes="(max-width: 768px) 100vw, 900px"
                onImageError={() => setFailed(true)}
              />
            </button>
          ) : (
            <SafeContentImage
              src={src}
              alt={alt}
              width={1600}
              height={2400}
              className="h-auto w-full max-w-full"
              sizes="(max-width: 768px) 100vw, 900px"
              onImageError={() => setFailed(true)}
            />
          )}
          {enableLightbox ? (
            <figcaption className="border-t border-stone-100 px-3 py-2 text-center text-xs text-stone-500">
              이미지를 누르면 원본 크기로 확대됩니다
            </figcaption>
          ) : null}
        </figure>
        {enableLightbox && lightboxOpen ? (
          <BlogImageLightbox
            src={src}
            alt={alt}
            titleId={titleId}
            onClose={() => setLightboxOpen(false)}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100">
      <SafeContentImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        onImageError={() => setFailed(true)}
      />
    </div>
  );
}

function BlogImageLightbox({
  src,
  alt,
  titleId,
  onClose,
}: {
  src: string;
  alt: string;
  titleId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/80 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-2 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <p id={titleId} className="min-w-0 truncate text-sm font-semibold text-stone-800">
            {alt}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            닫기
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="mx-auto h-auto max-h-[84vh] w-auto max-w-full"
        />
      </div>
    </div>
  );
}
