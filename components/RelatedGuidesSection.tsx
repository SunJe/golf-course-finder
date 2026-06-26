import Link from "next/link";
import type { GuideLink } from "@/lib/contentGuides";

interface RelatedGuidesSectionProps {
  title?: string;
  links: GuideLink[];
  className?: string;
}

export function RelatedGuidesSection({
  title = "함께 보면 좋은 골프장 가이드",
  links,
  className = "",
}: RelatedGuidesSectionProps) {
  if (links.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-lg font-bold text-stone-900 sm:text-xl">{title}</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-xl border border-stone-200/90 bg-white px-4 py-3 text-sm font-medium text-brand-800 transition hover:border-brand-300 hover:bg-brand-50/40"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
