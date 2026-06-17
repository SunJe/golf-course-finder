"use client";

import { useEffect } from "react";
import type { Course } from "@/types/course";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";

interface CourseListProps {
  courses: Course[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (course: Course) => void;
  onHover?: (course: Course | null) => void;
  onReset?: () => void;
}

export default function CourseList({
  courses,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onReset,
}: CourseListProps) {
  useEffect(() => {
    if (!selectedId) return;
    document
      .getElementById(`course-card-${selectedId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  if (courses.length === 0) {
    return <EmptyState onReset={onReset} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          selected={course.id === selectedId}
          hovered={course.id === hoveredId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </div>
  );
}
