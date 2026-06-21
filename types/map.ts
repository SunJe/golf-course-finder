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

/** 리스트/카드 클릭 시 지도 중심 이동 */
export interface MapFocusTarget {
  lat: number;
  lng: number;
  /** 지정 시 해당 level로 이동 (검색 1건 포커스 등). 미지정 시 zoom 유지 panTo */
  level?: number;
  /** 디버그/검증용 — 포커스 대상 course id */
  courseId?: string;
  /** 동일 좌표 재클릭 시에도 effect 재실행 */
  focusToken?: number;
}

/** 데스크탑/모바일 중 활성 레이아웃의 지도만 bounds·focus 갱신 */
export type MapLayoutVariant = "desktop" | "mobile";

/** 모든 지도 구현체가 공유하는 props */
export interface CourseMapBaseProps {
  courses: Course[];
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string) => void;
  center?: MapFocusTarget | null;
  /** search 지도에서 desktop/mobile 중 활성 인스턴스 구분 */
  mapLayout?: MapLayoutVariant;
  className?: string;
  /** fallback 지도에서 표시할 마커 상한 (미설정 시 50) */
  maxVisibleMarkers?: number;
  /** 선택된 마커/카드 해제 (ESC, 팝업 닫기 등) */
  onClearSelection?: () => void;
  /** search: 메인 검색 지도, detail: 상세 페이지 소형 지도 */
  mapMode?: "search" | "detail";
  /** 지도 bounds 안에 보이는 course id 목록 변경 */
  onVisibleCoursesChange?: (courseIds: string[]) => void;
  /** 클러스터 클릭 시 해당 클러스터 key + course id 목록 (누적 선택) */
  onClusterSelect?: (payload: {
    clusterKey: string;
    courseIds: string[];
  }) => void;
  /** 리스트 카드 hover 시 강조할 course id */
  hoveredCourseId?: string | null;
  /** 증가 시 필터 결과 전체가 보이도록 map bounds 조정 ("결과 위치로 이동") */
  mapViewResetSignal?: number;
  /** 최초 로딩 시 fitBounds에 사용할 전체 골프장 (필터와 무관) */
  initialViewportCourses?: Course[];
  /** 사용자가 지도를 드래그/줌한 경우 (리스트 제목 전환용) */
  onMapViewportChange?: () => void;
  /** 지도 핀 hover 시 (리스트 카드 hover와 동기화) */
  onHoverCourseChange?: (courseId: string | null) => void;
  /** 검색어 — 있으면 클러스터 해제 */
  searchKeyword?: string;
  /** 즐겨찾기만 보기 — 소량이면 cluster 해제 */
  favoriteOnly?: boolean;
  /** 가본 골프장만 보기 — 소량이면 cluster 해제 */
  visitedOnly?: boolean;
  /** 클러스터 클릭 후 묶음 내 course id — 개별 pin 우선 */
  clusterScopeCourseIds?: string[] | null;
  /** 선택된 cluster key 목록 — badge 선택 스타일 */
  selectedClusterKeys?: string[];
  /** localStorage 즐겨찾기 course id — 별도 heart overlay layer용 */
  favoriteCourseIds?: string[];
  /** localStorage 가본 골프장 course id — 별도 visited overlay layer용 */
  visitedCourseIds?: string[];
  /** popup만 표시 (지도 이동/zoom 없음) */
  onSelectPopupOnly?: (course: Course) => void;
  /** collection 필터 ON 시 fitBounds 대상 course id */
  fitToCourseIds?: string[];
  fitToCourseIdsSignal?: number;
  /** detail 페이지: 현재 골프장 id — marker 강조·근처 pin 구분 */
  detailPrimaryCourseId?: string | null;
  /** @deprecated selectedCourseId 와 동일 — 하위 호환 */
  selectedId?: string | null;
  /** @deprecated onSelectCourse(id) 대신 Course 객체 — 하위 호환 */
  onSelect?: (course: Course) => void;
}
