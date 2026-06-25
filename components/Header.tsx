import Link from "next/link";
import HomeResetLink from "@/components/HomeResetLink";
import SiteContainer from "@/components/layout/SiteContainer";
import { Flag } from "lucide-react";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "추천 골프장", href: "/recommended" },
  { label: "골프맵", href: "/map", resetOnSamePath: true as const },
  { label: "블로그", href: "/blog" },
] as const;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-app-warm/95 backdrop-blur md:border-stone-200/80 md:bg-white/95">
      <SiteContainer
        variant="narrow"
        className="flex h-12 items-center gap-4 md:h-[60px] md:gap-6"
      >
        <Link
          href="/"
          className={`flex min-w-0 shrink-0 items-center gap-2 md:gap-2.5 ${FOCUS_RING}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white shadow-sm md:h-9 md:w-9 md:rounded-xl">
            <Flag className="h-3.5 w-3.5 md:h-[18px] md:w-[18px]" aria-hidden />
          </span>
          <span className="truncate text-sm font-bold tracking-tight text-stone-900 md:text-[17px]">
            GolfMap{" "}
            <span className="text-brand-800">
              <span className="md:hidden">KR</span>
              <span className="hidden md:inline">Korea</span>
            </span>
          </span>
        </Link>

        <nav className="flex min-w-0 items-center justify-start gap-0.5 overflow-x-auto md:gap-1.5">
          {NAV_ITEMS.map(({ label, href, ...rest }) =>
            "resetOnSamePath" in rest && rest.resetOnSamePath ? (
              <HomeResetLink
                key={label}
                href={href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 md:px-3 md:text-[17px] ${FOCUS_RING}`}
              >
                {label}
              </HomeResetLink>
            ) : (
              <Link
                key={label}
                href={href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 md:px-3 md:text-[17px] ${FOCUS_RING}`}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
      </SiteContainer>
    </header>
  );
}
