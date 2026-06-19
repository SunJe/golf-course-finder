"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadCourseCollectionIds,
  saveCourseCollectionIds,
} from "@/lib/courseCollectionStorage";

export function useCourseCollection(storageKey: string) {
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCourseIds(loadCourseCollectionIds(storageKey));
    setHydrated(true);
  }, [storageKey]);

  const isInCollection = useCallback(
    (courseId: string) => courseIds.includes(courseId),
    [courseIds],
  );

  const toggleCourse = useCallback(
    (courseId: string) => {
      setCourseIds((prev) => {
        const next = prev.includes(courseId)
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId];
        saveCourseCollectionIds(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const clearCollection = useCallback(() => {
    setCourseIds([]);
    saveCourseCollectionIds(storageKey, []);
  }, [storageKey]);

  return useMemo(
    () => ({
      courseIds,
      count: courseIds.length,
      hydrated,
      isInCollection,
      toggleCourse,
      clearCollection,
    }),
    [courseIds, hydrated, isInCollection, toggleCourse, clearCollection],
  );
}
