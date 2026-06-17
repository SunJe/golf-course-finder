"use client";

import { useState } from "react";
import {
  DEFAULT_COURSE_IMAGE,
  getCourseImageUrl,
} from "@/lib/courseImage";

interface CourseImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export default function CourseImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: CourseImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? DEFAULT_COURSE_IMAGE : getCourseImageUrl(src);

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
