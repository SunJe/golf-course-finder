/**
 * 고양시 골프 5곳 Visit Korea API 수집 + 이미지 다운로드
 * Usage: npm run fetch:visit-korea-goyang-golf
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";
import {
  collectDetailImageUrls,
  saveCourseImageSet,
} from "./lib/visitKoreaBlogImageDownload";

const ROOT = getProjectRoot();
const OUT_DIR = path.join(ROOT, "public/promo-assets/blog/goyang");
const META_PATH = path.join(OUT_DIR, "visit-korea-meta.json");
const AREA_CODE = "31";

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
  skipImageDownload?: boolean;
};

const GOYANG_GOLF_TARGETS: Target[] = [
  {
    key: "goyang-cc",
    courseId: "gc-8fbc2ee961a0",
    title: "고양CC",
    rank: 1,
    searchKeywords: ["고양컨트리클럽", "고양CC", "고양 컨트리클럽"],
    addressHints: ["고양", "덕양", "흥도"],
    titleMustMatch: /고양/i,
    titleExclude: /한양|올림픽|123|스프링/i,
  },
  {
    key: "hanyang-pine",
    courseId: "gc-1faa083d0616",
    title: "한양파인CC",
    rank: 2,
    searchKeywords: ["한양파인CC", "한양파인컨트리클럽"],
    addressHints: ["고양", "덕양"],
    titleMustMatch: /한양파인/i,
  },
  {
    key: "spring-hills",
    courseId: "gc-41b5c15f44da",
    title: "일산스프링힐스CC",
    rank: 3,
    searchKeywords: ["스프링힐스CC", "스프링힐스", "일산스프링힐스"],
    addressHints: ["고양", "일산"],
    titleMustMatch: /스프링힐/i,
  },
  {
    key: "123-golf",
    courseId: "gc-a80360466b97",
    title: "123골프클럽",
    rank: 4,
    searchKeywords: ["123골프클럽", "123골프", "1·2·3"],
    addressHints: ["고양", "덕양", "통일로"],
    titleMustMatch: /123|1·2·3/i,
  },
  {
    key: "olympic",
    courseId: "gc-18640b625b94",
    title: "올림픽 골프장",
    rank: 5,
    searchKeywords: ["올림픽컨트리클럽", "올림픽 골프장", "올림픽CC"],
    addressHints: ["고양", "덕양", "벽제", "혜음"],
    titleMustMatch: /올림픽/i,
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
  const addr = `${item.addr1 ?? ""}${item.addr2 ?? ""}`;
  if (!addr.includes("고양")) return false;
  return true;
}

async function fetchAreaGolfList(): Promise<SearchItem[]> {
  const json = (await tourFetch("areaBasedList2", {
    areaCode: AREA_CODE,
    contentTypeId: "28",
    cat1: "A03",
    cat2: "A0302",
    cat3: "A03020700",
    numOfRows: "100",
  })) as {
    response?: { body?: { items?: { item?: SearchItem | SearchItem[] } } };
  };
  return asArray(json.response?.body?.items?.item).filter((item) =>
    `${item.addr1 ?? ""}${item.addr2 ?? ""}`.includes("고양"),
  );
}

function pickBestMatch(
  items: SearchItem[],
  target: Target,
): SearchItem | null {
  const filtered = items.filter((item) => passesTitleFilters(item, target));
  if (filtered.length === 0) return null;

  const golfItems = filtered.filter((item) =>
    /골프|GC|CC|golf|퍼블릭|대중/i.test(item.title),
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
  const [common, images] = await Promise.all([
    tourFetch("detailCommon2", { contentId }),
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

  const imageItems = asArray(
    (images as { response?: { body?: { items?: { item?: unknown } } } })
      .response?.body?.items?.item,
  ) as Array<{ originimgurl?: string; smallimageurl?: string }>;

  const imageUrls = collectDetailImageUrls(commonItem, imageItems);

  return {
    overview: stripHtml(commonItem?.overview),
    homepage: stripHtml(commonItem?.homepage),
    tel: commonItem?.tel,
    addr1: commonItem?.addr1,
    imageUrls,
    imageCount: imageItems.length,
  };
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("[fetch] Loading 경기 고양 골프 areaBasedList…");
  const areaList = await fetchAreaGolfList();
  console.log(`  ${areaList.length} items in 고양 area list`);

  const results = [];
  let failed = 0;

  for (const target of GOYANG_GOLF_TARGETS) {
    console.log(`[fetch] ${target.title}…`);
    const found = await resolveContent(target, areaList);
    if (!found) {
      console.error(`  FAIL search: ${target.searchKeywords.join(" | ")}`);
      failed += 1;
      continue;
    }

    console.log(`  contentId ${found.contentid} — ${found.title}`);

    const detail = await fetchDetail(found.contentid, found.contenttypeid);
    const publicBase = "/promo-assets/blog/goyang";

    let savedImages: Awaited<ReturnType<typeof saveCourseImageSet>> = {
      imagePaths: [],
    };

    if (!target.skipImageDownload) {
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
    } else {
      console.log(`  skip image download (overview only)`);
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
      imageCredit: savedImages.imagePath ? "출처 : ⓒ한국관광콘텐츠랩" : undefined,
      imageCount: detail.imageCount,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(META_PATH, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  console.log(
    `[fetch] Done — ${results.length}/${GOYANG_GOLF_TARGETS.length} courses, meta → ${path.relative(ROOT, META_PATH)}`,
  );

  if (failed > 0) {
    console.error(`[fetch] WARN — ${failed} issue(s)`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
