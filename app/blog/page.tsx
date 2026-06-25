import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blogPosts";
import PortalSection from "@/components/portal/PortalSection";
import BlogCard from "@/components/BlogCard";
import { buildBlogMetadata } from "@/lib/seoMetadata";

export const metadata = buildBlogMetadata();

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <section className="border-b border-stone-200/80 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            골프장·장비 가이드 블로그
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            서울 근교 코스 추천, 저렴한 골프장, Par 3, 입문 장비까지 골프를
            시작하고 코스를 고를 때 참고할 가이드를 정리했습니다.
          </p>
        </div>
      </section>

      <PortalSection
        title="전체 글"
        description="코스 가이드·장비 가이드·초보 가이드를 확인해 보세요."
      >
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} size="list" />
            </li>
          ))}
        </ul>
      </PortalSection>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Link
          href="/recommended"
          className="inline-flex text-sm font-medium text-brand-800 hover:underline"
        >
          추천 골프장 목록 보기 →
        </Link>
      </div>
    </>
  );
}
