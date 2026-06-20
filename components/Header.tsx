import HomeResetLink from "@/components/HomeResetLink";
import { Flag, Sparkles, MapPin, User } from "lucide-react";

const NAV = [
  { label: "전국 골프장", href: "/", icon: MapPin, resetHome: true },
  { label: "추천 골프장", href: "/#recommended", icon: Sparkles, resetHome: false },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-app-warm/95 backdrop-blur md:border-stone-200/80 md:bg-white/95">
      <div className="mx-auto flex h-11 max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-4 md:h-14 md:gap-3 md:px-6">
        <HomeResetLink
          href="/"
          className="flex min-w-0 items-center gap-2 md:gap-2.5"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white shadow-sm md:h-9 md:w-9 md:rounded-xl">
            <Flag className="h-3.5 w-3.5 md:h-[18px] md:w-[18px]" />
          </span>
          <span className="truncate text-sm font-bold tracking-tight text-stone-900 md:text-[17px]">
            GolfMap{" "}
            <span className="text-brand-800">
              <span className="md:hidden">KR</span>
              <span className="hidden md:inline">Korea</span>
            </span>
          </span>
        </HomeResetLink>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map(({ label, href, icon: Icon, resetHome }) =>
            resetHome ? (
              <HomeResetLink
                key={label}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </HomeResetLink>
            ) : (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ),
          )}
        </nav>

        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 md:flex"
        >
          <User className="h-4 w-4" />
          로그인
        </button>
      </div>
    </header>
  );
}
