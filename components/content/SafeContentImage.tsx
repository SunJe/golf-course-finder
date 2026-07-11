"use client";

import { useState, type CSSProperties } from "react";
import Image, { type ImageProps } from "next/image";

export type SafeContentImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  /** Called when the image fails; parent galleries can remove the slot. */
  onImageError?: (src: string) => void;
  /** Extra class on the optional fill wrapper. */
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
};

function isUsableSrc(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed === "undefined" || trimmed === "null") return false;
  return true;
}

/**
 * Blog/content photo renderer: always bypasses Next Image Optimization
 * (avoids Vercel /_next/image 402) and unmounts itself on load failure
 * so broken icons / gray empty boxes never remain.
 */
export default function SafeContentImage({
  src,
  alt,
  className = "",
  onImageError,
  onError,
  wrapperClassName,
  wrapperStyle,
  fill,
  unoptimized: _unoptimized,
  ...props
}: SafeContentImageProps) {
  const [failed, setFailed] = useState(false);

  if (!isUsableSrc(src) || failed) {
    return null;
  }

  const handleError: NonNullable<ImageProps["onError"]> = (event) => {
    setFailed(true);
    onImageError?.(src);
    onError?.(event);
  };

  const image = (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized
      onError={handleError}
    />
  );

  if (fill && wrapperClassName) {
    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        {image}
      </div>
    );
  }

  return image;
}
