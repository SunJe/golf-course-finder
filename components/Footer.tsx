import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

const FOOTER_LINKS = [
  { label: "서비스 소개", href: "/about" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "문의", href: "/contact" },
  { label: "이용 고지", href: "/disclaimer" },
] as const;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-app-warm/50 md:bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="서비스 정보"
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-start sm:gap-x-6"
        >
          {FOOTER_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium text-stone-600 transition hover:text-brand-800 ${FOCUS_RING}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-center text-xs text-stone-500 sm:text-left">
          © {year} {siteConfig.siteName}. 골프장 정보는 참고용이며 예약 전 공식
          홈페이지에서 확인하세요.
        </p>
      </div>
    </footer>
  );
}
