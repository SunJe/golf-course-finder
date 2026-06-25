import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

interface PortalLinkCardProps {
  href: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function PortalLinkCard({
  href,
  title,
  description,
  icon: Icon,
}: PortalLinkCardProps) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[88px] flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:min-h-[96px] sm:p-5 ${FOCUS_RING}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {Icon ? (
            <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
          <h3 className="text-sm font-bold text-stone-900 sm:text-base">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500 sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-brand-600"
          aria-hidden
        />
      </div>
    </Link>
  );
}
