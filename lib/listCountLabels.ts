export type ListCountMode = "cluster" | "allFiltered" | "visible" | "fallback";

export function getListCountLabel(options: {
  mode: ListCountMode;
  count: number;
  total: number;
  isFiltered: boolean;
  favoriteOnly?: boolean;
  visitedOnly?: boolean;
  isSearchActive?: boolean;
  searchQuery?: string;
  selectedClusterCount?: number;
}): string {
  const {
    mode,
    count,
    total,
    isFiltered,
    favoriteOnly,
    visitedOnly,
    isSearchActive,
    searchQuery,
    selectedClusterCount = 0,
  } = options;

  if (isSearchActive && searchQuery?.trim()) {
    return `'${searchQuery.trim()}' 검색 결과 ${count.toLocaleString()}곳`;
  }
  if (favoriteOnly) return `즐겨찾기한 골프장 ${count.toLocaleString()}곳`;
  if (visitedOnly) return `가본 골프장 ${count.toLocaleString()}곳`;

  if (mode === "cluster") {
    const prefix =
      selectedClusterCount > 1 ? "선택한 묶음들의 골프장" : "선택한 묶음의 골프장";
    return `${prefix} ${count.toLocaleString()}곳`;
  }

  if (mode === "allFiltered") {
    return isFiltered
      ? `필터 결과 ${count.toLocaleString()}곳`
      : `전체 골프장 ${count.toLocaleString()}곳`;
  }

  if (mode === "visible") {
    return isFiltered
      ? `현재 지도 필터 결과 ${count.toLocaleString()}곳`
      : `현재 지도에 보이는 골프장 ${count.toLocaleString()}곳`;
  }

  if (isFiltered) return `필터 결과 ${count.toLocaleString()}곳`;
  return `전체 골프장 ${total.toLocaleString()}곳`;
}

export function getListCountSublabel(options: {
  mode: ListCountMode;
  count: number;
  total: number;
  isFiltered: boolean;
  isShowingAllFilteredResults?: boolean;
}): string | null {
  const { mode, count, total, isFiltered, isShowingAllFilteredResults } =
    options;

  if (mode === "visible" && !isShowingAllFilteredResults && count !== total) {
    return `전체 ${total.toLocaleString()}곳 중 · 이름순`;
  }

  if (mode === "allFiltered" && isFiltered) {
    return `전체 ${total.toLocaleString()}곳 기준 · 이름순`;
  }

  return "이름순 정렬";
}
