import Link from "next/link";

export const QUICK_FIND_ITEMS = [
  {
    label: "서울근교",
    href: "/collections/near-seoul",
    title: "서울 근교 골프장",
  },
  {
    label: "저렴한",
    href: "/collections/near-seoul-budget",
    title: "서울 근교 저렴한 골프장",
  },
  {
    label: "초보자",
    href: "/collections/near-seoul-beginner",
    title: "서울 근교 초보자 골프장",
  },
  {
    label: "백돌이",
    href: "/collections/near-seoul-baekdori",
    title: "서울 근교 백돌이 골프장",
  },
  {
    label: "대중제",
    href: "/collections/public",
    title: "대중제 골프장",
  },
  {
    label: "나인홀",
    href: "/collections/nine-hole",
    title: "나인홀 골프장",
  },
] as const;

const SHEET_QUICK_FIND_LABELS = new Set(["서울근교", "저렴한", "초보자"]);

type QuickFindVariant = "desktop" | "mobile" | "sheet";

interface QuickFindLinksProps {
  variant?: QuickFindVariant;
  className?: string;
}

const CHIP_BASE =
  "inline-flex shrink-0 items-center rounded-full border font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const VARIANT_STYLES: Record<QuickFindVariant, string> = {
  desktop: `${CHIP_BASE} border-brand-200 bg-brand-50 px-3 py-1.5 text-xs text-brand-900 hover:border-brand-400 hover:bg-brand-100`,
  mobile: `${CHIP_BASE} border-brand-200 bg-white px-3 py-1.5 text-[11px] text-brand-900 shadow-sm hover:border-brand-400 hover:bg-brand-50`,
  sheet: `${CHIP_BASE} border-brand-200 bg-brand-50/80 px-2.5 py-1 text-[11px] text-brand-900 hover:border-brand-400 hover:bg-brand-100`,
};

export default function QuickFindLinks({
  variant = "desktop",
  className = "",
}: QuickFindLinksProps) {
  const items =
    variant === "sheet"
      ? QUICK_FIND_ITEMS.filter((item) => SHEET_QUICK_FIND_LABELS.has(item.label))
      : QUICK_FIND_ITEMS;

  const labelClass =
    variant === "desktop"
      ? "text-xs font-semibold text-stone-600"
      : "text-[11px] font-semibold text-stone-500";

  return (
    <div className={className}>
      <p className={labelClass}>빠른 찾기</p>
      <div
        className={`mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          variant === "desktop" ? "flex-wrap" : "flex-nowrap"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.title}
            className={VARIANT_STYLES[variant]}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
