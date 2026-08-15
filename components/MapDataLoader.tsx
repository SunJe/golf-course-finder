"use client";

import { useCallback, useEffect, useState } from "react";
import HomeClient from "@/components/HomeClient";
import MapSkeleton from "@/components/maps/MapSkeleton";
import type { MapCourse } from "@/lib/mapCourse";
import type { CollectionSlug } from "@/lib/collectionLanding";
import type { CourseFilters } from "@/types/course";

interface MapDataLoaderProps {
  initialRegionSlug?: string;
  initialCollectionSlug?: CollectionSlug;
  initialFilters: CourseFilters;
  initialView: "map" | "list";
}

function MapLoadingShell() {
  return (
    <main
      aria-busy="true"
      aria-describedby="map-loading-status"
      className="min-h-[calc(100vh-3.5rem)] bg-stone-50"
    >
      <p id="map-loading-status" role="status" className="sr-only">
        골프장 정보를 불러오는 중입니다.
      </p>
      <div className="hidden h-[calc(100vh-3.5rem)] md:flex md:flex-col">
        <div className="h-36 animate-pulse border-b border-stone-200 bg-white" />
        <div className="h-[5.5rem] animate-pulse border-b border-stone-200 bg-white" />
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(20rem,27rem)_1fr] gap-4 p-4">
          <div className="animate-pulse rounded-2xl bg-white" />
          <MapSkeleton className="h-full w-full rounded-2xl" />
        </div>
      </div>
      <div className="relative h-[calc(100vh-3.5rem)] md:hidden">
        <MapSkeleton className="h-full w-full" />
        <div className="absolute inset-x-3 bottom-3 h-40 animate-pulse rounded-2xl bg-white/95 shadow-lg" />
      </div>
    </main>
  );
}

function MapLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-stone-50 p-6">
      <section
        role="alert"
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm"
      >
        <h1 className="text-lg font-bold text-stone-900">
          골프장 정보를 불러오지 못했습니다
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          네트워크 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
        >
          다시 시도
        </button>
      </section>
    </main>
  );
}

export default function MapDataLoader(props: MapDataLoaderProps) {
  const [courses, setCourses] = useState<MapCourse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setFailed(false);
    setCourses(null);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      try {
        const response = await fetch("/api/map/courses", {
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid map course payload");
        setCourses(payload as MapCourse[]);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[MapDataLoader] Failed to load map courses", error);
        setFailed(true);
      }
    }

    void loadCourses();
    return () => controller.abort();
  }, [attempt]);

  if (failed) return <MapLoadError onRetry={retry} />;
  if (!courses) return <MapLoadingShell />;

  return <HomeClient courses={courses} {...props} />;
}
