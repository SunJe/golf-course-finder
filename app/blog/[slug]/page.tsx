import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blogPosts";
import BlogPostJsonLd from "@/components/BlogPostJsonLd";
import { BlogPostBody } from "@/components/BlogPostBody";
import SafeContentImage from "@/components/content/SafeContentImage";
import { buildBlogPostMetadata } from "@/lib/seoMetadata";
import { enrichBlogPost } from "@/lib/enrichBlogPost";
import { RelatedGuidesSection } from "@/components/RelatedGuidesSection";
import { getRelatedBlogGuidesFromSlugs } from "@/lib/contentGuides";
import {
  BLOG_ARTICLE_CONTAINER_CLASS,
  BLOG_CONTENT_CLASS,
} from "@/lib/siteLayout";

export const revalidate = 86400;

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return { title: "글을 찾을 수 없습니다 | GolfMap Korea", robots: { index: false } };
  }
  return buildBlogPostMetadata(post);
}

function formatBlogDate(date: string): string {
  return date.replace(/-/g, ".");
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();
  const enrichedPost = await enrichBlogPost(post);

  const relatedGuideLinks = getRelatedBlogGuidesFromSlugs(
    post.relatedPostSlugs ?? [],
  );

  return (
    <>
      <BlogPostJsonLd post={enrichedPost} />
      <article className="pb-16">
        <header className="border-b border-stone-200/80 bg-gradient-to-b from-brand-50/50 to-white">
          <div
            className={`${BLOG_ARTICLE_CONTAINER_CLASS} grid gap-6 py-8 sm:py-10 lg:grid-cols-[1fr_168px] lg:items-start lg:gap-8`}
          >
            <div className={BLOG_CONTENT_CLASS}>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                {post.categoryLabel}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-3xl">
                {post.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                {post.description}
              </p>
              <p className="mt-4 text-sm text-stone-400">
                {formatBlogDate(post.date)}
              </p>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="relative aspect-square w-[168px] shrink-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100 shadow-sm">
                <SafeContentImage
                  src={post.thumbnail}
                  alt={post.thumbnailAlt}
                  fill
                  sizes="168px"
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        <div className={`${BLOG_ARTICLE_CONTAINER_CLASS} py-8 sm:py-10`}>
          <div className={BLOG_CONTENT_CLASS}>
            <BlogPostBody post={enrichedPost} />
          </div>

          {!(post.relatedPostSlugs && post.relatedPostSlugs.length > 0) && (
            <RelatedGuidesSection
              title="함께 보면 좋은 글"
              className={`${BLOG_CONTENT_CLASS} mt-12`}
              links={relatedGuideLinks}
            />
          )}

          <div
            className={`${BLOG_CONTENT_CLASS} mt-12 flex flex-wrap gap-4 border-t border-stone-100 pt-8 text-sm`}
          >
            <Link href="/blog" className="font-medium text-brand-800 hover:underline">
              ← 블로그 목록
            </Link>
            {post.relatedCollectionSlug && (
              <Link
                href={`/collections/${post.relatedCollectionSlug}`}
                className="font-medium text-brand-800 hover:underline"
              >
                관련 컬렉션 보기 →
              </Link>
            )}
            {post.relatedRegionSlug && (
              <Link
                href={`/regions/${post.relatedRegionSlug}`}
                className="font-medium text-brand-800 hover:underline"
              >
                {post.relatedRegionSlug} 지역 보기 →
              </Link>
            )}
            <Link href="/recommended" className="font-medium text-brand-800 hover:underline">
              추천 골프장 보기 →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
