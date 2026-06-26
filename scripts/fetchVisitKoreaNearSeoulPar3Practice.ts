/**
 * 서울 근교 파3 연습장 블로그용 Visit Korea API 수집
 * Usage: npm run fetch:visit-korea-near-seoul-par3-practice
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const OUT_DIR = path.join(ROOT, "public/promo-assets/blog/near-seoul-par3-practice");
const META_PATH = path.join(OUT_DIR, "visit-korea-meta.json");
const AREA_CODE = "31";

type Target = {
  key: string;
  courseId?: string;
  title: string;
  rank: number;
  searchKeywords: string[];
  addressHints?: string[];
  titleMustMatch?: RegExp;
  titleExclude?: RegExp;
  contentIdFallback?: string;
};

const TARGETS: Target[] = [
  {
    key: "88cc",
    courseId: "gc-0f218a599984",
    title: "88CC Par3 골프장",
    rank: 2,
    searchKeywords: ["88컨트리클럽", "88CC", "국가보훈부 88골프장"],
    addressHints: ["용인", "기흥"],
    titleMustMatch: /88|보훈/i,
  },
  {
    key: "nam-seoul",
    courseId: "gc-210de13c89f8",
    title: "남서울CC",
    rank: 4,
    searchKeywords: ["남서울컨트리클럽", "남서울CC"],
    addressHints: ["성남", "분당", "판교"],
    titleMustMatch: /남서울/i,
  },
  {
    key: "osung",
    title: "오성골프클럽",
    rank: 5,
    searchKeywords: ["오성골프클럽", "오성골프"],
    addressHints: ["파주", "운정"],
    titleMustMatch: /오성/i,
    contentIdFallback: "2756498",
  },
  {
    key: "lui-hills",
    title: "루이힐스CC",
    rank: 6,
    searchKeywords: ["루이힐스CC", "루이힐스골프클럽"],
    addressHints: ["양주"],
    titleMustMatch: /루이힐스/i,
    contentIdFallback: "2748389",
  },
  {
    key: "riviera",
    courseId: "gc-4731f8c98a6d",
    title: "리베라CC",
    rank: 7,
    searchKeywords: ["리베라컨트리클럽", "리베라CC"],
    addressHints: ["화성", "동탄"],
    titleMustMatch: /리베라/i,
  },
  {
    key: "suwon",
    courseId: "gc-38b838344176",
    title: "수원CC",
    rank: 8,
    searchKeywords: ["수원컨트리클럽", "수원CC"],
    addressHints: ["용인", "기흥"],
    titleMustMatch: /수원/i,
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
    contentTypeId: "28",
    cat1: "A03",
    cat2: "A0302",
    cat3: "A03020700",
    numOfRows: "100",
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
    /골프|GC|CC|golf|퍼블릭|대중|연습|파3/i.test(item.title),
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

async function fetchDetail(contentId: string) {
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
  } | undefined;

  const imageItems = asArray(
    (images as { response?: { body?: { items?: { item?: unknown } } } })
      .response?.body?.items?.item,
  ) as Array<{ originimgurl?: string; smallimageurl?: string }>;

  const imageUrls: string[] = [];
  for (const img of imageItems) {
    const url = img.originimgurl ?? img.smallimageurl;
    if (url && !imageUrls.includes(url)) imageUrls.push(url);
  }
  if (commonItem?.firstimage && !imageUrls.includes(commonItem.firstimage)) {
    imageUrls.unshift(commonItem.firstimage);
  }

  return {
    overview: stripHtml(commonItem?.overview),
    homepage: stripHtml(commonItem?.homepage),
    tel: commonItem?.tel,
    addr1: commonItem?.addr1,
    imageUrls: imageUrls.slice(0, 2),
    imageCount: imageItems.length,
  };
}

async function downloadImage(url: string, filePath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buf);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("[fetch] Loading 경기 골프 areaBasedList…");
  const areaList = await fetchAreaGolfList();
  console.log(`  ${areaList.length} items in area list`);

  const results = [];
  let failed = 0;

  for (const target of TARGETS) {
    console.log(`[fetch] ${target.title}…`);
    const found = await resolveContent(target, areaList);
    if (!found) {
      console.error(`  FAIL search: ${target.searchKeywords.join(" | ")}`);
      failed += 1;
      continue;
    }

    console.log(`  contentId ${found.contentid} — ${found.title}`);

    const detail = await fetchDetail(found.contentid);
    const imagePath = `/promo-assets/blog/near-seoul-par3-practice/${target.key}.jpg`;
    const imagePath2 = `/promo-assets/blog/near-seoul-par3-practice/${target.key}-2.jpg`;
    const localPath = path.join(OUT_DIR, `${target.key}.jpg`);
    const localPath2 = path.join(OUT_DIR, `${target.key}-2.jpg`);

    let savedImagePath: string | undefined;
    let savedImagePath2: string | undefined;

    if (detail.imageUrls[0]) {
      await downloadImage(detail.imageUrls[0], localPath);
      savedImagePath = imagePath;
      console.log(`  image 1 → ${path.relative(ROOT, localPath)}`);
    } else {
      console.log(`  WARN no image`);
      failed += 1;
    }

    if (detail.imageUrls[1]) {
      await downloadImage(detail.imageUrls[1], localPath2);
      savedImagePath2 = imagePath2;
      console.log(`  image 2 → ${path.relative(ROOT, localPath2)}`);
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
      imagePath: savedImagePath,
      imagePath2: savedImagePath2,
      imageCredit: savedImagePath ? "출처 : ⓒ한국관광콘텐츠랩" : undefined,
      imageCount: detail.imageCount,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(META_PATH, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  console.log(
    `[fetch] Done — ${results.length}/${TARGETS.length} courses, meta → ${path.relative(ROOT, META_PATH)}`,
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
