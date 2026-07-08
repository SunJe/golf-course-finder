import type { BlogPost } from "@/lib/blogPosts";
import BlogCard from "@/components/BlogCard";

interface HomeBlogCarouselProps {
  posts: BlogPost[];
}

/**
 * 서버에서 이미 정렬·선정된 관련 글을 표시한다.
 * 클라이언트 랜덤 재배치를 하지 않아 hydration·지역 불일치를 막는다.
 */
export default function HomeBlogCarousel({ posts }: HomeBlogCarouselProps) {
  return (
    <div
      className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2 md:gap-y-4"
      aria-label="블로그 글 목록"
    >
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} size="home" hideCategory />
      ))}
    </div>
  );
}
