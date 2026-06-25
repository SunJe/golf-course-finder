import type { ReactNode } from "react";
import {
  HOME_PAGE_CONTAINER_CLASS,
  SITE_CONTAINER_CLASS,
} from "@/lib/siteLayout";

type SiteContainerVariant = "default" | "narrow";

interface SiteContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
  variant?: SiteContainerVariant;
}

/**
 * Tailwind must see container utilities as a static literal in scanned files.
 * Keep in sync with lib/siteLayout.ts.
 */
const DEFAULT_CONTAINER_CLASS =
  "mx-auto w-full max-w-[1120px] px-5 md:px-6" satisfies typeof SITE_CONTAINER_CLASS;

const NARROW_CONTAINER_CLASS =
  "mx-auto w-full max-w-[920px] px-5 md:px-0" satisfies typeof HOME_PAGE_CONTAINER_CLASS;

const VARIANT_CLASS: Record<SiteContainerVariant, string> = {
  default: DEFAULT_CONTAINER_CLASS,
  narrow: NARROW_CONTAINER_CLASS,
};

export default function SiteContainer({
  children,
  className = "",
  as: Tag = "div",
  variant = "default",
}: SiteContainerProps) {
  return (
    <Tag
      className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`}
    >
      {children}
    </Tag>
  );
}
