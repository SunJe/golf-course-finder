"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { shouldBypassVercelImageOptimization } from "@/lib/externalTourismImage";

type TourismAwareImageProps = ImageProps & {
  fallbackClassName?: string;
};

function resolveImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  if (typeof src === "object" && src !== null && "src" in src) {
    return String(src.src);
  }
  return "";
}

export default function TourismAwareImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  onError,
  ...props
}: TourismAwareImageProps) {
  const [failed, setFailed] = useState(false);
  const srcString = resolveImageSrc(src);
  const unoptimized = shouldBypassVercelImageOptimization(srcString);

  if (failed) {
    return (
      <div
        className={`bg-stone-200 ${props.fill ? "absolute inset-0 " : ""}${fallbackClassName || className}`}
        role="img"
        aria-label={typeof alt === "string" ? alt : "이미지를 불러올 수 없습니다"}
      />
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      unoptimized={unoptimized}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
