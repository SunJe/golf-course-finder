import Link from "next/link";
import type { BlogPost } from "@/lib/blogPosts";
import SafeContentImage from "@/components/content/SafeContentImage";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** 로프트·샤프트 선택 글은 '피팅 가이드'로 구분 표시 */
const FITTING_SLUGS = new Set([
  "driver-loft-shaft-guide-men",
  "driver-loft-shaft-guide-women",
]);

function getCategoryBadge(post: BlogPost): { label: string; className: string } {
  if (FITTING_SLUGS.has(post.slug)) {
    return { label: "피팅 가이드", className: "bg-violet-100 text-violet-700" };
  }
  switch (post.category) {
    case "course-guide":
      return { label: "코스 가이드", className: "bg-emerald-100 text-emerald-700" };
    case "gear-guide":
      return { label: "장비 가이드", className: "bg-sky-100 text-sky-700" };
    case "beginner-guide":
      return { label: "초보 가이드", className: "bg-amber-100 text-amber-800" };
    case "tournament-guide":
      return { label: "대회 가이드", className: "bg-rose-100 text-rose-800" };
    default:
      return { label: post.categoryLabel, className: "bg-stone-100 text-stone-700" };
  }
}

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
      : `group flex h-full gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:gap-5 sm:p-5 ${FOCUS_RING}`;

  const badge = getCategoryBadge(post);

  return (
    <Link href={`/blog/${post.slug}`} className={linkClass}>
      <div
        className={`relative ${thumbClass} shrink-0 self-start overflow-hidden rounded-xl bg-emerald-50`}
      >
        <SafeContentImage
          src={post.thumbnail}
          alt={post.thumbnailAlt}
          fill
          sizes={size === "home" ? "96px" : "128px"}
          className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {!hideCategory && (
          <span
            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
        <h3
          className={`line-clamp-2 font-bold leading-snug text-stone-900 group-hover:text-brand-900 ${hideCategory ? "text-[15px] font-semibold" : "mt-1.5 text-base"}`}
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
