import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./sourceRegistry";

const ROOT = getProjectRoot();

export function loadTourApiKey(): string {
  const envPath = path.join(ROOT, ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  const match = raw.match(/TOUR_API_KEY\s*=\s*(\S+)/);
  if (!match?.[1]) {
    throw new Error("TOUR_API_KEY not found in .env.local");
  }
  return match[1];
}

export function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function tourFetch(
  endpoint: string,
  params: Record<string, string>,
): Promise<unknown> {
  const key = loadTourApiKey();
  const qs = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "GolfMap",
    _type: "json",
    ...params,
  });
  const url = `https://apis.data.go.kr/B551011/KorService2/${endpoint}?serviceKey=${key}&${qs.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${endpoint} HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = JSON.parse(text) as {
      response?: { header?: { resultCode?: string; resultMsg?: string } };
    };
    const code = json.response?.header?.resultCode;
    if (code && code !== "0000") {
      throw new Error(
        `${endpoint} API ${code}: ${json.response?.header?.resultMsg ?? ""}`,
      );
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
