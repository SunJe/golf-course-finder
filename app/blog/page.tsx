import Link from "next/link";
import { getAllBlogPosts, type BlogPost } from "@/lib/blogPosts";
import PortalSection from "@/components/portal/PortalSection";
import BlogCard from "@/components/BlogCard";
import SafeContentImage from "@/components/content/SafeContentImage";
import { buildBlogMetadata } from "@/lib/seoMetadata";

export const metadata = buildBlogMetadata();

/** 상단 "읽기 순서" 스텝 (입문자 동선) */
const READING_STEPS: { slug: string; blurb: string }[] = [
  {
    slug: "first-golf-round-checklist",
    blurb: "머리올리기 전 꼭 챙길 준비물부터",
  },
  {
    slug: "beginner-golf-essentials-checklist",
    blurb: "처음 시작할 때 필요한 기본 장비",
  },
  {
    slug: "golf-ball-type-guide",
    blurb: "초보에게 맞는 골프공 고르는 법",
  },
  {
    slug: "beginner-iron-men",
    blurb: "입문용 아이언(채) 선택 기준",
  },
  {
    slug: "seoul-beginner-golf-best-5",
    blurb: "첫 라운드하기 좋은 서울 근교 코스",
  },
];

/** 추천 입문 글 (서울 근교 백돌이 글은 코스 가이드로 이동) */
const STARTER_SLUGS = [
  "first-golf-round-checklist",
  "beginner-golf-essentials-checklist",
  "beginner-iron-men",
  "beginner-iron-women",
];

/** 코스 가이드 노출 우선순위 (첫 글이 featured) */
const COURSE_ORDER = [
  "seoul-beginner-golf-best-5",
  "hwaseong-golf-best-7",
  "yongin-golf-best-10",
  "pocheon-golf-best-7",
  "goyang-golf-best-5",
  "gapyeong-golf-best-6",
  "incheon-golf-top-5",
  "seoul-nine-hole-beginner-golf-top-5",
  "seoul-par3-practice-range-top-10",
  "seoul-budget-golf-best-5",
];

/** 코스 카드 메타(지역·유형) */
const COURSE_META: Record<string, string> = {
  "seoul-beginner-golf-best-5": "서울 근교 · 초보자",
  "hwaseong-golf-best-7": "화성 · 27홀·9홀",
  "yongin-golf-best-10": "용인 · 코스 비교",
  "pocheon-golf-best-7": "포천 · 코스 비교",
  "goyang-golf-best-5": "고양 · 9홀·6홀",
  "gapyeong-golf-best-6": "가평 · 코스 추천",
  "incheon-golf-top-5": "인천 · 코스 추천",
  "seoul-nine-hole-beginner-golf-top-5": "서울 근교 · 9홀",
  "seoul-par3-practice-range-top-10": "서울 근교 · 파3",
  "seoul-budget-golf-best-5": "서울 근교 · 가성비",
};

/**
 * 장비·피팅 가이드 노출 순서.
 * 남/여 동일 주제가 바로 붙어 비슷한 이미지로 보이지 않도록
 * 골프공·로프트 글을 사이사이에 끼워 정렬한다.
 */
const GEAR_ORDER = [
  "beginner-driver-men",
  "golf-ball-type-guide",
  "beginner-iron-men",
  "beginner-driver-women",
  "driver-loft-shaft-guide-men",
  "beginner-iron-women",
  "beginner-iron-top-5",
  "driver-loft-shaft-guide-women",
  "pro-tour-driver-brands-men",
  "pro-tour-driver-brands-women",
];

/** 초보 가이드 노출 우선순위 */
const BEGINNER_ORDER = [
  "first-golf-round-checklist",
  "beginner-golf-essentials-checklist",
];

/** 대회 가이드 노출 우선순위 */
const TOURNAMENT_ORDER = [
  "2026-golf-tournament-schedule-august-october",
  "2026-august-golf-tournament-schedule",
  "2026-september-golf-tournament-schedule",
  "2026-october-golf-tournament-schedule",
  "2026-mediheal-hankook-ilbo-montvert-guide",
  "2026-bmw-ladies-championship-guide",
];

const TOURNAMENT_META: Record<string, string> = {
  "2026-golf-tournament-schedule-august-october": "허브 · 8~10월",
  "2026-august-golf-tournament-schedule": "8월 · 일정표",
  "2026-september-golf-tournament-schedule": "9월 · 일정표",
  "2026-october-golf-tournament-schedule": "10월 · 일정표",
  "2026-mediheal-hankook-ilbo-montvert-guide": "관전 · 몽베르",
  "2026-bmw-ladies-championship-guide": "관전 · 해남",
};

function gearSubLabel(post: BlogPost): string {
  if (post.slug.includes("loft-shaft")) return "로프트·샤프트";
  if (post.slug.includes("driver")) return "드라이버";
  if (post.slug.includes("iron")) return "아이언";
  if (post.slug.includes("ball")) return "골프공";
  return "장비";
}

function orderByPreference(posts: BlogPost[], preferred: string[]): BlogPost[] {
  const rank = new Map(preferred.map((slug, index) => [slug, index]));
  return [...posts].sort((a, b) => {
    const ra = rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return b.date.localeCompare(a.date);
  });
}

function categoryBadge(post: BlogPost): { label: string; className: string } {
  if (post.slug.includes("loft-shaft")) {
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

/** 상단 읽기 순서 스텝 카드 */
function ReadingSteps({ posts }: { posts: Map<string, BlogPost> }) {
  const steps = READING_STEPS.map((step, index) => {
    const post = posts.get(step.slug);
    return post ? { post, blurb: step.blurb, index } : null;
  }).filter(
    (s): s is { post: BlogPost; blurb: string; index: number } => Boolean(s),
  );

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map(({ post, blurb }, i) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex h-full gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md lg:flex-col lg:gap-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-extrabold text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-stone-900 group-hover:text-brand-900">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">
                {blurb}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** 코스 가이드 대표(featured) 카드 */
function FeaturedCourseCard({ post }: { post: BlogPost }) {
  const badge = categoryBadge(post);
  const meta = COURSE_META[post.slug];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-emerald-50 lg:aspect-auto lg:min-h-[300px]">
        <SafeContentImage
          src={post.thumbnail}
          alt={post.thumbnailAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
          priority
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-800 shadow-sm">
          대표 글
        </span>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
          {meta ? (
            <span className="text-xs font-medium text-stone-500">{meta}</span>
          ) : null}
        </div>
        <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-stone-900 group-hover:text-brand-900 sm:text-2xl">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          {post.description}
        </p>
        <span className="mt-5 inline-flex w-fit items-center text-sm font-semibold text-brand-800">
          자세히 보기 →
        </span>
      </div>
    </Link>
  );
}

/** 세로형 compact 카드 (코스 하위·장비·전체 글 공용) */
function CompactCard({
  post,
  meta,
  showDescription = true,
}: {
  post: BlogPost;
  meta?: string;
  showDescription?: boolean;
}) {
  const badge = categoryBadge(post);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-emerald-50">
        <SafeContentImage
          src={post.thumbnail}
          alt={post.thumbnailAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
          {meta ? (
            <span className="text-[11px] font-medium text-stone-500">{meta}</span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-stone-900 group-hover:text-brand-900">
          {post.title}
        </h3>
        {showDescription ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">
            {post.description}
          </p>
        ) : null}
        <p className="mt-auto pt-3 text-xs text-stone-400">
          {formatBlogDate(post.date)}
        </p>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const bySlug = new Map(posts.map((post) => [post.slug, post]));

  const starterPosts = STARTER_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (post): post is BlogPost => Boolean(post),
  );

  const coursePosts = orderByPreference(
    posts.filter((post) => post.category === "course-guide"),
    COURSE_ORDER,
  );
  const featuredCourse = coursePosts[0];
  const restCourse = coursePosts.slice(1);

  const gearPosts = orderByPreference(
    posts.filter((post) => post.category === "gear-guide"),
    GEAR_ORDER,
  );
  const beginnerPosts = orderByPreference(
    posts.filter((post) => post.category === "beginner-guide"),
    BEGINNER_ORDER,
  );
  const tournamentPosts = orderByPreference(
    posts.filter((post) => post.category === "tournament-guide"),
    TOURNAMENT_ORDER,
  );

  const allPostsByDate = [...posts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <>
      <section className="border-b border-stone-200/80 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            골프장·장비·대회 가이드 블로그
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            서울 근교와 지역별 골프장 비교, 초보 골퍼를 위한 장비·피팅 정보,
            PGA TOUR·LPGA·KPGA·KLPGA 일정과 국내 대회 관전 가이드를 정리했습니다.
          </p>

          {/* 카테고리 바로가기 */}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="블로그 카테고리">
            <a
              href="#reading-order"
              className="inline-flex items-center rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              읽기 순서
            </a>
            <a
              href="#course-guide"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              코스 가이드
            </a>
            <a
              href="#gear-guide"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              장비·피팅 가이드
            </a>
            <a
              href="#beginner-guide"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              초보 가이드
            </a>
            <a
              href="#tournament-guide"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              대회·일정
            </a>
          </nav>
        </div>
      </section>

      {/* 0. 읽기 순서 Step */}
      <PortalSection
        id="reading-order"
        title="처음이라면 이 순서대로 읽어보세요"
        description="골프를 막 시작했다면 아래 순서대로 읽으면 준비물·장비·첫 코스까지 한 번에 정리됩니다."
        className="border-b border-stone-200/70 bg-brand-50/50"
      >
        <ReadingSteps posts={bySlug} />
      </PortalSection>

      {/* 1. 추천 입문 글 */}
      {starterPosts.length > 0 ? (
        <PortalSection
          id="starter"
          title="추천 입문 글"
          description="입문 단계에서 가장 먼저 챙겨두면 좋은 핵심 가이드입니다."
        >
          <ul className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
            {starterPosts.map((post) => (
              <li key={post.slug} className="h-full">
                <BlogCard post={post} size="list" />
              </li>
            ))}
          </ul>
        </PortalSection>
      ) : null}

      {/* 2. 코스 가이드 — featured + compact */}
      {coursePosts.length > 0 ? (
        <PortalSection
          id="course-guide"
          title="코스 가이드"
          description="서울 근교·고양·가평·인천과 Par 3·9홀까지 지역별 골프장 추천을 정리했습니다."
          className="border-y border-stone-200/70 bg-stone-50/70"
        >
          {featuredCourse ? <FeaturedCourseCard post={featuredCourse} /> : null}
          {restCourse.length > 0 ? (
            <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restCourse.map((post) => (
                <li key={post.slug} className="h-full">
                  <CompactCard
                    post={post}
                    meta={COURSE_META[post.slug]}
                    showDescription={false}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </PortalSection>
      ) : null}

      {/* 3. 장비·피팅 가이드 — 3열 compact grid */}
      {gearPosts.length > 0 ? (
        <PortalSection
          id="gear-guide"
          title="장비·피팅 가이드"
          description="드라이버·아이언·골프공 추천부터 로프트·샤프트 선택까지 장비 선택을 도와드립니다."
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gearPosts.map((post) => (
              <li key={post.slug} className="h-full">
                <CompactCard post={post} meta={gearSubLabel(post)} />
              </li>
            ))}
          </ul>
        </PortalSection>
      ) : null}

      {/* 4. 초보 가이드 */}
      {beginnerPosts.length > 0 ? (
        <PortalSection
          id="beginner-guide"
          title="초보 가이드"
          description="첫 라운드 준비물과 골프장 선택 기준 등 입문자가 알아두면 좋은 내용을 담았습니다."
          className="border-y border-stone-200/70 bg-stone-50/70"
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beginnerPosts.map((post) => (
              <li key={post.slug} className="h-full">
                <CompactCard post={post} meta="체크리스트" />
              </li>
            ))}
          </ul>
        </PortalSection>
      ) : null}

      {/* 5. 대회 가이드 */}
      {tournamentPosts.length > 0 ? (
        <PortalSection
          id="tournament-guide"
          title="대회·일정"
          description="2026년 8~10월 PGA·LPGA·KPGA·KLPGA 일정과 국내 관전 가이드를 모았습니다."
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournamentPosts.map((post) => (
              <li key={post.slug} className="h-full">
                <CompactCard
                  post={post}
                  meta={TOURNAMENT_META[post.slug]}
                />
              </li>
            ))}
          </ul>
        </PortalSection>
      ) : null}

      {/* 6. 전체 글 (최신순, compact) */}
      <PortalSection
        id="all-posts"
        title="전체 글"
        description="가장 최근에 올라온 글부터 모두 모아봤습니다."
        className="border-t border-stone-200/70 bg-stone-50/40"
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {allPostsByDate.map((post) => (
            <li key={post.slug} className="h-full">
              <CompactCard post={post} showDescription={false} />
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
