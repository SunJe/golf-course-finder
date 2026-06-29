/**
 * 가평 골프 6곳 Visit Korea API 수집 + 이미지 다운로드
 * Usage: npm run fetch:visit-korea-gapyeong-golf
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";
import {
  collectDetailImageUrls,
  saveCourseImageSet,
} from "./lib/visitKoreaBlogImageDownload";

const ROOT = getProjectRoot();
const OUT_DIR = path.join(ROOT, "public/promo-assets/blog/gapyeong");
const META_PATH = path.join(OUT_DIR, "visit-korea-meta.json");
const AREA_CODE = "31";
const SIGUNGU_CODE = "1";

type Target = {
  key: string;
  courseId: string;
  title: string;
  rank: number;
  searchKeywords: string[];
  addressHints?: string[];
  titleMustMatch?: RegExp;
  titleExclude?: RegExp;
  contentIdFallback?: string;
};

const GAPYEONG_GOLF_TARGETS: Target[] = [
  {
    key: "sunhill",
    searchKeywords: ["썬힐 골프클럽", "썬힐GC", "썬힐CC"],
    courseId: "gc-d14f87b6bb30",
    title: "썬힐GC",
    rank: 1,
    contentIdFallback: "577443",
  },
  {
    key: "leenlee",
    searchKeywords: ["리앤리CC", "리앤리"],
    courseId: "gc-8503021b2f0d",
    title: "리앤리CC",
    rank: 2,
    contentIdFallback: "2759826",
  },
  {
    key: "venuez",
    searchKeywords: ["베뉴지CC", "베뉴지"],
    courseId: "gc-068617149ff3",
    title: "베뉴지CC",
    rank: 3,
    contentIdFallback: "2763737",
  },
  {
    key: "benest",
    searchKeywords: ["가평베네스트", "가평 베네스트", "베네스트GC"],
    courseId: "gc-a8d0095f2145",
    title: "가평 베네스트GC",
    rank: 4,
    addressHints: ["가평군", "상면"],
    titleMustMatch: /베네스트|GC|CC/i,
    contentIdFallback: "131810",
  },
  {
    key: "crystal-valley",
    searchKeywords: ["크리스탈밸리", "크리스탈밸리CC"],
    courseId: "gc-f0e079a5a368",
    title: "크리스탈밸리CC",
    rank: 5,
    contentIdFallback: "578731",
  },
  {
    key: "midas-valley",
    searchKeywords: ["마이다스밸리 청평", "마이다스밸리"],
    courseId: "gc-14a40331e62c",
    title: "마이다스밸리 청평 골프클럽",
    rank: 6,
    addressHints: ["설악", "청평"],
    contentIdFallback: "577738",
  },
];

function loadTourApiKey(): string {
  const envPath = path.join(ROOT, ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  const match = raw.match(/TOUR_API_KEY\s*=\s*(\S+)/);
  if (!match?.[1]) {
    throw new Error("TOUR_API_KEY not found in .env.local");
  }
  return match[1];
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function tourFetch(
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

interface SearchItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
}

async function searchKeyword(
  keyword: string,
  areaCode?: string,
): Promise<SearchItem[]> {
  const params: Record<string, string> = {
    keyword,
    numOfRows: "20",
  };
  if (areaCode) params.areaCode = areaCode;
  const json = (await tourFetch("searchKeyword2", params)) as {
    response?: { body?: { items?: { item?: SearchItem | SearchItem[] } } };
  };
  return asArray(json.response?.body?.items?.item);
}

function passesTitleFilters(item: SearchItem, target: Target): boolean {
  if (target.titleExclude?.test(item.title)) return false;
  if (target.titleMustMatch && !target.titleMustMatch.test(item.title)) {
    return false;
  }
  return true;
}

async function fetchAreaGolfList(): Promise<SearchItem[]> {
  const json = (await tourFetch("areaBasedList2", {
    areaCode: AREA_CODE,
    sigunguCode: SIGUNGU_CODE,
    contentTypeId: "28",
    cat1: "A03",
    cat2: "A0302",
    cat3: "A03020700",
    numOfRows: "50",
  })) as {
    response?: { body?: { items?: { item?: SearchItem | SearchItem[] } } };
  };
  return asArray(json.response?.body?.items?.item);
}

function pickBestMatch(
  items: SearchItem[],
  target: Target,
): SearchItem | null {
  const filtered = items.filter((item) => passesTitleFilters(item, target));
  if (filtered.length === 0) return null;

  const golfItems = filtered.filter((item) =>
    /골프|GC|CC|golf|밸리/i.test(item.title),
  );
  const pool = golfItems.length > 0 ? golfItems : filtered;

  for (const hint of target.addressHints ?? []) {
    const matched = pool.find((item) =>
      `${item.addr1 ?? ""}${item.addr2 ?? ""}`.includes(hint),
    );
    if (matched) return matched;
  }

  for (const kw of target.searchKeywords) {
    const normalized = kw.replace(/\s/g, "");
    const matched = pool.find((item) => {
      const title = item.title.replace(/\s/g, "");
      return title.includes(normalized) || normalized.includes(title);
    });
    if (matched) return matched;
  }

  return pool[0] ?? null;
}

async function resolveContent(
  target: Target,
  areaList: SearchItem[],
): Promise<SearchItem | null> {
  const searchPasses: Array<() => Promise<SearchItem[]>> = [
    () => searchKeyword(target.searchKeywords[0], AREA_CODE),
    ...target.searchKeywords.slice(1).map(
      (keyword) => () => searchKeyword(keyword, AREA_CODE),
    ),
    () => searchKeyword(target.searchKeywords[0]),
    ...target.searchKeywords.slice(1).map(
      (keyword) => () => searchKeyword(keyword),
    ),
  ];

  for (const load of searchPasses) {
    const found = pickBestMatch(await load(), target);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 200));
  }

  const fromArea = pickBestMatch(
    areaList.filter((item) => {
      const title = item.title.replace(/\s/g, "");
      return target.searchKeywords.some((kw) => {
        const n = kw.replace(/\s/g, "");
        return title.includes(n) || n.includes(title);
      });
    }),
    target,
  );
  if (fromArea) return fromArea;

  if (target.contentIdFallback) {
    const hit = areaList.find(
      (item) => item.contentid === target.contentIdFallback,
    );
    if (hit && passesTitleFilters(hit, target)) return hit;
    return {
      contentid: target.contentIdFallback,
      contenttypeid: "28",
      title: target.title,
    };
  }

  return null;
}

async function fetchDetail(contentId: string, contentTypeId: string) {
  const [common, intro, images] = await Promise.all([
    tourFetch("detailCommon2", { contentId }),
    tourFetch("detailIntro2", { contentId, contentTypeId }),
    tourFetch("detailImage2", { contentId }),
  ]);

  const commonItem = asArray(
    (common as { response?: { body?: { items?: { item?: unknown } } } })
      .response?.body?.items?.item,
  )[0] as {
    overview?: string;
    homepage?: string;
    tel?: string;
    addr1?: string;
    firstimage?: string;
    firstimage2?: string;
  } | undefined;

  const introItem = asArray(
    (intro as { response?: { body?: { items?: { item?: unknown } } } })
      .response?.body?.items?.item,
  )[0] as Record<string, string> | undefined;

  const imageItems = asArray(
    (images as { response?: { body?: { items?: { item?: unknown } } } })
      .response?.body?.items?.item,
  ) as Array<{ originimgurl?: string; smallimageurl?: string; imgname?: string }>;

  const imageUrls = collectDetailImageUrls(commonItem, imageItems);

  return {
    overview: stripHtml(commonItem?.overview),
    homepage: stripHtml(commonItem?.homepage),
    tel: commonItem?.tel,
    addr1: commonItem?.addr1,
    introFields: introItem,
    imageUrls,
    imageCount: imageItems.length,
  };
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("[fetch] Loading 가평군 골프 areaBasedList…");
  const areaList = await fetchAreaGolfList();
  console.log(`  ${areaList.length} items in area list`);

  const results = [];
  let failed = 0;

  for (const target of GAPYEONG_GOLF_TARGETS) {
    console.log(`[fetch] ${target.title}…`);
    const found = await resolveContent(target, areaList);
    if (!found) {
      console.error(`  FAIL search: ${target.searchKeywords.join(" | ")}`);
      failed += 1;
      continue;
    }

    console.log(`  contentId ${found.contentid} — ${found.title}`);

    const detail = await fetchDetail(found.contentid, found.contenttypeid);
    const publicBase = "/promo-assets/blog/gapyeong";

    let savedImages: Awaited<ReturnType<typeof saveCourseImageSet>> = {
      imagePaths: [],
    };

    if (detail.imageUrls.length > 0) {
      savedImages = await saveCourseImageSet(
        target.key,
        OUT_DIR,
        publicBase,
        detail.imageUrls,
      );
      for (const [index, imagePath] of savedImages.imagePaths.entries()) {
        console.log(`  image ${index + 1} → ${imagePath}`);
      }
    } else {
      console.log(`  WARN no image`);
      failed += 1;
    }

    results.push({
      key: target.key,
      courseId: target.courseId,
      title: target.title,
      rank: target.rank,
      searchKeywords: target.searchKeywords,
      contentId: found.contentid,
      apiTitle: found.title,
      apiAddr: found.addr1 ?? detail.addr1,
      overview: detail.overview,
      homepage: detail.homepage,
      tel: detail.tel,
      imagePaths: savedImages.imagePaths,
      imagePath: savedImages.imagePath,
      imagePath2: savedImages.imagePath2,
      imageCredit: "출처 : ⓒ한국관광콘텐츠랩",
      imageCount: detail.imageCount,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(META_PATH, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  console.log(
    `[fetch] Done — ${results.length}/${GAPYEONG_GOLF_TARGETS.length} courses, meta → ${path.relative(ROOT, META_PATH)}`,
  );

  if (failed > 0) {
    console.error(`[fetch] WARN — ${failed} issue(s) (missing search or image)`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
