import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = "검색 결과가 없습니다",
  description = "필터 조건을 변경하거나 초기화해 보세요.",
  onReset,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
        <SearchX className="h-7 w-7" />
      </span>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="max-w-xs text-sm text-gray-500">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}
