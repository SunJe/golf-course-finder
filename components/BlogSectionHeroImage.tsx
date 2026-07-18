"use client";

import { useState } from "react";
import SafeContentImage from "@/components/content/SafeContentImage";

export function BlogSectionHeroImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src.trim() || failed) return null;

  const isContentAsset = src.includes("/promo-assets/blog/content/");

  if (isContentAsset) {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
        <SafeContentImage
          src={src}
          alt={alt}
          width={1200}
          height={900}
          className="h-auto max-h-[520px] w-full object-contain"
          sizes="(max-width: 768px) 100vw, 900px"
          onImageError={() => setFailed(true)}
        />
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
