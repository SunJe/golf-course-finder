import Image from "next/image";
import type { CourseVisitKoreaImageSet } from "@/lib/enrichment/courseVisitKoreaImages";

interface CourseVisitKoreaGalleryProps {
  courseName: string;
  regionLabel?: string;
  gallery: CourseVisitKoreaImageSet;
}

const IMAGE_HEIGHT_CLASS = "h-[200px] sm:h-[240px]";

function buildImageAlt(courseName: string, regionLabel?: string): string {
  const region = regionLabel?.trim();
  if (region) return `${courseName} ${region} 골프장 사진`;
  return `${courseName} 골프장 사진`;
}

export function CourseVisitKoreaGallery({
  courseName,
  regionLabel,
  gallery,
}: CourseVisitKoreaGalleryProps) {
  const images = gallery.images.slice(0, 4);
  if (images.length === 0) return null;

  const alt = buildImageAlt(courseName, regionLabel);
  const hasTwo = images.length === 2;
  const hasGrid = images.length >= 3;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-4 py-4 sm:px-6">
        <h2 className="text-base font-bold text-gray-900 sm:text-lg">골프장 사진</h2>
      </div>

      <div
        className={
          hasGrid
            ? "grid grid-cols-1 gap-1 bg-stone-100 sm:grid-cols-2"
            : hasTwo
              ? "grid grid-cols-1 gap-1 bg-stone-100 sm:grid-cols-2"
              : "bg-stone-100"
        }
      >
        {images.map((src, index) => (
          <div
            key={src}
            className={`relative overflow-hidden bg-stone-100 ${IMAGE_HEIGHT_CLASS}`}
          >
            <Image
              src={src}
              alt={images.length > 1 ? `${alt} ${index + 1}` : alt}
              fill
              className="object-cover"
              sizes={
                hasTwo || hasGrid
                  ? "(max-width: 640px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, 768px"
              }
            />
          </div>
        ))}
      </div>

      <p className="px-4 py-2.5 text-xs text-stone-500 sm:px-6">
        {gallery.attribution}
      </p>
    </section>
  );
}
