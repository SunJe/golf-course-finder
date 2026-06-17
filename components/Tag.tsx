import {
  Moon,
  UserX,
  Users,
  Building2,
  Train,
  Sprout,
  Tag as TagIcon,
} from "lucide-react";

const TAG_ICONS: Record<string, typeof Moon> = {
  야간가능: Moon,
  노캐디: UserX,
  "2인가능": Users,
  리조트형: Building2,
  수도권: Train,
  초보추천: Sprout,
};

export default function Tag({ label }: { label: string }) {
  const Icon = TAG_ICONS[label] ?? TagIcon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
