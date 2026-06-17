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
          className="inline-flex items-center gap-0.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600"
        >
          <Icon className="h-3 w-3 text-brand-600" />
          {label}
        </span>
      ))}
    </div>
  );
}
