import { Moon, UserX, Users } from "lucide-react";
import type { Course } from "@/types/course";

interface CourseFeatureBadgesProps {
  course: Course;
}

/** 카드에 표시할 편의 정보 뱃지 (야간/노캐디/2인) */
export default function CourseFeatureBadges({ course }: CourseFeatureBadgesProps) {
  const items = [
    course.nightRound && { icon: Moon, label: "야간" },
    course.noCaddie && { icon: UserX, label: "노캐디" },
    course.twoPlayerAllowed && { icon: Users, label: "2인" },
  ].filter(Boolean) as { icon: typeof Moon; label: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 ring-1 ring-inset ring-stone-200/60"
        >
          <Icon className="h-3 w-3 text-brand-700" />
          {label}
        </span>
      ))}
    </div>
  );
}
