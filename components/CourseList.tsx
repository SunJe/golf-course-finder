"use client";

import type { Course } from "@/types/course";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";

interface CourseListProps {
  courses: Course[];
  selectedId?: string | null;
  onSelect?: (course: Course) => void;
  onReset?: () => void;
}

export default function CourseList({
  courses,
  selectedId,
  onSelect,
  onReset,
}: CourseListProps) {
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
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
