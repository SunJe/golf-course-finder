"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type TourismAwareImageProps = ImageProps & {
  /** @deprecated Gray fallback removed — failed images unmount instead. */
  fallbackClassName?: string;
  onImageError?: (src: string) => void;
};

function resolveImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  if (typeof src === "object" && src !== null && "src" in src) {
    return String(src.src);
  }
  return "";
}

/**
 * Visit Korea / tourism content images: always skip Vercel Image Optimization
 * and unmount on failure (no gray empty placeholder).
 */
export default function TourismAwareImage({
  src,
  alt,
  className = "",
  fallbackClassName: _fallbackClassName,
  onError,
  onImageError,
  unoptimized: _unoptimized,
  ...props
}: TourismAwareImageProps) {
  const [failed, setFailed] = useState(false);
  const srcString = resolveImageSrc(src);

  if (!srcString.trim() || failed) {
    return null;
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      unoptimized
      onError={(event) => {
        setFailed(true);
        onImageError?.(srcString);
        onError?.(event);
      }}
    />
  );
}
