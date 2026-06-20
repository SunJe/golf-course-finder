interface CourseHeroFallbackProps {
  className?: string;
}

/** image_url 없음/로딩 실패 시 Hero 배경 — 외부 이미지 없이 CSS gradient */
export default function CourseHeroFallback({
  className = "",
}: CourseHeroFallbackProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 ${className}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-2xl" />
      <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-teal-300/15 blur-xl" />
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        preserveAspectRatio="none"
        viewBox="0 0 400 160"
      >
        <path
          d="M0,120 Q100,80 200,100 T400,90 L400,160 L0,160 Z"
          fill="rgba(255,255,255,0.12)"
        />
        <path
          d="M0,140 Q120,110 240,125 T400,115 L400,160 L0,160 Z"
          fill="rgba(255,255,255,0.08)"
        />
      </svg>
    </div>
  );
}
