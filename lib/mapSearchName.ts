/** 괄호(및 괄호 안 내용) 제거 — 외부 지도 검색용. 표시용 name은 변경하지 않음. */
export function normalizeCourseNameForMapSearch(name: string): string {
  return name
    .replace(/\s*[\(\（][^\)\）]*[\)\）]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
