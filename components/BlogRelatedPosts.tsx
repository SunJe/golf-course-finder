import Link from "next/link";
import { getBlogPostBySlug, type BlogPost } from "@/lib/blogPosts";

interface BlogRelatedPostsProps {
  slugs: string[];
}

export function BlogRelatedPosts({ slugs }: BlogRelatedPostsProps) {
  const posts = slugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => Boolean(post));

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-stone-200 pt-10">
      <h2 className="text-xl font-bold text-stone-900">함께 보면 좋은 글</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-xl border border-stone-200/90 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-900"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
