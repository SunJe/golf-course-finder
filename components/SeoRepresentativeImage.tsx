import Image from "next/image";
import { SEO_IMAGE_HEIGHT, SEO_IMAGE_WIDTH } from "@/lib/seoImages";

interface SeoRepresentativeImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function SeoRepresentativeImage({
  src,
  alt,
  priority = false,
}: SeoRepresentativeImageProps) {
  return (
    <figure className="mx-auto max-w-md overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
      <Image
        src={src}
        alt={alt}
        width={SEO_IMAGE_WIDTH}
        height={SEO_IMAGE_HEIGHT}
        priority={priority}
        loading={priority ? undefined : "eager"}
        unoptimized
        className="aspect-square h-auto w-full object-cover"
      />
    </figure>
  );
}
