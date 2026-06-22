import Link from "next/link";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

export default function HomeIntro() {
  return (
    <section
      aria-labelledby="home-intro-heading"
      className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-8">
        <h2
          id="home-intro-heading"
          className="text-lg font-extrabold text-region-ink sm:text-xl"
        >
          전국 골프장 지도로 빠르게 찾기
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-region-muted sm:text-base">
          GolfMap Korea는 전국 골프장의 위치, 전화번호, 홈페이지, 참고 요금을
          지도와 목록에서 함께 확인할 수 있는 참고용 서비스입니다. 서울 근교
          접근성, 예산, 초보·백돌이 조건, 대중제·나인홀 유형, 지역별 목록으로
          목적에 맞는 골프장을 비교해 보세요.
        </p>
        <nav aria-label="추천 골프장 목록" className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-region-muted">
            추천 목록
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            <li>
              <Link
                href="/collections/near-seoul"
                className={`inline-flex min-h-[40px] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:border-brand-400 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                서울 근교 골프장
              </Link>
            </li>
            <li>
              <Link
                href="/collections/near-seoul-budget"
                className={`inline-flex min-h-[40px] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:border-brand-400 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                서울 근교 저렴한 골프장
              </Link>
            </li>
            <li>
              <Link
                href="/collections/near-seoul-beginner"
                className={`inline-flex min-h-[40px] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:border-brand-400 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                서울 근교 초보자 골프장
              </Link>
            </li>
            <li>
              <Link
                href="/collections/near-seoul-baekdori"
                className={`inline-flex min-h-[40px] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:border-brand-400 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                서울 근교 백돌이 골프장
              </Link>
            </li>
            <li>
              <Link
                href="/collections/public"
                className={`inline-flex min-h-[40px] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:border-brand-400 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                대중제 골프장
              </Link>
            </li>
            <li>
              <Link
                href="/collections/nine-hole"
                className={`inline-flex min-h-[40px] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:border-brand-400 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                나인홀 골프장
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="지역별 골프장" className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-region-muted">
            지역별 보기
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["gyeonggi", "경기 골프장"],
                ["incheon", "인천 골프장"],
                ["gangwon", "강원 골프장"],
                ["jeju", "제주 골프장"],
              ] as const
            ).map(([slug, label]) => (
              <li key={slug}>
                <Link
                  href={`/regions/${slug}`}
                  className={`inline-flex min-h-[40px] items-center rounded-full border border-region-soft-border bg-region-soft/50 px-4 py-2 text-sm font-semibold text-region-ink transition hover:border-brand-600 hover:bg-brand-700 hover:text-white ${FOCUS_RING}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
