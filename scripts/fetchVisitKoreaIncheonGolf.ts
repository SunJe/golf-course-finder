/**
 * 인천 골프 6곳 Visit Korea API 수집 + 이미지 다운로드
 * Usage: npm run fetch:visit-korea-incheon-golf
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";
import {
  collectDetailImageUrls,
  saveCourseImageSet,
} from "./lib/visitKoreaBlogImageDownload";

const ROOT = getProjectRoot();
const OUT_DIR = path.join(ROOT, "public/promo-assets/blog/incheon");
const META_PATH = path.join(OUT_DIR, "visit-korea-meta.json");

type Target = {
  key: string;
  courseId: string;
  title: string;
  rank: number;
  searchKeywords: string[];
  addressHints?: string[];
  /** 제목에 반드시 포함되어야 하는 패턴 (골프장 오매칭 방지) */
  titleMustMatch?: RegExp;
  /** 제목에 있으면 제외 (예: 드림파크 주민체육공원) */
  titleExclude?: RegExp;
  /** areaBasedList / searchKeyword 실패 시 직접 contentId */
  contentIdFallback?: string;
};

const INCHEON_GOLF_TARGETS: Target[] = [
  {
    key: "incheon-grand",
    searchKeywords: ["인천그랜드CC", "인천그랜드"],
    courseId: "gc-60319bf1693c",
    title: "인천그랜드CC",
    rank: 1,
    contentIdFallback: "2781611",
  },
  {
    key: "dream-park",
    searchKeywords: ["드림파크CC", "드림파크골프"],
    courseId: "gc-fa86c43067e7",
    title: "드림파크CC",
    rank: 2,
    addressHints: ["자원순환", "백석"],
    titleMustMatch: /CC|GC|골프/i,
    titleExclude: /주민체육|휴펜션|야생화/i,
    contentIdFallback: "2768223",
  },
  {
    key: "bears-best-cheongna",
    searchKeywords: ["베어즈베스트청라GC", "베어즈베스트청라", "베어즈베스트"],
    courseId: "gc-fa55dbc73e9b",
    title: "베어즈베스트청라GC",
    rank: 3,
    contentIdFallback: "2781467",
  },
  {
    key: "songdo",
    searchKeywords: ["송도골프클럽", "송도골프"],
    courseId: "gc-68bd427a4957",
    title: "송도골프클럽",
    rank: 4,
    contentIdFallback: "2767803",
  },
  {
    key: "orange-dunes-yeongjong",
    searchKeywords: [
      "오렌지듄스 영종",
      "오렌지듄스영종",
      "영종골프",
      "오렌지듄스",
    ],
    courseId: "gc-496303f3c77c",
    title: "오렌지듄스 영종골프클럽",
    rank: 5,
    addressHints: ["영종", "중구", "운서"],
  },
  {
    key: "jack-nicklaus",
    searchKeywords: ["잭니클라우스GC코리아", "잭니클라우스", "잭 니클라우스"],
    courseId: "gc-3f766167d45e",
    title: "잭니클라우스GC코리아",
    rank: 6,
    contentIdFallback: "2778089",
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
    areaCode: "2",
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
    /골프|GC|CC|golf/i.test(item.title),
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
    () => searchKeyword(target.searchKeywords[0], "2"),
    ...target.searchKeywords.slice(1).map(
      (keyword) => () => searchKeyword(keyword, "2"),
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

  console.log("[fetch] Loading 인천 골프 areaBasedList…");
  const areaList = await fetchAreaGolfList();
  console.log(`  ${areaList.length} items in area list`);

  const results = [];
  let failed = 0;

  for (const target of INCHEON_GOLF_TARGETS) {
    console.log(`[fetch] ${target.title}…`);
    const found = await resolveContent(target, areaList);
    if (!found) {
      console.error(`  FAIL search: ${target.searchKeywords.join(" | ")}`);
      failed += 1;
      continue;
    }

    console.log(`  contentId ${found.contentid} — ${found.title}`);

    const detail = await fetchDetail(found.contentid, found.contenttypeid);
    const publicBase = "/promo-assets/blog/incheon";

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
    `[fetch] Done — ${results.length}/${INCHEON_GOLF_TARGETS.length} courses, meta → ${path.relative(ROOT, META_PATH)}`,
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
