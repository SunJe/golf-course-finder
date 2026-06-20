import type { MobileSheetSnap } from "@/components/MobileBottomSheet";
import { EMPTY_FILTERS, type CourseFilters } from "@/types/course";

export const HOME_RESET_SESSION_KEY = "golfmap:reset-home";

export interface HomeUiStateSetters {
  setFilters: (filters: CourseFilters) => void;
  setFavoriteOnly: (value: boolean) => void;
  setVisitedOnly: (value: boolean) => void;
  setCollectionFitIds: (ids: string[]) => void;
  setCollectionFitSignal: (value: number) => void;
  setSelectedId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  setVisibleCourseIds: (ids: string[] | null) => void;
  setSelectedClusterCourseIds: (ids: string[] | null) => void;
  setIsShowingAllFilteredResults: (value: boolean) => void;
  setCenter: (center: null) => void;
  bumpMapViewResetSignal: () => void;
  setSheetOpen: (value: boolean) => void;
  setMobileSheetSnap: (snap: MobileSheetSnap) => void;
  setSearchFitSignal: (value: number) => void;
}

/** 홈 화면 UI를 최초 진입 상태로 되돌린다. */
export function applyHomeResetState(setters: HomeUiStateSetters): void {
  setters.setFilters(EMPTY_FILTERS);
  setters.setFavoriteOnly(false);
  setters.setVisitedOnly(false);
  setters.setCollectionFitIds([]);
  setters.setCollectionFitSignal(0);
  setters.setSelectedId(null);
  setters.setHoveredId(null);
  setters.setVisibleCourseIds(null);
  setters.setSelectedClusterCourseIds(null);
  setters.setIsShowingAllFilteredResults(false);
  setters.setCenter(null);
  setters.bumpMapViewResetSignal();
  setters.setSheetOpen(false);
  setters.setMobileSheetSnap("half");
  setters.setSearchFitSignal(0);
}

export function clearHomeUrlState(): void {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  if (pathname === "/" && (search || hash)) {
    window.history.replaceState(null, "", "/");
  }
}

export function markHomeResetPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOME_RESET_SESSION_KEY, "1");
}

export function consumeHomeResetPending(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(HOME_RESET_SESSION_KEY) !== "1") return false;
  sessionStorage.removeItem(HOME_RESET_SESSION_KEY);
  return true;
}

export function clearHomeResetPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HOME_RESET_SESSION_KEY);
}
