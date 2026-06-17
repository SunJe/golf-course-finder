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

export interface MarkerDisplayOptions {
  selected: boolean;
  showLabel: boolean;
  isDetail?: boolean;
  /** 모바일 선택 마커: 이름만 표시 */
  nameOnly?: boolean;
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

/** Kakao CustomOverlay용 마커 HTML */
export function buildKakaoMarkerHtml(
  course: Course,
  { selected, showLabel, isDetail, nameOnly }: MarkerDisplayOptions,
): string {
  const baseTransform = "transform:translate(-50%,-100%);cursor:pointer;";

  if (isDetail) {
    const bg = "#15803d";
    return `
      <div style="position:relative;${baseTransform}">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <span style="width:14px;height:14px;background:${bg};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.25);"></span>
          <span style="width:2px;height:8px;background:${bg};margin-top:-1px;"></span>
        </div>
      </div>`;
  }

  if (selected && showLabel) {
    const name =
      course.name.length > 14 ? `${course.name.slice(0, 14)}…` : course.name;

    if (nameOnly) {
      return `
      <div style="position:relative;${baseTransform}transform:translate(-50%,-100%) scale(1.02);">
        <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));">
          <div style="background:#15803d;color:#fff;font-weight:700;padding:4px 8px;font-size:10px;border:2px solid #fff;border-radius:9999px;white-space:nowrap;font-family:inherit;">
            ${escapeHtml(name)}
          </div>
          <div style="width:8px;height:8px;background:#15803d;border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);margin-top:-4px;"></div>
        </div>
      </div>`;
    }

    const price = formatGreenFeeShort(course.weekdayGreenFeeMin);
    return `
      <div style="position:relative;${baseTransform}transform:translate(-50%,-100%) scale(1.05);">
        <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));">
          <div style="background:#15803d;color:#fff;font-weight:700;padding:5px 10px;font-size:11px;border:2px solid #fff;border-radius:9999px;white-space:nowrap;font-family:inherit;line-height:1.2;text-align:center;">
            <div style="font-size:10px;opacity:.9;">${escapeHtml(name)}</div>
            <div>${escapeHtml(price)}</div>
          </div>
          <div style="width:10px;height:10px;background:#15803d;border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);margin-top:-5px;"></div>
        </div>
      </div>`;
  }

  if (selected) {
    return `
      <div style="position:relative;${baseTransform}">
        <span style="display:block;width:16px;height:16px;background:#15803d;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(21,128,61,.45);"></span>
      </div>`;
  }

  return `
    <div style="position:relative;${baseTransform}">
      <span style="display:block;width:10px;height:10px;background:#22c55e;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.2);"></span>
    </div>`;
}
