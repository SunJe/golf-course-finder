/** 네이버지도 DOM selector / 텍스트 패턴 — 변경 시 이 파일만 수정 */

export const NAVER_MAP_BASE = "https://map.naver.com";

export const FRAME_SELECTORS = {
  searchIframe: [
    "iframe#searchIframe",
    'iframe[name="searchIframe"]',
    'iframe[src*="map.naver.com"][src*="search"]',
  ],
  entryIframe: [
    "iframe#entryIframe",
    'iframe[name="entryIframe"]',
    'iframe[src*="pcmap.place.naver.com"]',
    'iframe[src*="place"]',
  ],
} as const;

export const TEXT_PATTERNS = {
  addressPlacesSection: /이\s*주소의\s*장소/,
  captcha: /자동\s*입력\s*방지|captcha|로봇\s*확인|비정상적인\s*접근|자동화된\s*접근/i,
  loginRequired: /로그인\s*후|로그인이\s*필요/i,
  accessBlocked: /접근\s*제한|일시\s*차단|서비스\s*이용\s*제한|이용이\s*제한|일시적으로\s*제한/i,
  excessiveAccess: /과도한\s*접근|요청\s*횟수|비정상\s*접근|잠시\s*후\s*다시/i,
} as const;

export const TAB_LABELS = {
  home: "홈",
  reservation: "예약",
  courseHole: "코스·홀",
} as const;

export const PLACE_LINK_PATTERN = /\/place\/(\d+)/;

export const SEARCH_RESULT_SELECTORS = [
  "li.UEzoS",
  "li.VLTHu",
  "div.CHC5F",
  '[class*="search_item"]',
  '[class*="place_bluelink"]',
  "a[href*='/place/']",
] as const;

export const ADDRESS_PLACE_CARD_SELECTORS = [
  'a[href*="/place/"]',
  '[class*="place"] a',
  '[class*="item"] a',
] as const;

export const RESERVATION_SELECTORS = {
  tab: 'a:has-text("예약"), button:has-text("예약"), [role="tab"]:has-text("예약")',
  calendarDay:
    'button[class*="day"], td button, [class*="calendar"] button, [class*="Day"]',
  timeSlotContainer: [
    '[class*="time"]',
    '[class*="slot"]',
    '[class*="reservation"]',
  ],
  scrollContainer: [
    '[class*="scroll"]',
    '[class*="list"]',
    '[class*="Time"]',
  ],
} as const;

export const DETAIL_FIELD_LABELS = {
  phone: "전화번호",
  homepage: "홈페이지",
  address: "주소",
} as const;
