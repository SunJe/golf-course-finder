"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  FAVORITES_STORAGE_KEY,
  VISITED_STORAGE_KEY,
} from "@/lib/courseCollectionStorage";
import { useCourseCollection } from "@/hooks/useCourseCollection";

interface CourseCollectionsContextValue {
  favoriteCourseIds: string[];
  favoriteCount: number;
  favoritesHydrated: boolean;
  isFavorite: (courseId: string) => boolean;
  toggleFavorite: (courseId: string) => void;
  clearFavorites: () => void;
  visitedCourseIds: string[];
  visitedCount: number;
  visitedHydrated: boolean;
  isVisited: (courseId: string) => boolean;
  toggleVisited: (courseId: string) => void;
  clearVisited: () => void;
}

const CourseCollectionsContext =
  createContext<CourseCollectionsContextValue | null>(null);

export function CourseCollectionsProvider({ children }: { children: ReactNode }) {
  const favorites = useCourseCollection(FAVORITES_STORAGE_KEY);
  const visited = useCourseCollection(VISITED_STORAGE_KEY);

  const value = useMemo(
    () => ({
      favoriteCourseIds: favorites.courseIds,
      favoriteCount: favorites.count,
      favoritesHydrated: favorites.hydrated,
      isFavorite: favorites.isInCollection,
      toggleFavorite: favorites.toggleCourse,
      clearFavorites: favorites.clearCollection,
      visitedCourseIds: visited.courseIds,
      visitedCount: visited.count,
      visitedHydrated: visited.hydrated,
      isVisited: visited.isInCollection,
      toggleVisited: visited.toggleCourse,
      clearVisited: visited.clearCollection,
    }),
    [favorites, visited],
  );

  return (
    <CourseCollectionsContext.Provider value={value}>
      {children}
    </CourseCollectionsContext.Provider>
  );
}

function useCourseCollections(): CourseCollectionsContextValue {
  const ctx = useContext(CourseCollectionsContext);
  if (!ctx) {
    throw new Error(
      "useCourseCollections must be used within CourseCollectionsProvider",
    );
  }
  return ctx;
}

export function useFavorites() {
  const ctx = useCourseCollections();
  return {
    favoriteCourseIds: ctx.favoriteCourseIds,
    favoriteCount: ctx.favoriteCount,
    hydrated: ctx.favoritesHydrated,
    isFavorite: ctx.isFavorite,
    toggleFavorite: ctx.toggleFavorite,
    clearFavorites: ctx.clearFavorites,
  };
}

export function useVisited() {
  const ctx = useCourseCollections();
  return {
    visitedCourseIds: ctx.visitedCourseIds,
    visitedCount: ctx.visitedCount,
    hydrated: ctx.visitedHydrated,
    isVisited: ctx.isVisited,
    toggleVisited: ctx.toggleVisited,
    clearVisited: ctx.clearVisited,
  };
}
