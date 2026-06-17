import type { MapProvider } from "@/types/map";

const VALID: MapProvider[] = ["kakao", "naver", "custom"];

/** NEXT_PUBLIC_MAP_PROVIDER → 기본값 kakao */
export function getMapProvider(): MapProvider {
  const raw = (process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "kakao").trim().toLowerCase();
  if (VALID.includes(raw as MapProvider)) {
    return raw as MapProvider;
  }
  return "kakao";
}
