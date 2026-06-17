import type { Course } from "@/types/course";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_KAKAO_MAP_LEVEL,
  SELECTED_KAKAO_MAP_LEVEL,
} from "@/lib/constants";
import { formatGreenFeeShort } from "@/lib/format";

export interface KakaoMapsApi {
  LatLng: new (lat: number, lng: number) => unknown;
  LatLngBounds: new (sw: unknown, ne: unknown) => unknown;
}

export interface KakaoMapInstance {
  setCenter: (pos: unknown) => void;
  setLevel: (level: number) => void;
  setBounds: (
    bounds: unknown,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ) => void;
  panTo: (pos: unknown) => void;
  getLevel: () => number;
  getBounds?: () => {
    getSouthWest: () => { getLat: () => number; getLng: () => number };
    getNorthEast: () => { getLat: () => number; getLng: () => number };
    contains: (latlng: unknown) => boolean;
  };
  relayout?: () => void;
}

export interface LabelDisplayMode {
  showLabel: boolean;
  nameOnly: boolean;
}

/**
 * Kakao level: 숫자가 클수록 줌아웃 — 핀 표시 여부 (라벨과 분리)
 * - selected/hovered: 항상 표시
 * - level >= 10: 일반 핀 숨김 (클러스터 위주)
 * - level 8~9, <= 7: 개별 핀 표시
 */
export function shouldShowPin(
  level: number,
  isSelected: boolean,
  isHovered: boolean,
): boolean {
  if (isSelected || isHovered) return true;
  if (level >= 10) return false;
  return true;
}

/**
 * 이름 라벨 표시 여부 (핀과 분리)
 * - selected/hovered: 항상
 * - level <= 6 (데스크톱): 전체 라벨
 * - level 8~9: hover/selected만 (shouldShowLabel에서 selected/hover 처리)
 * - 모바일: selected/hover만
 */
export function shouldShowLabel(
  level: number,
  isMobile: boolean,
  isSelected: boolean,
  isHovered: boolean,
): boolean {
  if (isSelected || isHovered) return true;
  if (isMobile) return false;
  if (level <= 6) return true;
  return false;
}

/** @deprecated shouldShowPin 사용 */
export const shouldShowPinOverlay = shouldShowPin;
/** @deprecated shouldShowPin 사용 */
export const shouldShowIndividualPin = shouldShowPin;

/**
 * 라벨 내용 모드 (shouldShowLabel이 true일 때만 호출)
 */
export function getLabelDisplayMode(
  level: number,
  isMobile: boolean,
  isSelected: boolean,
  isHovered = false,
): LabelDisplayMode {
  if (isSelected) {
    return { showLabel: true, nameOnly: isMobile };
  }
  if (isHovered) {
    return { showLabel: true, nameOnly: true };
  }
  if (level <= 6 && !isMobile) {
    return { showLabel: true, nameOnly: true };
  }
  return { showLabel: false, nameOnly: false };
}

export function getPinMarkerDataUrl(
  variant: "default" | "selected" | "hovered",
): string {
  const { w, h } = PIN_SIZES[variant];
  const svg = buildPinSvg(
    w,
    h,
    PIN_COLORS[variant],
    PIN_STROKES[variant],
    PIN_SHADOWS[variant],
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function updatePinOverlayElement(
  pinEl: HTMLButtonElement,
  variant: "default" | "selected" | "hovered",
): void {
  const img = pinEl.querySelector("img");
  if (img) {
    img.src = getPinMarkerDataUrl(variant);
    const { w, h } = PIN_SIZES[variant];
    const pad = 4;
    img.width = w + pad * 2;
    img.height = h + pad * 2;
  }
  pinEl.style.zIndex = variant === "selected" ? "300" : variant === "hovered" ? "200" : "1";
}

/** 클릭 가능한 주황색 핀 DOM (CustomOverlay content) */
export function createPinOverlayElement(
  variant: "default" | "selected" | "hovered",
): HTMLButtonElement {
  const { w, h } = PIN_SIZES[variant];
  const pad = 4;
  const canvasW = w + pad * 2;
  const canvasH = h + pad * 2;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.style.pointerEvents = "auto";
  btn.style.cursor = "pointer";
  btn.style.background = "transparent";
  btn.style.border = "none";
  btn.style.padding = "0";
  btn.style.margin = "0";
  btn.style.lineHeight = "0";
  btn.style.display = "block";
  btn.style.visibility = "visible";
  btn.style.opacity = "1";
  btn.style.touchAction = "manipulation";
  btn.setAttribute("aria-label", "골프장 선택");

  const img = document.createElement("img");
  img.src = getPinMarkerDataUrl(variant);
  img.width = canvasW;
  img.height = canvasH;
  img.draggable = false;
  img.alt = "";
  img.style.display = "block";
  img.style.pointerEvents = "none";
  img.style.userSelect = "none";

  btn.appendChild(img);
  updatePinOverlayElement(btn, variant);
  return btn;
}

/** MarkerClusterer용 투명 hit marker */
export function createClusterHitMarkerImage(
  maps: Record<string, unknown>,
): unknown {
  const MarkerImage = maps.MarkerImage as new (
    src: string,
    size: unknown,
    opts: { offset: unknown },
  ) => unknown;
  const Size = maps.Size as new (w: number, h: number) => unknown;
  const Point = maps.Point as new (x: number, y: number) => unknown;

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" fill="transparent"/></svg>';
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new MarkerImage(url, new Size(24, 24), {
    offset: new Point(12, 24),
  });
}

/** courses 좌표로 경계 계산 */
export function getCoursesBounds(courses: Course[]) {
  if (courses.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const course of courses) {
    minLat = Math.min(minLat, course.latitude);
    maxLat = Math.max(maxLat, course.latitude);
    minLng = Math.min(minLng, course.longitude);
    maxLng = Math.max(maxLng, course.longitude);
  }

  return { minLat, maxLat, minLng, maxLng };
}

function isNationwideView(courses: Course[]): boolean {
  if (courses.length >= 25) return true;
  const bounds = getCoursesBounds(courses);
  if (!bounds) return true;
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  return latSpan > 3.5 || lngSpan > 3.5;
}

/** 검색 결과에 맞게 지도 영역 조정 (사용자 요청 시에만 호출) */
export function fitKakaoMapToCourses(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
  courses: Course[],
  padding = { top: 48, right: 48, bottom: 48, left: 48 },
) {
  if (courses.length === 0) return;

  const { LatLng, LatLngBounds } = maps;

  if (courses.length === 1) {
    const course = courses[0];
    map.setCenter(new LatLng(course.latitude, course.longitude));
    map.setLevel(SELECTED_KAKAO_MAP_LEVEL);
    return;
  }

  if (isNationwideView(courses)) {
    map.setCenter(new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng));
    map.setLevel(DEFAULT_KAKAO_MAP_LEVEL);
    return;
  }

  const bounds = getCoursesBounds(courses);
  if (!bounds) return;

  const pad = 0.08;
  const sw = new LatLng(bounds.minLat - pad, bounds.minLng - pad);
  const ne = new LatLng(bounds.maxLat + pad, bounds.maxLng + pad);
  const latLngBounds = new LatLngBounds(sw, ne);

  map.setBounds(
    latLngBounds,
    padding.top,
    padding.right,
    padding.bottom,
    padding.left,
  );
}

/** 최초 로딩: 전체 course bounds로 fit (제주 포함) */
export function fitInitialNationwideView(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
  courses: Course[],
  padding = { top: 56, right: 48, bottom: 64, left: 48 },
) {
  if (courses.length === 0) return;

  const bounds = getCoursesBounds(courses);
  if (!bounds) return;

  const { LatLng, LatLngBounds } = maps;
  const latPad = 0.12;
  const lngPad = 0.1;
  const sw = new LatLng(bounds.minLat - latPad, bounds.minLng - lngPad);
  const ne = new LatLng(bounds.maxLat + latPad, bounds.maxLng + lngPad);

  map.setBounds(
    new LatLngBounds(sw, ne),
    padding.top,
    padding.right,
    padding.bottom,
    padding.left,
  );
}

/** @deprecated fitInitialNationwideView 사용 */
export function setInitialKakaoMapView(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
  courses: Course[] = [],
) {
  if (courses.length > 0) {
    fitInitialNationwideView(map, maps, courses);
    return;
  }
  const { LatLng } = maps;
  map.setCenter(new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng));
  map.setLevel(DEFAULT_KAKAO_MAP_LEVEL);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** MarkerClusterer 클러스터 스타일 */
export function buildClusterStyles() {
  const base = {
    border: "3px solid #ffffff",
    color: "#ffffff",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
    fontFamily: "inherit",
  };

  return [
    {
      ...base,
      width: "42px",
      height: "42px",
      lineHeight: "36px",
      fontSize: "12px",
      background: "rgba(249, 115, 22, 0.92)",
      borderRadius: "21px",
    },
    {
      ...base,
      width: "50px",
      height: "50px",
      lineHeight: "44px",
      fontSize: "13px",
      background: "rgba(234, 88, 12, 0.94)",
      borderRadius: "25px",
    },
    {
      ...base,
      width: "58px",
      height: "58px",
      lineHeight: "52px",
      fontSize: "14px",
      background: "rgba(194, 65, 12, 0.96)",
      borderRadius: "29px",
    },
  ];
}

const PIN_SIZES = {
  default: { w: 22, h: 28 },
  hovered: { w: 26, h: 34 },
  selected: { w: 30, h: 40 },
} as const;

const PIN_COLORS = {
  default: "#F97316",
  hovered: "#FB923C",
  selected: "#E5484D",
} as const;

const PIN_STROKES = { default: 2, hovered: 2.5, selected: 2.5 } as const;
const PIN_SHADOWS = { default: 1.5, hovered: 2, selected: 2.5 } as const;

function buildPinSvg(
  width: number,
  height: number,
  color: string,
  strokeWidth: number,
  shadowStd: number,
): string {
  const pad = 4;
  const canvasW = width + pad * 2;
  const canvasH = height + pad * 2;
  const cx = canvasW / 2;
  const tipY = pad + height;
  const headY = pad;
  const headR = width * 0.38;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
    <defs>
      <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="${shadowStd}" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>
    <g filter="url(#s)">
      <path d="M${cx} ${tipY} C${cx} ${tipY} ${pad + width} ${pad + height * 0.58} ${pad + width} ${pad + height * 0.36}
        C${pad + width} ${pad + height * 0.14} ${cx + headR} ${headY} ${cx} ${headY}
        C${cx - headR} ${headY} ${pad} ${pad + height * 0.14} ${pad} ${pad + height * 0.36}
        C${pad} ${pad + height * 0.58} ${cx} ${tipY} ${cx} ${tipY}Z"
        fill="${color}" stroke="#ffffff" stroke-width="${strokeWidth}"/>
      <circle cx="${cx}" cy="${pad + height * 0.34}" r="${width * 0.11}" fill="#ffffff"/>
    </g>
  </svg>`;
}

/** kakao.maps.Marker용 location pin 이미지 */
export function createPinMarkerImage(
  maps: Record<string, unknown>,
  variant: "default" | "selected" | "hovered",
): unknown {
  const MarkerImage = maps.MarkerImage as new (
    src: string,
    size: unknown,
    opts: { offset: unknown },
  ) => unknown;
  const Size = maps.Size as new (w: number, h: number) => unknown;
  const Point = maps.Point as new (x: number, y: number) => unknown;

  const { w, h } = PIN_SIZES[variant];
  const pad = 4;
  const canvasW = w + pad * 2;
  const canvasH = h + pad * 2;
  const svg = buildPinSvg(
    w,
    h,
    PIN_COLORS[variant],
    PIN_STROKES[variant],
    PIN_SHADOWS[variant],
  );
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new MarkerImage(url, new Size(canvasW, canvasH), {
    offset: new Point(canvasW / 2, canvasH),
  });
}

/** @deprecated createPinMarkerImage 사용 */
export const createDotMarkerImage = createPinMarkerImage;

const PILL_STYLE =
  "background:#ffffff;color:#1f2937;font-weight:600;padding:5px 10px;font-size:11px;" +
  "border:1px solid #fed7aa;border-radius:999px;font-family:inherit;" +
  "box-shadow:0 2px 8px rgba(0,0,0,0.12);display:inline-block;" +
  "max-width:168px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

const PILL_SELECTED_STYLE =
  "background:#ffffff;color:#1f2937;font-weight:600;padding:5px 10px;font-size:11px;" +
  "border:1px solid #fecaca;border-radius:10px;font-family:inherit;" +
  "box-shadow:0 2px 10px rgba(0,0,0,0.15);display:inline-block;" +
  "max-width:168px;line-height:1.35;text-align:left;";

/**
 * 핀 좌표(팁) 기준 오른쪽 아래에 붙는 라벨 DOM
 */
export function createLabelOverlayElement(
  course: Course,
  mode: LabelDisplayMode,
): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.pointerEvents = "none";
  wrap.style.position = "relative";
  wrap.style.transform = "translate(10px, 6px)";
  wrap.style.whiteSpace = "nowrap";

  const name =
    course.name.length > 18 ? `${course.name.slice(0, 18)}…` : course.name;

  if (mode.nameOnly) {
    wrap.innerHTML = `<span style="${PILL_STYLE}">${escapeHtml(name)}</span>`;
    return wrap;
  }

  const price = formatGreenFeeShort(course.weekdayGreenFeeMin);
  wrap.innerHTML = `
    <span style="${PILL_SELECTED_STYLE}">
      <span style="display:block;font-size:11px;font-weight:700;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:148px;">${escapeHtml(name)}</span>
      <span style="display:block;font-size:10px;font-weight:700;color:#E5484D;margin-top:2px;">${escapeHtml(price)}</span>
    </span>`;

  return wrap;
}

/** 상세 페이지 단일 마커 이미지 */
export function createDetailMarkerImage(maps: Record<string, unknown>): unknown {
  const MarkerImage = maps.MarkerImage as new (
    src: string,
    size: unknown,
    opts: { offset: unknown },
  ) => unknown;
  const Size = maps.Size as new (w: number, h: number) => unknown;
  const Point = maps.Point as new (x: number, y: number) => unknown;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38"><defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)"/></filter></defs><g filter="url(#s)"><path d="M14 38C14 38 26 22 26 12C26 5.37 20.63 0 14 0C7.37 0 2 5.37 2 12C2 22 14 38 14 38Z" fill="#F97316" stroke="#fff" stroke-width="2"/><circle cx="14" cy="12" r="4.5" fill="#fff"/></g></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new MarkerImage(url, new Size(28, 38), {
    offset: new Point(14, 38),
  });
}
