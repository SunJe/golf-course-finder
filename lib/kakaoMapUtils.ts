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
  relayout?: () => void;
}

export interface LabelDisplayMode {
  showLabel: boolean;
  nameOnly: boolean;
}

/** Kakao level: 숫자가 클수록 줌아웃 */
export function getLabelDisplayMode(
  level: number,
  isMobile: boolean,
  isSelected: boolean,
): LabelDisplayMode {
  if (!isSelected) {
    return { showLabel: false, nameOnly: false };
  }
  if (isMobile) {
    return { showLabel: true, nameOnly: true };
  }
  if (level <= 6) {
    return { showLabel: true, nameOnly: false };
  }
  return { showLabel: false, nameOnly: false };
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

/** 검색 결과에 맞게 지도 영역 조정 */
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** MarkerClusterer 클러스터 스타일 (개수 구간별 크기) */
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
      background: "rgba(34, 197, 94, 0.92)",
      borderRadius: "21px",
    },
    {
      ...base,
      width: "50px",
      height: "50px",
      lineHeight: "44px",
      fontSize: "13px",
      background: "rgba(22, 163, 74, 0.94)",
      borderRadius: "25px",
    },
    {
      ...base,
      width: "58px",
      height: "58px",
      lineHeight: "52px",
      fontSize: "14px",
      background: "rgba(21, 128, 61, 0.96)",
      borderRadius: "29px",
    },
  ];
}

/** kakao.maps.Marker용 dot 이미지 */
export function createDotMarkerImage(
  maps: Record<string, unknown>,
  variant: "default" | "selected",
): unknown {
  const MarkerImage = maps.MarkerImage as new (
    src: string,
    size: unknown,
    opts: { offset: unknown },
  ) => unknown;
  const Size = maps.Size as new (w: number, h: number) => unknown;
  const Point = maps.Point as new (x: number, y: number) => unknown;

  const px = variant === "selected" ? 18 : 12;
  const color = variant === "selected" ? "#15803d" : "#22c55e";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2 - 2}" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new MarkerImage(url, new Size(px, px), {
    offset: new Point(px / 2, px / 2),
  });
}

/** 라벨 CustomOverlay DOM (pointer-events: none) */
export function createLabelOverlayElement(
  course: Course,
  mode: LabelDisplayMode,
): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.pointerEvents = "none";
  wrap.style.transform = "translate(-50%, -100%)";

  const name =
    course.name.length > 14 ? `${course.name.slice(0, 14)}…` : course.name;

  if (mode.nameOnly) {
    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));">
        <div style="background:#15803d;color:#fff;font-weight:700;padding:4px 8px;font-size:10px;border:2px solid #fff;border-radius:9999px;white-space:nowrap;font-family:inherit;">
          ${escapeHtml(name)}
        </div>
        <div style="width:8px;height:8px;background:#15803d;border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);margin-top:-4px;"></div>
      </div>`;
    return wrap;
  }

  const price = formatGreenFeeShort(course.weekdayGreenFeeMin);
  wrap.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));">
      <div style="background:#15803d;color:#fff;font-weight:700;padding:5px 10px;font-size:11px;border:2px solid #fff;border-radius:9999px;white-space:nowrap;font-family:inherit;line-height:1.2;text-align:center;">
        <div style="font-size:10px;opacity:.9;">${escapeHtml(name)}</div>
        <div>${escapeHtml(price)}</div>
      </div>
      <div style="width:10px;height:10px;background:#15803d;border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);margin-top:-5px;"></div>
    </div>`;

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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 21 9 21s9-13.5 9-21c0-4.97-4.03-9-9-9z" fill="#15803d" stroke="#fff" stroke-width="2"/><circle cx="12" cy="9" r="4" fill="#fff"/></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new MarkerImage(url, new Size(24, 32), {
    offset: new Point(12, 32),
  });
}
