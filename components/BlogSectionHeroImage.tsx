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
