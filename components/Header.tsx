import Link from "next/link";
import { Flag, Heart, Sparkles, MapPin, User } from "lucide-react";

const NAV = [
  { label: "전국 골프장", href: "/", icon: MapPin },
  { label: "추천 골프장", href: "/#recommended", icon: Sparkles },
  { label: "즐겨찾기", href: "/#favorites", icon: Heart },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-app-warm/95 backdrop-blur md:border-stone-200/80 md:bg-white/95">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 md:h-14">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-800 text-white shadow-sm md:h-9 md:w-9">
            <Flag className="h-4 w-4 md:h-[18px] md:w-[18px]" />
          </span>
          <span className="text-base font-bold tracking-tight text-stone-900 md:text-[17px]">
            GolfMap <span className="text-brand-800">Korea</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
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
