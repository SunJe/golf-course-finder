import fs from "node:fs";
import path from "node:path";

export interface GeocodingEnvKeys {
  kakaoRestApiKey: boolean;
  naverClientId: boolean;
  naverClientSecret: boolean;
}

export function loadEnvLocal(root: string): Record<string, string> {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return {};

  const result: Record<string, string> = {};
  const content = fs.readFileSync(envPath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

export function checkGeocodingEnvKeys(root: string): GeocodingEnvKeys {
  const env = loadEnvLocal(root);
  const hasValue = (key: string): boolean => {
    const value = env[key]?.trim();
    return Boolean(value && !value.startsWith("your_"));
  };

  return {
    kakaoRestApiKey: hasValue("KAKAO_REST_API_KEY"),
    naverClientId: hasValue("NAVER_CLIENT_ID"),
    naverClientSecret: hasValue("NAVER_CLIENT_SECRET"),
  };
}

export function getGeocodingProvider(
  keys: GeocodingEnvKeys,
): "kakao" | "naver" | null {
  if (keys.kakaoRestApiKey) return "kakao";
  if (keys.naverClientId && keys.naverClientSecret) return "naver";
  return null;
}
