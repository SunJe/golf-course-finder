"use client";

import { useState } from "react";
import CourseHeroFallback from "@/components/CourseHeroFallback";

interface CourseDetailHeroImageProps {
  src?: string | null;
  alt: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export default function CourseDetailHeroImage({
  src,
  alt,
  imageClassName = "h-36 w-full object-cover object-[center_35%] sm:h-48",
  fallbackClassName = "h-36 w-full sm:h-48",
}: CourseDetailHeroImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = src?.trim();
  const showImage = Boolean(trimmed) && !failed;

  if (!showImage) {
    return <CourseHeroFallback className={fallbackClassName} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={alt}
      loading="eager"
      onError={() => setFailed(true)}
      className={imageClassName}
    />
  );
}
