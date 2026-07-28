"use client";

import { useState } from "react";
import SafeContentImage from "@/components/content/SafeContentImage";

export function BlogSectionHeroImage({
  src,
  alt,
  mobileSrc,
}: {
  src: string;
  alt: string;
  mobileSrc?: string;
}) {
  const [failed, setFailed] = useState(false);
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
