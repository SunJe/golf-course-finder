import type { CourseContentConfidence } from "@/lib/enrichment/courseContentEnrichmentTypes";

interface CourseRecommendationBoxProps {
  reasons: string[];
  confidence?: CourseContentConfidence;
}

function resolveRecommendationTitle(
  confidence: CourseContentConfidence | undefined,
  reasonCount: number,
): string {
  if (confidence === "high") return "이 골프장을 추천하는 이유";
  if (confidence === "low" && reasonCount <= 2) return "기본 정보 요약";
  return "라운드 전 참고할 점";
}

export function CourseRecommendationBox({
  reasons,
  confidence,
}: CourseRecommendationBoxProps) {
  if (reasons.length === 0) return null;

  return (
    <section className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
      <h2 className="text-base font-bold text-emerald-900 sm:text-lg">
        {resolveRecommendationTitle(confidence, reasons.length)}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-2.5 text-sm leading-relaxed text-emerald-950 sm:text-base"
          >
            <span className="mt-0.5 shrink-0" aria-hidden>
              ✅
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
