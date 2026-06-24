"use client";

import Image from "next/image";
import type { PromoPageData } from "@/lib/og/promoTypes";
import {
  DEFAULT_PROMO_BRAND,
  DEFAULT_PROMO_DOMAIN,
  DEFAULT_PROMO_EYEBROW,
  DEFAULT_PROMO_TOP_RIGHT,
  PROMO_ICON_LABELS,
  PROMO_IMAGE_SIZE,
} from "@/lib/og/promoTypes";
import { getDefaultPromoBackgroundPath } from "@/lib/og/promoPaths";

export interface GolfMapPromoTemplateProps extends PromoPageData {
  className?: string;
  /** When true, renders at natural 1200px width (may overflow parent). */
  fullSize?: boolean;
}

function titleClass(title: string): string {
  const len = title.trim().length;
  if (len <= 8) return "text-[4.75rem]";
  if (len <= 11) return "text-[4.1rem]";
  if (len <= 14) return "text-[3.5rem]";
  if (len <= 18) return "text-[3rem]";
  return "text-[2.4rem]";
}

/**
 * Browser preview of the fixed GolfMap promo master template.
 * Batch PNG output uses the same layout via scripts/lib/promo/promoTemplateSvg.ts
 */
export default function GolfMapPromoTemplate({
  slug,
  title,
  eyebrow = DEFAULT_PROMO_EYEBROW,
  description,
  brandText = DEFAULT_PROMO_BRAND,
  domainText = DEFAULT_PROMO_DOMAIN,
  topRightCopy = DEFAULT_PROMO_TOP_RIGHT,
  backgroundImage,
  mapOverlayEnabled = true,
  className = "",
  fullSize = false,
}: GolfMapPromoTemplateProps) {
  const bg =
    backgroundImage?.trim() ||
    (slug ? `/promo-assets/backgrounds/${slug}.jpg` : getDefaultPromoBackgroundPath());

  const sizeStyle = fullSize
    ? { width: PROMO_IMAGE_SIZE, height: PROMO_IMAGE_SIZE }
    : { width: "100%", aspectRatio: "1 / 1" as const };

  return (
    <div
      className={`relative overflow-hidden bg-[#2d6a4f] ${className}`}
      style={sizeStyle}
    >
      <Image
        src={bg}
        alt=""
        fill
        priority
        className="object-cover"
        sizes={fullSize ? `${PROMO_IMAGE_SIZE}px` : "100vw"}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src.includes("default")) return;
          img.src = getDefaultPromoBackgroundPath();
        }}
      />

      <div className="pointer-events-none absolute inset-0 border border-white/70">
        <span className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-white" />
        <span className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-white" />
        <span className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-white" />
        <span className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-white" />
      </div>

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/10 to-transparent" />

      <div className="absolute left-[6%] top-[5.5%] flex items-center gap-3">
        <div className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-[#1b4332] ring-2 ring-white">
          <span className="text-lg text-white">⛳</span>
        </div>
        <div>
          <p className="text-[1.35rem] font-extrabold text-[#1b4332]">{brandText}</p>
          <p className="text-sm font-medium text-[#2d6a4f]">{domainText}</p>
        </div>
      </div>

      {mapOverlayEnabled ? (
        <div className="absolute right-[6%] top-[5%] text-right">
          <p className="mb-2 text-[0.62rem] font-semibold tracking-[0.22em] text-[#1b4332]">
            {topRightCopy}
          </p>
          <div
            className="ml-auto h-28 w-24 opacity-90"
            style={{
              background:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 150'%3E%3Cpath d='M58 8c8-2 18 2 22 10l12 22c4 10 6 22 6 34-1 14-6 28-14 40-8 12-18 22-30 30-10 6-22 8-34 6-10-2-18-8-24-16-6-10-8-22-8-34 0-12 2-24 8-34 6-10 14-18 24-24 8-6 18-10 28-12z' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E\") center/contain no-repeat",
            }}
            aria-hidden
          />
        </div>
      ) : null}

      <div className="absolute inset-x-[6%] bottom-[6%] rounded-[1.6rem] border border-white/80 bg-white/55 p-8 backdrop-blur-sm">
        <p className="text-lg font-semibold text-[#1b4332]">{eyebrow}</p>
        <div className="mt-2 h-0.5 w-36 bg-[#1b4332]/35" />
        <h2 className={`mt-5 font-extrabold leading-tight text-[#1b4332] ${titleClass(title)}`}>
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-lg font-medium text-[#2d6a4f]">{description}</p>
        ) : null}

        <div className="mt-10 grid grid-cols-4 border-t border-white/40 pt-6 text-center text-sm font-semibold text-[#1b4332]">
          {PROMO_ICON_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
