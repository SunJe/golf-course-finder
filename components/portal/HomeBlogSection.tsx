import { getHomeBlogPosts } from "@/lib/blogPosts";
import PortalSection from "@/components/portal/PortalSection";
import HomeBlogCarousel from "@/components/portal/HomeBlogCarousel";

export default function HomeBlogSection() {
  const posts = getHomeBlogPosts();

  return (
    <PortalSection
      id="blog"
      title="블로그"
      actionHref="/blog"
      actionLabel="전체보기"
      className="border-t border-stone-100 bg-stone-50/30"
      containerVariant="narrow"
    >
      <HomeBlogCarousel posts={posts} />
    </PortalSection>
  );
}
