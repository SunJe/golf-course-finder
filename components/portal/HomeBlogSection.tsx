import Link from "next/link";
import { getHomeBlogPosts } from "@/lib/blogPosts";
import PortalSection from "@/components/portal/PortalSection";
import HomeBlogCarousel from "@/components/portal/HomeBlogCarousel";

export default function HomeBlogSection() {
  const posts = getHomeBlogPosts();

  return (
    <PortalSection
      id="blog"
      title="최신 글"
      className="border-t border-stone-100 bg-stone-50/30"
      containerVariant="narrow"
    >
      <HomeBlogCarousel posts={posts.slice(0, 3)} />
      <div className="mt-5">
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800 sm:w-auto"
        >
          블로그 더 보기
        </Link>
      </div>
    </PortalSection>
  );
}
