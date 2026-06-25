/** 통일된 추천 이유 (모든 골프장 카드 동일) */
export function buildCourseRecommendationReasons(
  distanceFromSeoulKm?: number | null,
): string[] {
  const kmText =
    distanceFromSeoulKm != null
      ? distanceFromSeoulKm.toFixed(1)
      : null;

  return [
    kmText
      ? `서울 근교에서 접근 가능한 코스 (약 ${kmText}km)`
      : "서울 근교에서 접근 가능한 코스",
    "자연 경관이 아름다운 코스",
  ];
}
