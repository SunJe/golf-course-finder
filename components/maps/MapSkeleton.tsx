"use client";

/**
 * 지도 SDK/번들 로드 전 고정 크기 placeholder.
 * Desktop CLS 방지를 위해 실제 지도 컨테이너와 동일한 높이·너비를 유지한다.
 */
export default function MapSkeleton({
  className = "",
  label = "지도 불러오는 중…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-[#dbe8e0] ${className}`}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(80,110,90,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(80,110,90,0.07) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 48% 42%, #e8f3e6 0%, #e2efdf 38%, rgba(226,239,223,0) 62%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-500 shadow-sm backdrop-blur-sm">
          {label}
        </p>
      </div>
    </div>
  );
}
