"use client";

import { useState } from "react";
import {
  getCourseImageUrl,
} from "@/lib/courseImage";

interface CourseImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** placeholder 선택용 — id 등 고유값 */
  seed?: string;
}

export default function CourseImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  seed,
}: CourseImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed
    ? getCourseImageUrl(null, seed ?? alt)
    : getCourseImageUrl(src, seed ?? alt);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
