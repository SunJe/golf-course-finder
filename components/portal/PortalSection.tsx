import Link from "next/link";
import type { ReactNode } from "react";
import SiteContainer from "@/components/layout/SiteContainer";

interface PortalSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actionHref?: string;
  actionLabel?: string;
  containerVariant?: "default" | "narrow";
}

export default function PortalSection({
  id,
  title,
  description,
  children,
  className = "",
  actionHref,
  actionLabel = "전체보기",
  containerVariant = "default",
}: PortalSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={`py-12 sm:py-14 ${className}`}
    >
      <SiteContainer variant={containerVariant}>
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2
              id={id ? `${id}-heading` : undefined}
              className="text-xl font-semibold tracking-normal text-stone-800 sm:text-[1.35rem]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-stone-500 sm:text-[15px]">
                {description}
              </p>
            ) : null}
          </div>
          {actionHref ? (
            <Link
              href={actionHref}
              className="shrink-0 text-sm font-medium text-stone-400 transition hover:text-brand-800"
            >
              {actionLabel} →
            </Link>
          ) : null}
        </div>
        <div className="mt-5">{children}</div>
      </SiteContainer>
    </section>
  );
}
