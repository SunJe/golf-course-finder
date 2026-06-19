import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  onFitResults?: () => void;
  onShowAllFiltered?: () => void;
  onClearFavoriteOnly?: () => void;
  fitResultsLabel?: string;
  showAllFilteredLabel?: string;
  clearFavoriteOnlyLabel?: string;
}

export default function EmptyState({
  title = "검색 결과가 없습니다",
  description = "필터 조건을 변경하거나 초기화해 보세요.",
  onReset,
  onFitResults,
  onShowAllFiltered,
  onClearFavoriteOnly,
  fitResultsLabel = "결과 위치로 이동",
  showAllFilteredLabel = "필터 결과 전체 보기",
  clearFavoriteOnlyLabel = "전체 골프장 보기",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
        <SearchX className="h-7 w-7" />
      </span>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="max-w-xs text-sm text-gray-500">{description}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            필터 초기화
          </button>
        )}
        {onClearFavoriteOnly && (
          <button
            type="button"
            onClick={onClearFavoriteOnly}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {clearFavoriteOnlyLabel}
          </button>
        )}
        {onShowAllFiltered && (
          <button
            type="button"
            onClick={onShowAllFiltered}
            className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            {showAllFilteredLabel}
          </button>
        )}
        {onFitResults && (
          <button
            type="button"
            onClick={onFitResults}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {fitResultsLabel}
          </button>
        )}
      </div>
    </div>
  );
}
