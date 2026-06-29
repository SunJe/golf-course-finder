/** Visit Korea blog meta JSON에서 로컬 이미지 경로 목록을 수집 */
export type VisitKoreaMetaImageFields = {
  imagePaths?: string[];
  imagePath?: string;
  imagePath2?: string;
};

function isAllowedVisitKoreaImagePath(imagePath: string): boolean {
  const trimmed = imagePath.trim();
  if (!trimmed) return false;
  if (trimmed.includes("/promo-assets/blog/source/")) return false;
  return (
    trimmed.startsWith("/promo-assets/blog/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
}

export function collectVisitKoreaMetaImagePaths(
  entry: VisitKoreaMetaImageFields | undefined,
): string[] {
  if (!entry) return [];

  const fromArray = (entry.imagePaths ?? []).filter(
    (p): p is string => Boolean(p?.trim()) && isAllowedVisitKoreaImagePath(p),
  );
  if (fromArray.length > 0) return fromArray;

  const legacy = [entry.imagePath, entry.imagePath2]
    .filter((p): p is string => Boolean(p?.trim()))
    .filter(isAllowedVisitKoreaImagePath);

  return legacy;
}
