import type { Course } from "@/types/course";

/** 지도 표시 엔진 (골프장 데이터와 독립) */
export type MapProvider = "kakao" | "naver" | "custom";

/** 장소/맛집/숙소 등 POI 데이터 출처 (지도 provider와 분리) */
export type PlaceDataProvider = "naver" | "kakao" | "manual" | "public";

/**
 * 추후 주변 맛집·숙소·카페 연동용 타입.
 * UI에는 아직 사용하지 않으며, 데이터 레이어만 준비한다.
 */
export interface NearbyPlace {
  id: string;
  name: string;
  category: "restaurant" | "cafe" | "hotel" | "other";
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  sourceProvider: PlaceDataProvider;
  naverPlaceUrl?: string;
  kakaoPlaceUrl?: string;
  officialUrl?: string;
}

/** 모든 지도 구현체가 공유하는 props */
export interface CourseMapBaseProps {
  courses: Course[];
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string) => void;
  /** 리스트 클릭 시 지도 중심 이동 */
  center?: { lat: number; lng: number } | null;
  className?: string;
  /** fallback 지도에서 표시할 마커 상한 (미설정 시 50) */
  maxVisibleMarkers?: number;
  /** 선택된 마커/카드 해제 (ESC, 팝업 닫기 등) */
  onClearSelection?: () => void;
  /** search: 메인 검색 지도, detail: 상세 페이지 소형 지도 */
  mapMode?: "search" | "detail";
  /** 지도 bounds 안에 보이는 course id 목록 변경 */
  onVisibleCoursesChange?: (courseIds: string[]) => void;
  /** 클러스터 클릭 시 해당 클러스터 course id 목록 */
  onClusterSelect?: (courseIds: string[]) => void;
  /** 리스트 카드 hover 시 강조할 course id */
  hoveredCourseId?: string | null;
  /** @deprecated selectedCourseId 와 동일 — 하위 호환 */
  selectedId?: string | null;
  /** @deprecated onSelectCourse(id) 대신 Course 객체 — 하위 호환 */
  onSelect?: (course: Course) => void;
}
