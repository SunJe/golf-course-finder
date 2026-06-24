export type ParsedRegionBreadcrumb = {
  candidateRegion: string;
  candidateSubregion: string;
  candidateType: string;
};

const REGION_TOKEN =
  /(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주|강원도|경기도|전라|충청|경상)/;

export function parseRegionBreadcrumb(regionLine: string): ParsedRegionBreadcrumb {
  const normalized = regionLine.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { candidateRegion: "", candidateSubregion: "", candidateType: "" };
  }

  const parts = normalized
    .split(/>|·|\|/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { candidateRegion: "", candidateSubregion: "", candidateType: "" };
  }

  let candidateType = "";
  const lastPart = parts[parts.length - 1] ?? "";
  const standaloneType = lastPart.match(/^\(?([PM])\)?$/i);
  if (standaloneType) {
    candidateType = standaloneType[1].toUpperCase();
    parts.pop();
  }

  const candidateRegion = parts[0] ?? "";
  let candidateSubregion = parts.length > 1 ? parts.slice(1).join(" > ") : "";

  const typeInName = candidateSubregion.match(/\(([PM])\)\s*$/i);
  if (typeInName) {
    candidateType = typeInName[1].toUpperCase();
    candidateSubregion = candidateSubregion.replace(/\(([PM])\)\s*$/i, "").trim();
  }

  if (!candidateSubregion && parts.length === 1) {
    const only = parts[0] ?? "";
    if (/권$/.test(only) && only !== candidateRegion) {
      candidateSubregion = only;
    }
  }

  return { candidateRegion, candidateSubregion, candidateType };
}

export function isLikelySubregionToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed) return true;
  if (/권$/.test(trimmed) && trimmed.length <= 8) return true;
  if (REGION_TOKEN.test(trimmed) && !/[A-Za-z가-힣]{2,}\(/.test(trimmed)) {
    return trimmed.length <= 10 && !/(CC|GC|클럽|골프)/i.test(trimmed);
  }
  return false;
}

export function isLikelyCourseTitleToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed || isLikelySubregionToken(trimmed)) return false;
  if (/^[\d.]+$/.test(trimmed)) return false;
  return /[A-Za-z가-힣]/.test(trimmed);
}
