import Link from "next/link";
import type { CollectionSlug } from "@/lib/collectionLanding";
import {
  getCollectionTips,
  getRelatedBlogGuidesForCollection,
  getRelatedCollectionLinks,
} from "@/lib/contentGuides";
import { RelatedGuidesSection } from "@/components/RelatedGuidesSection";

interface CollectionGuideFooterProps {
  slug: CollectionSlug;
  h1: string;
}

export function CollectionGuideFooter({ slug, h1 }: CollectionGuideFooterProps) {
  const tips = getCollectionTips(slug);
  const blogGuides = getRelatedBlogGuidesForCollection(slug);
  const collectionLinks = getRelatedCollectionLinks(slug);

  return (
    <div className="mt-10 space-y-10">
      <section className="rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-bold text-region-ink sm:text-xl">
          {h1} 선택 전 확인하면 좋은 점
        </h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed text-region-muted">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-region-soft-border bg-region-soft/40 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-region-ink sm:text-xl">
          함께 보면 좋은 페이지
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {collectionLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl border border-region-soft-border bg-white px-4 py-3 text-sm font-medium text-brand-800 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RelatedGuidesSection links={blogGuides} />
    </div>
  );
}
