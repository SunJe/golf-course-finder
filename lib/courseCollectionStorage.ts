export const FAVORITES_STORAGE_KEY = "golfmap.favoriteCourseIds";
export const VISITED_STORAGE_KEY = "golfmap.visitedCourseIds";

export function loadCourseCollectionIds(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function saveCourseCollectionIds(
  storageKey: string,
  ids: string[],
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // ignore quota / private mode errors
  }
}
