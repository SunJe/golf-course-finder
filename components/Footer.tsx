import Link from "next/link";
import SiteContainer from "@/components/layout/SiteContainer";
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
      <SiteContainer className="py-8">
        <nav
          aria-label="서비스 정보"
          className="flex flex-wrap gap-x-6 gap-y-2"
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
        <p className="mt-4 text-xs leading-relaxed text-stone-500">
          © {year} {siteConfig.siteName}. 골프장 정보는 참고용이며 예약 전 공식
          홈페이지에서 확인하세요.
        </p>
      </SiteContainer>
    </footer>
  );
}
