/** Header / Hero / Main sections / Footer 공통 가로 정렬 */
export const SITE_CONTAINER_CLASS =
  "mx-auto w-full max-w-[1120px] px-5 md:px-6";

/** 블로그 상세 — hero·본문·카드 공통 가로 정렬 (i-rang 스타일 읽기 폭) */
export const BLOG_ARTICLE_CONTAINER_CLASS =
  "mx-auto w-full max-w-[920px] px-5 md:px-0";

/** 블로그 본문 텍스트·카드 내부 콘텐츠 폭 */
export const BLOG_CONTENT_CLASS = "mx-auto w-full max-w-[900px]";

/** 홈 메인 — 블로그 상세와 동일한 읽기 폭 */
export const HOME_PAGE_CONTAINER_CLASS = BLOG_ARTICLE_CONTAINER_CLASS;

/** @deprecated Use SITE_CONTAINER_CLASS — alias for home layout docs */
export const HOME_CONTAINER_CLASS = SITE_CONTAINER_CLASS;
