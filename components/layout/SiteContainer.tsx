import type { ReactNode } from "react";
import { SITE_CONTAINER_CLASS } from "@/lib/siteLayout";

interface SiteContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
}

/**
 * Tailwind must see container utilities as a static literal in scanned files.
 * Keep in sync with lib/siteLayout.ts SITE_CONTAINER_CLASS.
 */
const CONTAINER_CLASS =
  "mx-auto w-full max-w-[1120px] px-5 md:px-6" satisfies typeof SITE_CONTAINER_CLASS;

export default function SiteContainer({
  children,
  className = "",
  as: Tag = "div",
}: SiteContainerProps) {
  return (
    <Tag
      className={`${CONTAINER_CLASS}${className ? ` ${className}` : ""}`}
    >
      {children}
    </Tag>
  );
}
