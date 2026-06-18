import Link from "next/link";
import { Flag, Heart, Sparkles, MapPin, User } from "lucide-react";

const NAV = [
  { label: "전국 골프장", href: "/", icon: MapPin },
  { label: "추천 골프장", href: "/#recommended", icon: Sparkles },
  { label: "즐겨찾기", href: "/#favorites", icon: Heart },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-app-warm/95 backdrop-blur md:border-gray-200 md:bg-white/90">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm md:h-9 md:w-9">
            <Flag className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <span className="text-base font-bold tracking-tight text-gray-900 md:text-lg">
            GolfMap <span className="text-brand-700">Korea</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 md:flex"
        >
          <User className="h-4 w-4" />
          로그인
        </button>
      </div>
    </header>
  );
}
