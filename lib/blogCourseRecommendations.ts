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
      ? `서울에서 30분~1시간 거리 (${kmText}km)`
      : "서울에서 30분~1시간 거리",
    "아름다운 코스",
  ];
}
