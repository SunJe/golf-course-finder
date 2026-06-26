/**
 * Visit Korea 레저스포츠 > 골프 카테고리 전체 목록 + 이미지 수집
 * Usage: npm run fetch:visit-korea-golf-catalog
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";
import { asArray, sleep, tourFetch } from "./lib/tourApiClient";
import { collectVisitKoreaImages } from "@/lib/enrichment/visitKoreaImageMatcher";
import type { VisitKoreaGolfEntry } from "@/lib/enrichment/visitKoreaImageMatcher";

const ROOT = getProjectRoot();
const RAW_PATH = path.join(ROOT, "data/visit-korea-golf-raw.json");
const IMAGES_PATH = path.join(ROOT, "data/visit-korea-golf-images.json");

const GOLF_LIST_PARAMS = {
  contentTypeId: "28",
  cat1: "A03",
  cat2: "A0302",
  cat3: "A03020700",
};

type ListItem = {
  contentid: string;
  contenttypeid?: string;
  title: string;
  addr1?: string;
  addr2?: string;
  mapx?: string;
  mapy?: string;
  firstimage?: string;
  firstimage2?: string;
  areacode?: string;
};

async function fetchAreaCodes(): Promise<string[]> {
  const json = (await tourFetch("areaCode2", { numOfRows: "50" })) as {
    response?: {
      body?: {
        items?: {
          item?: Array<{ code?: string; rnum?: string; name?: string }>;
        };
      };
    };
  };

  const items = asArray(json.response?.body?.items?.item);
  const codes = items
    .map((item) => item.code?.trim())
    .filter((code): code is string => Boolean(code));

  if (codes.length > 0) return codes;

  return ["1", "2", "3", "4", "5", "6", "7", "8", "31", "32", "33", "34", "35", "36", "37", "38", "39"];
}

async function fetchAreaGolfPage(
  areaCode: string,
  pageNo: number,
): Promise<{ items: ListItem[]; totalCount: number }> {
  const json = (await tourFetch("areaBasedList2", {
    areaCode,
    ...GOLF_LIST_PARAMS,
    numOfRows: "100",
    pageNo: String(pageNo),
  })) as {
    response?: {
      body?: {
        totalCount?: number | string;
        items?: { item?: ListItem | ListItem[] };
      };
    };
  };

  const totalCount = Number(json.response?.body?.totalCount ?? 0);
  const items = asArray(json.response?.body?.items?.item);
  return { items, totalCount };
}

async function fetchAllGolfListings(): Promise<ListItem[]> {
  const areaCodes = await fetchAreaCodes();
  const byContentId = new Map<string, ListItem>();

  for (const areaCode of areaCodes) {
    let pageNo = 1;
    let totalCount = 0;

    do {
      const page = await fetchAreaGolfPage(areaCode, pageNo);
      totalCount = page.totalCount;
      for (const item of page.items) {
        if (!item.contentid) continue;
        byContentId.set(item.contentid, {
          ...item,
          areacode: areaCode,
        });
      }
      pageNo += 1;
      await sleep(120);
    } while ((pageNo - 1) * 100 < totalCount);
  }

  return [...byContentId.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "ko"),
  );
}

async function fetchDetailImages(contentId: string): Promise<string[]> {
  const json = (await tourFetch("detailImage2", { contentId })) as {
    response?: {
      body?: {
        items?: {
          item?: Array<{ originimgurl?: string; smallimageurl?: string }>;
        };
      };
    };
  };

  const imageItems = asArray(json.response?.body?.items?.item);
  const urls: string[] = [];
  for (const item of imageItems) {
    const url = item.originimgurl ?? item.smallimageurl;
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

function isValidImageUrl(url?: string): boolean {
  if (!url?.trim()) return false;
  if (url.includes("/promo-assets/blog/source/")) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

async function enrichWithDetailImages(
  listings: ListItem[],
): Promise<VisitKoreaGolfEntry[]> {
  const results: VisitKoreaGolfEntry[] = [];

  for (const item of listings) {
    let imageList: string[] = [];
    const hasListImages =
      isValidImageUrl(item.firstimage) || isValidImageUrl(item.firstimage2);

    if (!hasListImages) {
      try {
        imageList = await fetchDetailImages(item.contentid);
        await sleep(150);
      } catch (error) {
        console.warn(
          `[warn] detailImage2 failed for ${item.title} (${item.contentid})`,
          error instanceof Error ? error.message : error,
        );
      }
    } else if (hasListImages) {
      try {
        imageList = await fetchDetailImages(item.contentid);
        await sleep(120);
      } catch {
        imageList = [];
      }
    }

    const entry: VisitKoreaGolfEntry = {
      contentId: item.contentid,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      firstimage: isValidImageUrl(item.firstimage) ? item.firstimage : undefined,
      firstimage2: isValidImageUrl(item.firstimage2) ? item.firstimage2 : undefined,
      imageList,
      mapx: item.mapx,
      mapy: item.mapy,
      areaCode: item.areacode,
    };

    if (collectVisitKoreaImages(entry).length > 0) {
      results.push(entry);
    }
  }

  return results;
}

async function main(): Promise<void> {
  console.log("[fetch] Visit Korea golf catalog…");
  const listings = await fetchAllGolfListings();
  console.log(`[fetch] raw listings: ${listings.length}`);

  fs.mkdirSync(path.dirname(RAW_PATH), { recursive: true });
  fs.writeFileSync(
    RAW_PATH,
    `${JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        category: "레저스포츠 > 골프",
        totalCount: listings.length,
        items: listings,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("[fetch] enriching image details…");
  const withImages = await enrichWithDetailImages(listings);
  console.log(`[fetch] with images: ${withImages.length}`);

  fs.writeFileSync(
    IMAGES_PATH,
    `${JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        totalCount: withImages.length,
        items: withImages,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`saved: ${RAW_PATH}`);
  console.log(`saved: ${IMAGES_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
