import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const raw = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
const key = raw.match(/TOUR_API_KEY\s*=\s*(\S+)/)?.[1] ?? "";

async function tryUrl(label: string, url: string): Promise<void> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    const preview = text.slice(0, 280).replace(/\s+/g, " ");
    console.log(`\n[${label}] HTTP ${res.status}`);
    console.log(preview);
  } catch (e) {
    console.log(`\n[${label}] ERROR`, e instanceof Error ? e.message : e);
  } finally {
    clearTimeout(t);
  }
}

async function main(): Promise<void> {
  const base = "&MobileOS=ETC&MobileApp=GolfMap&_type=json&numOfRows=2";
  const kw = encodeURIComponent("인천그랜드");

  const urls: Array<[string, string]> = [
    [
      "KorService2 searchKeyword2 (key raw)",
      `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?serviceKey=${key}${base}&keyword=${kw}&areaCode=2`,
    ],
    [
      "KorService1 searchKeyword1 (key raw)",
      `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${key}${base}&keyword=${kw}&areaCode=2`,
    ],
    [
      "KorService2 searchKeyword2 (key encoded)",
      `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?serviceKey=${encodeURIComponent(key)}${base}&keyword=${kw}&areaCode=2`,
    ],
    [
      "PhotoGallery gallerySearchList1",
      `https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?serviceKey=${key}${base}&keyword=${kw}`,
    ],
    [
      "KorService2 areaCode2",
      `https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${key}${base}`,
    ],
  ];

  for (const [label, url] of urls) {
    await tryUrl(label, url);
  }

  if (key) {
    const detailUrl = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${key}&contentId=2781611&MobileOS=ETC&MobileApp=GolfMap&_type=json`;
    await tryUrl("detailCommon2 인천그랜드", detailUrl);
    const imgUrl = `https://apis.data.go.kr/B551011/KorService2/detailImage2?serviceKey=${key}&contentId=2781611&MobileOS=ETC&MobileApp=GolfMap&_type=json`;
    await tryUrl("detailImage2 인천그랜드", imgUrl);
    const areaUrl = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${key}&areaCode=2&contentTypeId=28&cat1=A03&cat2=A0302&cat3=A03020700&MobileOS=ETC&MobileApp=GolfMap&_type=json&numOfRows=10`;
    await tryUrl("areaBasedList2 인천 골프", areaUrl);
  }
}

main();
