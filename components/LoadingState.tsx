export default function LoadingState({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-label="불러오는 중">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-3.5"
        >
          <div className="h-24 w-28 flex-shrink-0 animate-pulse rounded-xl bg-gray-200 sm:h-28 sm:w-32" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="mt-auto flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded-full bg-gray-100" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
