import type { Course } from "@/types/course";

import {
  DEFAULT_MAP_CENTER,
  INITIAL_KAKAO_MAP_LEVEL,
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

}



/** pin 표시 — cluster 묶음이면 숨김, selected/hover는 항상 표시 */
export function shouldShowPin(ctx: MarkerDisplayContext): boolean {
  if (ctx.isSelected || ctx.isHovered) return true;
  if (ctx.effectiveGroupSize >= 2) return false;
  return true;
}



export function shouldShowLabel(ctx: MarkerDisplayContext): boolean {

  if (!shouldShowPin(ctx)) return false;

  if (ctx.isSelected || ctx.isHovered) return true;

  if (ctx.isMobile) return false;

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



/** 메인 첫 화면: 고정 center + level (전국 조망) */
export function setInitialKakaoMapView(
  map: KakaoMapInstance,
  maps: KakaoMapsApi,
): void {
  const { LatLng } = maps;
  map.setCenter(new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng));
  map.setLevel(INITIAL_KAKAO_MAP_LEVEL);
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

const HOVER_LABEL_PILL =
  "background:#ffffff;color:#111827;font-weight:700;padding:5px 9px;font-size:13px;line-height:1.2;" +
  "border:1px solid rgba(0,0,0,0.08);border-radius:999px;font-family:inherit;" +
  "box-shadow:0 4px 12px rgba(0,0,0,0.12);display:inline-block;" +
  "max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
  "pointer-events:none;user-select:none;";

function buildHoverLabelHtml(name: string): string {
  const truncated = name.length > 22 ? `${name.slice(0, 22)}…` : name;
  return `<span style="${HOVER_LABEL_PILL}">${escapeHtml(truncated)}</span>`;
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
    const html = buildHoverLabelHtml(course.name);
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
  return `${courseId}:${update.variant}:${update.showHoverLabel}:${update.showSelectedPopup}`;
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


