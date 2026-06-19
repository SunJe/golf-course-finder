"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/CourseCollectionsContext";

interface FavoriteButtonProps {
  courseId: string;
  /** 모바일 터치 영역 확대 */
  size?: "sm" | "md";
  className?: string;
}

export default function FavoriteButton({
  courseId,
  size = "sm",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, hydrated } = useFavorites();
  const active = hydrated && isFavorite(courseId);

  const touchClass =
    size === "md"
      ? "min-h-10 min-w-10 h-10 w-10"
      : "min-h-9 min-w-9 h-9 w-9";
  const iconClass = size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(courseId);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      aria-pressed={active}
      className={`flex shrink-0 items-center justify-center text-stone-400 transition hover:opacity-80 active:opacity-60 ${touchClass} ${className}`}
    >
      <Heart
        className={`${iconClass} ${
          active ? "fill-rose-500 text-rose-500" : "fill-none text-stone-400"
        }`}
        strokeWidth={active ? 0 : 2}
      />
    </button>
  );
}
