export const PROMO_IMAGE_SIZE = 1200;

export type PromoPageData = {
  slug: string;
  title: string;
  eyebrow?: string;
  description?: string;
  brandText?: string;
  domainText?: string;
  category?: string;
  topRightCopy?: string;
  backgroundImage?: string;
  mapOverlayEnabled?: boolean;
};

export const PROMO_ICON_LABELS = [
  "위치",
  "연락처",
  "홈페이지",
  "실시간 요금",
] as const;

export const DEFAULT_PROMO_EYEBROW = "전국을 연결하는 골프 정보 플랫폼";
export const DEFAULT_PROMO_BRAND = "GolfMap Korea";
export const DEFAULT_PROMO_DOMAIN = "golfmap.kr";
export const DEFAULT_PROMO_TOP_RIGHT = "FIND YOUR NEXT ROUND";
