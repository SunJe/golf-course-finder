import type { Course } from "@/types/course";

import {
  DEFAULT_MAP_CENTER,
  DESKTOP_INITIAL_MAP_CENTER,
  DESKTOP_INITIAL_KAKAO_MAP_LEVEL,
  DEFAULT_FIT_GEO_PADDING,
  INITIAL_KAKAO_MAP_LEVEL,
  MOBILE_FIT_GEO_PADDING,
  MOBILE_INITIAL_KAKAO_MAP_LEVEL,
  MOBILE_INITIAL_MAP_CENTER,
  MOBILE_INITIAL_MAX_KAKAO_MAP_LEVEL,
  MOBILE_MAP_VISUAL_CENTER_LAT_OFFSET,
  SEARCH_RESULT_FOCUS_LEVEL,
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
  abovePin: boolean;
}



export interface MarkerDisplayContext {

  level: number;

  isMobile: boolean;

  isSelected: boolean;

  isHovered: boolean;

  effectiveGroupSize: number;

  clusteringEnabled: boolean;

  /** 현재 지도에 표시 중인 course 수 — 모바일 label 정책용 */
  displayedCount?: number;

  hasSearchKeyword?: boolean;

}



/** pin 표시 — cluster 묶음이면 숨김, selected/hover는 항상 표시 */
export function shouldShowPin(ctx: MarkerDisplayContext): boolean {
  if (ctx.isSelected || ctx.isHovered) return true;
  if (ctx.effectiveGroupSize >= 2) return false;
  return true;
}



export function shouldShowLabel(ctx: MarkerDisplayContext): boolean {

  if (!shouldShowPin(ctx)) return false;

  if (ctx.isMobile) {
    if (ctx.isSelected) return true;
    const count = ctx.displayedCount ?? Number.POSITIVE_INFINITY;
    const hasSearch = ctx.hasSearchKeyword ?? false;
    if (count <= 25 && ctx.level <= 7) return true;
    if (hasSearch && count <= 40 && ctx.level <= 7) return true;
    return false;
  }

  if (ctx.isSelected || ctx.isHovered) return true;

  if (ctx.level <= 6) return true;

  return false;

}



/** popup은 selected 상태에서만 (hover만으로는 표시하지 않음) */

export function shouldShowPopup(ctx: Pick<MarkerDisplayContext, "isSelected">): boolean {

  return ctx.isSelected;

}



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
    return { showLabel: true, nameOnly: isMobile, abovePin: true };
  }
  if (isHovered) {
    return { showLabel: true, nameOnly: true, abovePin: true };
  }
  if (level <= 6 && !isMobile) {
    return { showLabel: true, nameOnly: true, abovePin: true };
  }
  return { showLabel: false, nameOnly: false, abovePin: true };
}



/** 고정 pin 캔버스 크기 — variant마다 DOM 크기를 바꾸지 않음 */

const PIN_BODY = { w: 24, h: 32 } as const;

const PIN_PAD = 4;

export const PIN_CANVAS_W = PIN_BODY.w + PIN_PAD * 2;

export const PIN_CANVAS_H = PIN_BODY.h + PIN_PAD * 2;



const PIN_COLORS = {
  default: "#F97316",
  hovered: "#FB923C",
  selected: "#2563EB",
} as const;

const PIN_STROKES = { default: 2, hovered: 2.5, selected: 3 } as const;
const PIN_SHADOWS = { default: 1.5, hovered: 2.5, selected: 3.5 } as const;

/** 색상/테두리만 변경 — scale 없음 (anchor 흔들림 방지) */
const PIN_SCALES = {
  default: 1,
  hovered: 1,
  selected: 1,
} as const;

/** pin tip 기준 label/popup y offset (px) */
export const LABEL_OFFSET_ABOVE_PIN_PX = PIN_CANVAS_H + 8;
export const POPUP_OFFSET_ABOVE_PIN_PX = PIN_CANVAS_H + 10;



export function getPinMarkerDataUrl(

  variant: "default" | "selected" | "hovered",

): string {

  const svg = buildPinSvg(

    PIN_BODY.w,

    PIN_BODY.h,

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

    img.style.width = `${PIN_CANVAS_W}px`;

    img.style.height = `${PIN_CANVAS_H}px`;

    img.style.transformOrigin = "50% 100%";

    img.style.transform = `scale(${PIN_SCALES[variant]})`;

  }

  pinEl.style.width = `${PIN_CANVAS_W}px`;

  pinEl.style.height = `${PIN_CANVAS_H}px`;

  pinEl.style.transformOrigin = "50% 100%";

  pinEl.style.zIndex =
    variant === "selected" ? "3" : variant === "hovered" ? "2" : "1";
  if (variant === "hovered") {
    pinEl.style.filter = "brightness(1.08)";
  } else {
    pinEl.style.filter = "";
  }
}



/** 클릭 가능한 주황색 핀 DOM (CustomOverlay content) */

export function createPinOverlayElement(

  variant: "default" | "selected" | "hovered" = "default",

): HTMLButtonElement {

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

  btn.style.transformOrigin = "50% 100%";

  btn.style.position = "relative";

  btn.setAttribute("aria-label", "골프장 선택");



  const img = document.createElement("img");

  img.src = getPinMarkerDataUrl(variant);

  img.width = PIN_CANVAS_W;

  img.height = PIN_CANVAS_H;

  img.draggable = false;

  img.alt = "";

  img.style.display = "block";

  img.style.pointerEvents = "none";

  img.style.userSelect = "none";



  btn.appendChild(img);

  updatePinOverlayElement(btn, variant);

  return btn;

}

/** favorite heart overlay layer z-index (cluster/pin 위, selected popup 아래) */
export const FAVORITE_HEART_OVERLAY_Z_INDEX = 2100;

/** visited overlay layer z-index */
export const VISITED_OVERLAY_Z_INDEX = 2090;

type CollectionOverlayClickHandler = (e: Event) => void;

function attachCollectionOverlayClick(
  el: HTMLButtonElement,
  onClick: CollectionOverlayClickHandler,
): void {
  const handler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };
  el.addEventListener("click", handler);
  el.addEventListener("touchend", handler);
}

const MAP_COLLECTION_ICON_SIZE = 20;
const MAP_COLLECTION_HIT_SIZE = 36;
/** favorite/visited 동시 표시 시 아이콘 간격 */
const MAP_COLLECTION_ICON_OFFSET = 14;
const MAP_COLLECTION_ICON_SHADOW =
  "filter:drop-shadow(0 0 1px rgba(255,255,255,0.85)) drop-shadow(0 1px 1px rgba(0,0,0,0.18));";

function createMapCollectionIconButton(
  className: string,
  ariaLabel: string,
  offsetX: number,
  offsetY: number,
  svgHtml: string,
  onClick: CollectionOverlayClickHandler,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.setAttribute("aria-label", ariaLabel);
  btn.style.cssText =
    "position:absolute;left:50%;top:50%;" +
    `transform:translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px));` +
    `width:${MAP_COLLECTION_HIT_SIZE}px;height:${MAP_COLLECTION_HIT_SIZE}px;` +
    "border:none;border-radius:0;background:transparent;box-shadow:none;" +
    "display:flex;align-items:center;justify-content:center;" +
    "pointer-events:auto;cursor:pointer;user-select:none;line-height:0;" +
    "touch-action:manipulation;padding:0;";
  btn.innerHTML = svgHtml;
  attachCollectionOverlayClick(btn, onClick);
  return btn;
}

/** 즐겨찾기 heart overlay DOM — cluster/pin과 독립 layer, 클릭 가능 */
export function createFavoriteHeartOverlayRoot(
  onClick: CollectionOverlayClickHandler,
): HTMLDivElement {
  const root = document.createElement("div");
  root.style.width = "0";
  root.style.height = "0";
  root.style.overflow = "visible";
  root.style.pointerEvents = "none";

  const heartSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ` +
    `width="${MAP_COLLECTION_ICON_SIZE}" height="${MAP_COLLECTION_ICON_SIZE}" ` +
    `fill="#e11d48" aria-hidden="true" style="${MAP_COLLECTION_ICON_SHADOW}">` +
    `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

  const btn = createMapCollectionIconButton(
    "course-favorite-heart-overlay",
    "즐겨찾기 골프장 선택",
    MAP_COLLECTION_ICON_OFFSET,
    -MAP_COLLECTION_ICON_OFFSET,
    heartSvg,
    onClick,
  );
  root.appendChild(btn);

  return root;
}

/** 가본 골프장 visited overlay DOM */
export function createVisitedOverlayRoot(
  onClick: CollectionOverlayClickHandler,
): HTMLDivElement {
  const root = document.createElement("div");
  root.style.width = "0";
  root.style.height = "0";
  root.style.overflow = "visible";
  root.style.pointerEvents = "none";

  const flagSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ` +
    `width="${MAP_COLLECTION_ICON_SIZE}" height="${MAP_COLLECTION_ICON_SIZE}" ` +
    `fill="none" aria-hidden="true" style="${MAP_COLLECTION_ICON_SHADOW}">` +
    `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="#16a34a"/>` +
    `<path d="M4 22v-7" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/></svg>`;

  const btn = createMapCollectionIconButton(
    "course-visited-overlay",
    "가본 골프장 선택",
    -MAP_COLLECTION_ICON_OFFSET,
    -MAP_COLLECTION_ICON_OFFSET,
    flagSvg,
    onClick,
  );
  root.appendChild(btn);

  return root;
}

/** @deprecated pin badge — favorite heart overlay layer 사용 */
export function updatePinFavoriteBadge(
  pinEl: HTMLButtonElement,
  _isFavorite: boolean,
): void {
  const badge = pinEl.querySelector(".course-pin-favorite-badge");
  if (badge instanceof HTMLElement) {
    badge.style.display = "none";
  }
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
    if (
      !Number.isFinite(course.latitude) ||
      !Number.isFinite(course.longitude)
    ) {
      continue;
    }
    minLat = Math.min(minLat, course.latitude);
    maxLat = Math.max(maxLat, course.latitude);
    minLng = Math.min(minLng, course.longitude);
    maxLng = Math.max(maxLng, course.longitude);
  }

  if (!Number.isFinite(minLat)) return null;

  return { minLat, maxLat, minLng, maxLng };
}

export interface MapViewPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface GeoFitPadding {
  latSouth: number;
  latNorth: number;
  lngWest: number;
  lngEast: number;
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

    map.setLevel(SEARCH_RESULT_FOCUS_LEVEL);

    return;

  }



  if (isNationwideView(courses)) {
    map.setCenter(new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng));
    map.setLevel(INITIAL_KAKAO_MAP_LEVEL);
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
  padding: MapViewPadding = { top: 56, right: 48, bottom: 64, left: 48 },
  geoPadding: GeoFitPadding = DEFAULT_FIT_GEO_PADDING,
): boolean {
  if (courses.length === 0) return false;

  const bounds = getCoursesBounds(courses);
  if (!bounds) return false;

  const { LatLng, LatLngBounds } = maps;
  const sw = new LatLng(
    bounds.minLat - geoPadding.latSouth,
    bounds.minLng - geoPadding.lngWest,
  );
  const ne = new LatLng(
    bounds.maxLat + geoPadding.latNorth,
    bounds.maxLng + geoPadding.lngEast,
  );

  map.setBounds(
    new LatLngBounds(sw, ne),
    padding.top,
    padding.right,
    padding.bottom,
    padding.left,
  );

  return true;
}

/** fitBounds 후 모바일 시각적 중심 보정 (하단 sheet·북쪽 바다 고려) */
export function applyMobileMapVisualCenterOffset(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
  latOffset = MOBILE_MAP_VISUAL_CENTER_LAT_OFFSET,
): void {
  const bounds = map.getBounds?.();
  if (!bounds) return;

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const { LatLng } = maps;
  const lat = (sw.getLat() + ne.getLat()) / 2 + latOffset;
  const lng = (sw.getLng() + ne.getLng()) / 2;
  map.setCenter(new LatLng(lat, lng));
}

/** 모바일 첫 화면: 전체 course bounds + UI/지리 padding */
export function fitInitialMobileNationwideView(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
  courses: Course[],
  padding: MapViewPadding,
): boolean {
  const fitted = fitInitialNationwideView(
    map,
    maps,
    courses,
    padding,
    MOBILE_FIT_GEO_PADDING,
  );
  if (fitted) {
    applyMobileMapVisualCenterOffset(map, maps);
    const level = map.getLevel();
    if (level > MOBILE_INITIAL_MAX_KAKAO_MAP_LEVEL) {
      map.setLevel(MOBILE_INITIAL_MAX_KAKAO_MAP_LEVEL);
    }
    return true;
  }

  const { LatLng } = maps;
  map.setCenter(
    new LatLng(MOBILE_INITIAL_MAP_CENTER.lat, MOBILE_INITIAL_MAP_CENTER.lng),
  );
  map.setLevel(MOBILE_INITIAL_KAKAO_MAP_LEVEL);
  return false;
}

/** 메인 첫 화면: 데스크탑 고정 center + level (전국 조망) */
export function setInitialKakaoMapView(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
): void {
  const { LatLng } = maps;
  map.setCenter(
    new LatLng(DESKTOP_INITIAL_MAP_CENTER.lat, DESKTOP_INITIAL_MAP_CENTER.lng),
  );
  map.setLevel(DESKTOP_INITIAL_KAKAO_MAP_LEVEL);
}

export interface FocusCourseOnMapOptions {
  level?: number;
  /** level 미지정 시 줌아웃이 이 값보다 크면 이 level로 맞춤 (데스크탑 panTo) */
  maxLevel?: number;
}

/** 골프장 좌표로 지도 중심 이동 (map 미준비·좌표 없으면 no-op) */
export function focusCourseOnMap(
  map: KakaoMapInstance | null | undefined,
  maps: KakaoMapsApi | null | undefined,
  target: { lat: number; lng: number },
  options: FocusCourseOnMapOptions = {},
): boolean {
  if (!map || !maps) return false;
  if (!Number.isFinite(target.lat) || !Number.isFinite(target.lng)) {
    return false;
  }

  const { LatLng } = maps;
  const pos = new LatLng(target.lat, target.lng);

  const applyCenter = () => {
    map.setCenter(pos);
    map.relayout?.();
  };

  if (options.level != null) {
    map.setLevel(options.level);
    applyCenter();
    requestAnimationFrame(() => {
      applyCenter();
    });
    return true;
  }

  if (options.maxLevel != null && map.getLevel() > options.maxLevel) {
    map.setLevel(options.maxLevel);
  }

  applyCenter();
  requestAnimationFrame(() => {
    applyCenter();
  });

  return true;
}

/** 카드/마커 선택 — panTo만, zoom level 유지 */
export function panToCourseWithoutZoom(
  map: KakaoMapInstance | null | undefined,
  maps: KakaoMapsApi | null | undefined,
  target: { lat: number; lng: number },
): boolean {
  if (!map || !maps) return false;
  if (!Number.isFinite(target.lat) || !Number.isFinite(target.lng)) {
    return false;
  }

  const { LatLng } = maps;
  const pos = new LatLng(target.lat, target.lng);
  const currentLevel = map.getLevel();

  map.panTo(pos);
  map.setLevel(currentLevel);
  map.relayout?.();

  return true;
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



function buildPinSvg(

  width: number,

  height: number,

  color: string,

  strokeWidth: number,

  shadowStd: number,

): string {

  const pad = PIN_PAD;

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



  const svg = buildPinSvg(

    PIN_BODY.w,

    PIN_BODY.h,

    PIN_COLORS[variant],

    PIN_STROKES[variant],

    PIN_SHADOWS[variant],

  );

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;



  return new MarkerImage(url, new Size(PIN_CANVAS_W, PIN_CANVAS_H), {

    offset: new Point(PIN_CANVAS_W / 2, PIN_CANVAS_H),

  });

}



/** @deprecated createPinMarkerImage 사용 */
export const createDotMarkerImage = createPinMarkerImage;

/** 0×0 anchor root — bounding box가 좌표점에 고정, 자식은 absolute로 배치 */
function createZeroAnchorRoot(): HTMLDivElement {
  const root = document.createElement("div");
  root.style.width = "0";
  root.style.height = "0";
  root.style.overflow = "visible";
  root.style.pointerEvents = "none";
  return root;
}

const LABEL_PILL_NORMAL =
  "background:#ffffff;color:#1c1917;font-weight:600;padding:5px 11px;font-size:13px;line-height:1.2;" +
  "border:1px solid rgba(0,0,0,0.06);border-radius:999px;font-family:inherit;" +
  "box-shadow:0 2px 8px rgba(0,0,0,0.08);display:inline-block;" +
  "max-width:168px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
  "pointer-events:none;user-select:none;";

const LABEL_PILL_SELECTED =
  "background:#166534;color:#ffffff;font-weight:600;padding:5px 11px;font-size:13px;line-height:1.2;" +
  "border:1px solid rgba(22,101,52,0.4);border-radius:999px;font-family:inherit;" +
  "box-shadow:0 2px 10px rgba(22,101,52,0.28);display:inline-block;" +
  "max-width:168px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
  "pointer-events:none;user-select:none;";

function buildMapLabelHtml(name: string, variant: "normal" | "selected"): string {
  const truncated = name.length > 22 ? `${name.slice(0, 22)}…` : name;
  const style = variant === "selected" ? LABEL_PILL_SELECTED : LABEL_PILL_NORMAL;
  return `<span style="${style}">${escapeHtml(truncated)}</span>`;
}

function buildHoverLabelHtml(name: string): string {
  return buildMapLabelHtml(name, "normal");
}

function buildSelectedPopupHtml(course: Course): string {
  const name =
    course.name.length > 24 ? `${course.name.slice(0, 24)}…` : course.name;
  const price = formatGreenFeeShort(course.weekdayGreenFeeMin);
  const href = `/courses/${course.id}`;
  return `<div style="background:#ffffff;border:2px solid rgba(37,99,235,0.4);border-radius:12px;padding:8px 10px;box-shadow:0 4px 20px rgba(37,99,235,0.22);min-width:148px;max-width:210px;font-family:inherit;pointer-events:auto;">
      <a href="${href}" style="display:block;font-size:15px;font-weight:700;color:#1d4ed8;text-decoration:none;line-height:1.25;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(course.name)}">${escapeHtml(name)}</a>
      <div style="margin-top:4px;font-size:12px;color:#64748b;font-weight:500;">주중 ${escapeHtml(price)}</div>
      <a href="${href}" style="display:block;margin-top:6px;text-align:center;background:#2563eb;color:#fff;font-size:12px;font-weight:600;padding:5px 8px;border-radius:8px;text-decoration:none;cursor:pointer;">상세보기</a>
    </div>`;
}

/** 분리 overlay용 DOM — pin / label / popup 각각 독립 CustomOverlay */
export interface SplitMarkerDom {
  pinEl: HTMLButtonElement;
  labelRoot: HTMLDivElement;
  labelSlot: HTMLDivElement;
  popupRoot: HTMLDivElement;
  popupSlot: HTMLDivElement;
}

export interface SplitMarkerVisualUpdate {
  variant: "default" | "hovered" | "selected";
  showHoverLabel: boolean;
  showSelectedPopup: boolean;
  labelVariant?: "normal" | "selected";
}

export function createSplitMarkerDom(): SplitMarkerDom {
  const pinEl = createPinOverlayElement("default");

  const labelRoot = createZeroAnchorRoot();
  const labelSlot = document.createElement("div");
  labelSlot.className = "course-marker-label-slot";
  labelSlot.style.cssText = `position:absolute;left:0;bottom:${LABEL_OFFSET_ABOVE_PIN_PX}px;transform:translateX(-50%);pointer-events:none;display:none;`;
  labelRoot.appendChild(labelSlot);

  const popupRoot = createZeroAnchorRoot();
  const popupSlot = document.createElement("div");
  popupSlot.className = "course-marker-popup-slot";
  popupSlot.style.cssText = `position:absolute;left:0;bottom:${POPUP_OFFSET_ABOVE_PIN_PX}px;transform:translateX(-50%);pointer-events:auto;display:none;`;
  const stopBubble = (e: Event) => e.stopPropagation();
  popupSlot.addEventListener("click", stopBubble);
  popupSlot.addEventListener("pointerdown", stopBubble);
  popupSlot.addEventListener("mousedown", stopBubble);
  popupRoot.appendChild(popupSlot);

  return { pinEl, labelRoot, labelSlot, popupRoot, popupSlot };
}

export function updateSplitMarkerVisuals(
  dom: SplitMarkerDom,
  course: Course,
  update: SplitMarkerVisualUpdate,
): void {
  updatePinOverlayElement(dom.pinEl, update.variant);

  if (update.showSelectedPopup) {
    dom.labelSlot.style.display = "none";
    dom.popupSlot.style.display = "block";
    const popupKey = `${course.id}:${course.weekdayGreenFeeMin}`;
    if (dom.popupSlot.dataset.popupKey !== popupKey) {
      dom.popupSlot.innerHTML = buildSelectedPopupHtml(course);
      dom.popupSlot.dataset.popupKey = popupKey;
    }
    return;
  }

  dom.popupSlot.style.display = "none";

  if (update.showHoverLabel) {
    dom.labelSlot.style.display = "block";
    const labelVariant =
      update.labelVariant ??
      (update.variant === "selected" ? "selected" : "normal");
    const html = buildMapLabelHtml(course.name, labelVariant);
    if (dom.labelSlot.innerHTML !== html) {
      dom.labelSlot.innerHTML = html;
    }
  } else {
    dom.labelSlot.style.display = "none";
  }
}

export function splitMarkerVisualKey(
  courseId: string,
  update: SplitMarkerVisualUpdate,
): string {
  return `${courseId}:${update.variant}:${update.showHoverLabel}:${update.showSelectedPopup}:${update.labelVariant ?? ""}`;
}

/** @deprecated SplitMarkerDom 사용 */
export interface CourseMarkerDom {
  wrapper: HTMLDivElement;
  hoverLabelEl: HTMLDivElement;
  selectedCardEl: HTMLDivElement;
  pinBtn: HTMLButtonElement;
}

/** @deprecated SplitMarkerVisualUpdate 사용 */
export interface CourseMarkerVisualUpdate {
  variant: "default" | "hovered" | "selected";
  showHoverLabel: boolean;
  showSelectedCard: boolean;
}

/** @deprecated createSplitMarkerDom 사용 */
export function createCourseMarkerDom(): CourseMarkerDom {
  const split = createSplitMarkerDom();
  const wrapper = document.createElement("div");
  wrapper.appendChild(split.pinEl);
  return {
    wrapper,
    hoverLabelEl: split.labelSlot,
    selectedCardEl: split.popupSlot,
    pinBtn: split.pinEl,
  };
}

/** @deprecated updateSplitMarkerVisuals 사용 */
export function updateCourseMarkerDom(
  dom: CourseMarkerDom,
  course: Course,
  update: CourseMarkerVisualUpdate,
): void {
  updateSplitMarkerVisuals(
    {
      pinEl: dom.pinBtn,
      labelRoot: dom.hoverLabelEl.parentElement as HTMLDivElement,
      labelSlot: dom.hoverLabelEl,
      popupRoot: dom.selectedCardEl.parentElement as HTMLDivElement,
      popupSlot: dom.selectedCardEl,
    },
    course,
    {
      variant: update.variant,
      showHoverLabel: update.showHoverLabel,
      showSelectedPopup: update.showSelectedCard,
    },
  );
}

/** @deprecated splitMarkerVisualKey 사용 */
export function courseMarkerVisualKey(
  courseId: string,
  update: CourseMarkerVisualUpdate,
): string {
  return splitMarkerVisualKey(courseId, {
    variant: update.variant,
    showHoverLabel: update.showHoverLabel,
    showSelectedPopup: update.showSelectedCard,
  });
}

const PILL_STYLE =
  "background:#ffffff;color:#1f2937;font-weight:600;padding:6px 12px;font-size:13px;" +
  "border:1px solid #fed7aa;border-radius:999px;font-family:inherit;" +
  "box-shadow:0 2px 8px rgba(0,0,0,0.14);display:inline-block;" +
  "max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
  "pointer-events:none;user-select:none;line-height:1.3;";

const PILL_SELECTED_STYLE =
  "background:#ffffff;color:#1f2937;font-weight:600;padding:6px 12px;font-size:13px;" +
  "border:1px solid #fecaca;border-radius:10px;font-family:inherit;" +
  "box-shadow:0 2px 10px rgba(0,0,0,0.15);display:inline-block;" +
  "max-width:180px;line-height:1.35;text-align:left;" +
  "pointer-events:none;user-select:none;";

function applyLabelWrapPosition(wrap: HTMLDivElement, abovePin: boolean): void {
  wrap.style.pointerEvents = "none";
  wrap.style.userSelect = "none";
  wrap.style.position = "relative";
  wrap.style.whiteSpace = "nowrap";
  wrap.style.touchAction = "none";
  if (abovePin) {
    wrap.style.transform = "translate(-50%, calc(-100% - 14px))";
    wrap.style.textAlign = "center";
  } else {
    wrap.style.transform = "translate(12px, 4px)";
  }
}

/**
 * 핀 좌표(팁) 기준 라벨 DOM — pin 위쪽 배치, 이벤트를 받지 않음
 */
export function createLabelOverlayElement(
  course: Course,
  mode: LabelDisplayMode,
): HTMLDivElement {
  const wrap = document.createElement("div");
  applyLabelWrapPosition(wrap, mode.abovePin);

  const name =
    course.name.length > 20 ? `${course.name.slice(0, 20)}…` : course.name;

  if (mode.nameOnly) {
    wrap.innerHTML = `<span style="${PILL_STYLE}">${escapeHtml(name)}</span>`;
    return wrap;
  }

  const price = formatGreenFeeShort(course.weekdayGreenFeeMin);
  wrap.innerHTML = `
    <span style="${PILL_SELECTED_STYLE}">
      <span style="display:block;font-size:13px;font-weight:700;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;pointer-events:none;">${escapeHtml(name)}</span>
      <span style="display:block;font-size:12px;font-weight:700;color:#E5484D;margin-top:2px;pointer-events:none;">${escapeHtml(price)}</span>
    </span>`;

  return wrap;
}



/** label mode cache key */

export function labelModeKey(
  courseId: string,
  mode: LabelDisplayMode,
  showLabel: boolean,
): string {
  if (!showLabel) return `${courseId}:hidden`;
  return `${courseId}:${mode.nameOnly ? "name" : "full"}:${mode.abovePin ? "above" : "side"}`;
}



/** 상세 페이지 단일 마커 이미지 */

export function createDetailMarkerImage(maps: Record<string, unknown>): unknown {

  return createPinMarkerImage(maps, "selected");

}


