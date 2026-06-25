import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blogPosts";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

function formatBlogDate(date: string): string {
  return date.replace(/-/g, ".");
}

interface BlogCardProps {
  post: BlogPost;
  /** 홈 미리보기: 카테고리 태그 숨김 */
  hideCategory?: boolean;
  /** 홈: h-20 w-20 sm:h-24 sm:w-24 / 목록: h-24 w-24 sm:h-32 sm:w-32 */
  size?: "home" | "list";
}

export default function BlogCard({
  post,
  hideCategory = false,
  size = "list",
}: BlogCardProps) {
  const thumbClass =
    size === "home"
      ? "aspect-square w-20 sm:w-24"
      : "aspect-square w-24 sm:w-32";

  const linkClass =
    size === "home"
      ? `group flex gap-4 py-3 sm:gap-4 sm:py-4 ${FOCUS_RING}`
      : `group flex gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:gap-5 sm:p-5 ${FOCUS_RING}`;

  return (
    <Link href={`/blog/${post.slug}`} className={linkClass}>
      <div
        className={`relative ${thumbClass} shrink-0 overflow-hidden rounded-xl bg-emerald-50`}
      >
        <Image
          src={post.thumbnail}
          alt={post.thumbnailAlt}
          fill
          sizes={size === "home" ? "96px" : "128px"}
          className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {!hideCategory && (
          <p className="text-xs font-semibold text-brand-700">
            {post.categoryLabel}
          </p>
        )}
        <h3
          className={`line-clamp-2 font-bold leading-snug text-stone-900 group-hover:text-brand-900 ${hideCategory ? "text-[15px] font-semibold" : "mt-1 text-base"}`}
        >
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">
          {post.description}
        </p>
        <p className="mt-2 text-xs text-stone-400">
          {formatBlogDate(post.date)}
        </p>
      </div>
    </Link>
  );
}
