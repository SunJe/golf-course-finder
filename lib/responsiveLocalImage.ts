import fs from "fs";
import path from "path";

export const RESPONSIVE_WIDTHS = [480, 768, 1200] as const;

export type ResponsiveLocalImage = {
  src: string;
  srcSet?: string;
  sizes: string;
};

function derivativePath(originalPath: string, width: number): string {
  const ext = path.extname(originalPath);
  const base = originalPath.slice(0, originalPath.length - ext.length);
  return `${base}-${width}w.webp`;
}

/**
 * Build srcSet for local promo/seo assets when 480/768/1200 webp derivatives exist.
 * Falls back to the original path (no next/image).
 */
export function resolveResponsiveLocalImage(
  publicSrc: string,
  options?: { sizes?: string; publicRoot?: string },
): ResponsiveLocalImage {
  const sizes =
    options?.sizes ??
    "(max-width: 640px) 100vw, (max-width: 1024px) 768px, 1200px";
  const normalized = publicSrc.startsWith("/") ? publicSrc : `/${publicSrc}`;

  // Remote or data URLs: no derivatives
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return { src: normalized, sizes };
  }

  const root = options?.publicRoot ?? path.join(process.cwd(), "public");
  const candidates = RESPONSIVE_WIDTHS.map((width) => ({
    width,
    abs: path.join(root, derivativePath(normalized, width).replace(/^\//, "")),
    url: derivativePath(normalized, width),
  })).filter((item) => fs.existsSync(item.abs));

  if (candidates.length === 0) {
    return { src: normalized, sizes };
  }

  return {
    src: candidates[candidates.length - 1]!.url,
    srcSet: candidates.map((item) => `${item.url} ${item.width}w`).join(", "),
    sizes,
  };
}
