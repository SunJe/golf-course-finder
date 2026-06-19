"use client";

import { Flag } from "lucide-react";
import { useVisited } from "@/contexts/CourseCollectionsContext";

interface VisitedButtonProps {
  courseId: string;
  size?: "sm" | "md";
  className?: string;
}

export default function VisitedButton({
  courseId,
  size = "sm",
  className = "",
}: VisitedButtonProps) {
  const { isVisited, toggleVisited, hydrated } = useVisited();
  const active = hydrated && isVisited(courseId);

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
        toggleVisited(courseId);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={active ? "가본 골프장 해제" : "가본 골프장 추가"}
      aria-pressed={active}
      className={`flex shrink-0 items-center justify-center text-stone-400 transition hover:opacity-80 active:opacity-60 ${touchClass} ${className}`}
    >
      <Flag
        className={`${iconClass} ${
          active ? "fill-green-600 text-green-600" : "fill-none text-stone-400"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
