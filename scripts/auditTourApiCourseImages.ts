/**
 * Audit + optional download of TourAPI golf course photos for regional blog posts.
 *
 * Usage:
 *   npx tsx scripts/auditTourApiCourseImages.ts
 *   npx tsx scripts/auditTourApiCourseImages.ts --download
 *   npx tsx scripts/auditTourApiCourseImages.ts --target=pocheon --download
 *
 * Env: TOUR_API_KEY in .env.local (value never logged)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/envUtils";
import { getProjectRoot } from "./lib/sourceRegistry";
import { asArray, sleep, tourFetch } from "./lib/tourApiClient";

const ROOT = getProjectRoot();
const DATE = "2026-07-11";
const REPORT_JSON = path.join(
  ROOT,
  `reports/tourapi-course-image-audit-${DATE}.json`,
);
const REPORT_MD = path.join(
  ROOT,
  `reports/tourapi-course-image-audit-${DATE}.md`,
);
const MANIFEST_PATH = path.join(ROOT, "data/tourapi-course-images.json");
const IMAGE_ROOT = path.join(
  ROOT,
  "public/promo-assets/blog/tourapi-courses",
);

type BlogTarget = "pocheon" | "yongin" | "hwaseong";

type CourseTarget = {
  blogSlug: string;
  courseId: string;
  courseName: string;
  searchKeywords: string[];
  candidateContentIds: string[];
  cityMustInclude: string[];
  addressHints?: string[];
};

const TARGETS: CourseTarget[] = [
  // 포천
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-9d709ff43c33",
    courseName: "몽베르CC(퍼블릭)",
    searchKeywords: [
      "몽베르컨트리클럽",
      "몽베르CC",
      "몽베르",
      "몽베르 골프",
      "포천 몽베르",
    ],
    candidateContentIds: [],
    cityMustInclude: ["포천"],
  },
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-e2614722e86e",
    courseName: "포천아도니스 퍼블릭",
    searchKeywords: ["포천아도니스", "아도니스퍼블릭", "아도니스CC"],
    candidateContentIds: [],
    cityMustInclude: ["포천"],
  },
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-b7fd5ee009ca",
    courseName: "포레스트힐CC",
    searchKeywords: ["포레스트힐CC", "포레스트힐컨트리클럽", "포레스트힐"],
    candidateContentIds: ["2753756"],
    cityMustInclude: ["포천"],
  },
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-7c76a7546834",
    courseName: "샴발라CC",
    searchKeywords: ["샴발라CC", "샴발라컨트리클럽", "샴발라"],
    candidateContentIds: ["2753729"],
    cityMustInclude: ["포천"],
  },
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-564e2ae6067a",
    courseName: "포천힐스CC",
    searchKeywords: ["포천힐스CC", "포천힐스컨트리클럽", "포천힐스"],
    candidateContentIds: ["1030591"],
    cityMustInclude: ["포천"],
  },
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-b46ed64b80b6",
    courseName: "필로스GC",
    searchKeywords: ["필로스GC", "필로스골프클럽", "필로스"],
    candidateContentIds: [],
    cityMustInclude: ["포천"],
  },
  {
    blogSlug: "pocheon-golf-best-7",
    courseId: "gc-fb0d61e3914d",
    courseName: "베어크리크GC",
    searchKeywords: ["베어크리크", "베어크리크GC", "베어크릭"],
    candidateContentIds: ["2752723"],
    cityMustInclude: ["포천"],
  },
  // 용인
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-e684f84c8fa4",
    courseName: "레이크사이드CC(퍼블릭)",
    searchKeywords: ["레이크사이드컨트리클럽", "레이크사이드CC", "레이크사이드"],
    candidateContentIds: [],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-8b59a320f132",
    courseName: "한림용인CC",
    searchKeywords: ["한림용인컨트리클럽", "한림용인CC", "한림용인"],
    candidateContentIds: ["131568"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-f4bb9638f567",
    courseName: "해솔리아 컨트리클럽",
    searchKeywords: ["해솔리아컨트리클럽", "해솔리아CC", "해솔리아"],
    candidateContentIds: ["2746691"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-897c73dbf41b",
    courseName: "양지파인골프클럽",
    searchKeywords: ["양지파인골프클럽", "양지파인"],
    candidateContentIds: ["131563"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-c45d3f5d316d",
    courseName: "써닝포인트 컨트리클럽",
    searchKeywords: ["써닝포인트컨트리클럽", "써닝포인트CC", "써닝포인트"],
    candidateContentIds: ["2742078"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-af63c289d999",
    courseName: "세현CC",
    searchKeywords: ["세현컨트리클럽", "세현CC", "세현"],
    candidateContentIds: ["2742113"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-928514cac4c6",
    courseName: "용인CC",
    searchKeywords: ["용인컨트리클럽", "용인CC"],
    candidateContentIds: [],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-4687a4044d34",
    courseName: "지산퍼블릭",
    searchKeywords: ["지산컨트리클럽", "지산퍼블릭", "지산CC"],
    candidateContentIds: ["130980"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-4487ee52808c",
    courseName: "코리아퍼블릭CC",
    searchKeywords: ["코리아퍼블릭CC", "코리아대중CC", "코리아퍼블릭"],
    candidateContentIds: ["2746695"],
    cityMustInclude: ["용인"],
  },
  {
    blogSlug: "yongin-golf-best-10",
    courseId: "gc-2ef4e18d677b",
    courseName: "블루원용인CC(퍼블릭)",
    searchKeywords: ["블루원용인컨트리클럽", "블루원용인CC", "블루원용인"],
    candidateContentIds: ["131655"],
    cityMustInclude: ["용인"],
  },
  // 화성
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-4905c6ca9b75",
    courseName: "화성상록GC",
    searchKeywords: ["화성상록", "상록GC", "화성 상록"],
    candidateContentIds: ["2747222"],
    cityMustInclude: ["화성"],
  },
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-7701abd77260",
    courseName: "기흥컨트리클럽",
    searchKeywords: ["기흥컨트리클럽", "기흥CC"],
    candidateContentIds: ["131416"],
    cityMustInclude: ["화성"],
  },
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-4731f8c98a6d",
    courseName: "리베라컨트리클럽",
    searchKeywords: ["리베라컨트리클럽", "리베라CC"],
    candidateContentIds: ["131392"],
    cityMustInclude: ["화성"],
  },
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-2db2d6cad688",
    courseName: "발리오스CC",
    searchKeywords: ["발리오스컨트리클럽", "발리오스CC", "발리오스"],
    candidateContentIds: [],
    cityMustInclude: ["화성"],
  },
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-5ec5b76d3c22",
    courseName: "화성골프클럽",
    searchKeywords: ["화성골프클럽", "화성GC"],
    candidateContentIds: ["2747215"],
    cityMustInclude: ["화성"],
  },
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-ee03e5ddbe9f",
    courseName: "라비돌CC",
    searchKeywords: ["라비돌컨트리클럽", "라비돌CC", "라비돌"],
    candidateContentIds: [],
    cityMustInclude: ["화성"],
  },
  {
    blogSlug: "hwaseong-golf-best-7",
    courseId: "gc-c77232b99bd6",
    courseName: "링크나인골프클럽",
    searchKeywords: ["링크나인골프클럽", "링크나인"],
    candidateContentIds: [],
    cityMustInclude: ["화성"],
  },
];

type CommonItem = {
  contentid?: string;
  contenttypeid?: string;
  title?: string;
  addr1?: string;
  addr2?: string;
  mapx?: string;
  mapy?: string;
  tel?: string;
  homepage?: string;
  firstimage?: string;
  firstimage2?: string;
  /** areaBasedList / searchKeyword / detailCommon 대표 이미지 저작권 */
  cpyrhtDivCd?: string;
};

type ImageItem = {
  originimgurl?: string;
  smallimageurl?: string;
  imgname?: string;
  cpyrhtDivCd?: string;
  serialnum?: string;
};

type AuditRow = {
  blogSlug: string;
  courseId: string;
  courseName: string;
  candidateContentId: string | null;
  resolvedContentId: string | null;
  contentTypeId: string | null;
  tourApiTitle: string | null;
  tourApiAddress: string | null;
  tourApiMapX: string | null;
  tourApiMapY: string | null;
  golfMapAddress: string | null;
  golfMapLat: number | null;
  golfMapLng: number | null;
  matchScore: number;
  matchStatus: "accepted" | "no_match" | "manual_review" | "no_images";
  matchReasons: string[];
  imageCount: number;
  selectedImage: string | null;
  copyrightCodeRaw: string | null;
  licenseLabel: string | null;
  sourcePage: string | null;
  notes: string;
  localPath?: string;
  md5?: string;
  width?: number;
  height?: number;
  originalUrl?: string;
};

function normalizeName(name: string): string {
  return name
    .replace(/\(퍼블릭\)|\(회원제\)|\(비회원제\)|\(대중제\)/g, "")
    .replace(/컨트리클럽|골프클럽|골프장/g, "")
    .replace(/\bC\.?C\.?\b|\bG\.?C\.?\b/gi, "")
    .replace(/퍼블릭|대중/g, "")
    .replace(/[\s·.\-_/]/g, "")
    .toLowerCase();
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function licenseFromCode(code: string | undefined | null): string | null {
  const raw = (code ?? "").trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === "TYPE1" || upper === "1" || raw.includes("제1")) {
    return "공공누리 제1유형";
  }
  if (upper === "TYPE3" || upper === "3" || raw.includes("제3")) {
    return "공공누리 제3유형";
  }
  return null;
}

async function detailCommon(contentId: string): Promise<CommonItem | null> {
  // TourAPI 4.0: detailCommon2는 contentId 중심 (legacy *YN 플래그 제거)
  const json = (await tourFetch("detailCommon2", {
    contentId,
  })) as {
    response?: { body?: { items?: { item?: CommonItem | CommonItem[] } } };
  };
  return asArray(json.response?.body?.items?.item)[0] ?? null;
}

async function detailImages(contentId: string): Promise<ImageItem[]> {
  // TourAPI 4.0: subImageYN 제거됨 — imageYN + paging만 사용
  const json = (await tourFetch("detailImage2", {
    contentId,
    imageYN: "Y",
    numOfRows: "50",
  })) as {
    response?: { body?: { items?: { item?: ImageItem | ImageItem[] } } };
  };
  return asArray(json.response?.body?.items?.item);
}

async function searchKeyword(
  keyword: string,
  areaCode?: string,
): Promise<CommonItem[]> {
  const params: Record<string, string> = {
    keyword,
    contentTypeId: "28",
    numOfRows: "20",
  };
  if (areaCode) params.areaCode = areaCode;
  const json = (await tourFetch("searchKeyword2", params)) as {
    response?: { body?: { items?: { item?: CommonItem | CommonItem[] } } };
  };
  return asArray(json.response?.body?.items?.item);
}

function scoreMatch(
  target: CourseTarget,
  item: CommonItem,
  golf: { address: string | null; lat: number | null; lng: number | null; phone?: string | null; homepage?: string | null },
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const title = item.title ?? "";
  const addr = `${item.addr1 ?? ""} ${item.addr2 ?? ""}`.trim();
  const nTitle = normalizeName(title);
  const nCourse = normalizeName(target.courseName);

  if (nTitle && nCourse && (nTitle === nCourse || nTitle.includes(nCourse) || nCourse.includes(nTitle))) {
    score += 50;
    reasons.push("이름 정확/포함 일치");
  }

  const cityOk = target.cityMustInclude.some((c) => addr.includes(c));
  if (cityOk) {
    score += 25;
    reasons.push("시/군 일치");
  } else {
    reasons.push("시/군 불일치");
  }

  for (const hint of target.addressHints ?? []) {
    if (addr.includes(hint)) {
      score += 15;
      reasons.push(`읍/면/구 힌트:${hint}`);
      break;
    }
  }

  const phone = (item.tel ?? "").replace(/\D/g, "");
  const golfPhone = (golf.phone ?? "").replace(/\D/g, "");
  if (phone && golfPhone && (phone.includes(golfPhone) || golfPhone.includes(phone))) {
    score += 20;
    reasons.push("전화 일치");
  }

  const hp = (item.homepage ?? "").toLowerCase();
  const golfHp = (golf.homepage ?? "").toLowerCase();
  if (hp && golfHp && (hp.includes(golfHp.replace(/^https?:\/\//, "").split("/")[0]) || golfHp.includes(hp.replace(/^https?:\/\//, "").split("/")[0]))) {
    score += 20;
    reasons.push("홈페이지 일치");
  }

  const mapx = Number(item.mapx);
  const mapy = Number(item.mapy);
  if (
    Number.isFinite(mapx) &&
    Number.isFinite(mapy) &&
    golf.lat != null &&
    golf.lng != null &&
    golf.lat !== 0 &&
    golf.lng !== 0
  ) {
    // TourAPI: mapx=lng, mapy=lat
    const dist = haversineKm(golf.lat, golf.lng, mapy, mapx);
    if (dist <= 3) {
      score += 20;
      reasons.push(`좌표 ${dist.toFixed(1)}km`);
    } else {
      reasons.push(`좌표 멀음 ${dist.toFixed(1)}km`);
    }
  }

  if (String(item.contenttypeid ?? "") !== "28") {
    score = 0;
    reasons.push("contentTypeId!=28");
  }

  return { score, reasons };
}

async function probeImage(
  url: string,
): Promise<{ ok: boolean; buf?: Buffer; contentType?: string; width?: number; height?: number }> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { ok: false };
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return { ok: false };
    const buf = Buffer.from(await res.arrayBuffer());
    // PNG IHDR / JPEG SOF rough size
    let width: number | undefined;
    let height: number | undefined;
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      // JPEG: scan SOF
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          height = buf.readUInt16BE(i + 5);
          width = buf.readUInt16BE(i + 7);
          break;
        }
        const len = buf.readUInt16BE(i + 2);
        i += 2 + len;
      }
    } else if (buf[0] === 0x89 && buf[1] === 0x50) {
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
    }
    return { ok: true, buf, contentType, width, height };
  } catch {
    return { ok: false };
  }
}

function extFromContentType(ct: string, url: string): string {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  if (url.toLowerCase().endsWith(".png")) return "png";
  return "jpg";
}

function parseArgs(argv: string[]) {
  const download = argv.includes("--download");
  const targetArg = argv.find((a) => a.startsWith("--target="));
  const target = (targetArg?.split("=")[1] ?? "all") as BlogTarget | "all";
  return { download, target };
}

async function loadGolfCourses(
  ids: string[],
): Promise<
  Map<
    string,
    {
      name: string;
      address: string | null;
      lat: number | null;
      lng: number | null;
      phone: string | null;
      homepage: string | null;
    }
  >
> {
  const env = loadEnvLocal(ROOT);
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    (env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
  );
  const { data, error } = await sb
    .from("golf_courses")
    .select("id,name,address,latitude,longitude,phone,homepage_url")
    .in("id", ids);
  if (error) throw error;
  const map = new Map<
    string,
    {
      name: string;
      address: string | null;
      lat: number | null;
      lng: number | null;
      phone: string | null;
      homepage: string | null;
    }
  >();
  for (const row of data ?? []) {
    map.set(row.id, {
      name: row.name,
      address: row.address ?? null,
      lat: row.latitude ?? null,
      lng: row.longitude ?? null,
      phone: row.phone ?? null,
      homepage: row.homepage_url ?? null,
    });
  }
  return map;
}

async function main() {
  const { download, target } = parseArgs(process.argv.slice(2));
  console.log(`[audit:tourapi-course-images] target=${target} download=${download}`);

  // Fail fast if key missing (tourFetch/loadTourApiKey throws)
  try {
    await tourFetch("areaCode2", { numOfRows: "1" });
    console.log("[audit:tourapi-course-images] TOUR_API_KEY OK (value hidden)");
  } catch (e) {
    console.error(
      "[audit:tourapi-course-images] TourAPI unavailable:",
      e instanceof Error ? e.message : e,
    );
    process.exit(1);
  }

  const filtered = TARGETS.filter(
    (t) =>
      target === "all" ||
      (target === "pocheon" && t.blogSlug.includes("pocheon")) ||
      (target === "yongin" && t.blogSlug.includes("yongin")) ||
      (target === "hwaseong" && t.blogSlug.includes("hwaseong")),
  );

  const golfMap = await loadGolfCourses(filtered.map((t) => t.courseId));
  const rows: AuditRow[] = [];
  const manifestItems: Array<Record<string, unknown>> = [];

  for (const course of filtered) {
    console.log(`\n→ ${course.courseName} (${course.courseId})`);
    const golf = golfMap.get(course.courseId) ?? {
      name: course.courseName,
      address: null,
      lat: null,
      lng: null,
      phone: null,
      homepage: null,
    };

    const candidates: CommonItem[] = [];
    const seenIds = new Set<string>();

    for (const cid of course.candidateContentIds) {
      await sleep(200);
      const item = await detailCommon(cid);
      if (item?.contentid && !seenIds.has(item.contentid)) {
        seenIds.add(item.contentid);
        candidates.push(item);
      }
    }

    for (const kw of course.searchKeywords) {
      await sleep(250);
      // 1차: 경기(31), 2차: 전국
      for (const areaCode of ["31", undefined] as Array<string | undefined>) {
        const found = await searchKeyword(kw, areaCode);
        for (const item of found) {
          const id = item.contentid;
          if (!id || seenIds.has(id)) continue;
          if (String(item.contenttypeid ?? "") !== "28") continue;
          seenIds.add(id);
          await sleep(150);
          const detailed = (await detailCommon(id)) ?? item;
          // list 응답의 cpyrhtDivCd 보존
          if (!detailed.cpyrhtDivCd && item.cpyrhtDivCd) {
            detailed.cpyrhtDivCd = item.cpyrhtDivCd;
          }
          if (!detailed.firstimage && item.firstimage) {
            detailed.firstimage = item.firstimage;
            detailed.firstimage2 = item.firstimage2;
          }
          candidates.push(detailed);
        }
        if (found.length > 0) break;
      }
    }

    let best: { item: CommonItem; score: number; reasons: string[] } | null =
      null;
    for (const item of candidates) {
      const scored = scoreMatch(course, item, golf);
      if (!best || scored.score > best.score) {
        best = { item, score: scored.score, reasons: scored.reasons };
      }
    }

    const baseRow: AuditRow = {
      blogSlug: course.blogSlug,
      courseId: course.courseId,
      courseName: course.courseName,
      candidateContentId: course.candidateContentIds[0] ?? null,
      resolvedContentId: best?.item.contentid ?? null,
      contentTypeId: best?.item.contenttypeid ?? null,
      tourApiTitle: best?.item.title ?? null,
      tourApiAddress: best
        ? `${best.item.addr1 ?? ""} ${best.item.addr2 ?? ""}`.trim()
        : null,
      tourApiMapX: best?.item.mapx ?? null,
      tourApiMapY: best?.item.mapy ?? null,
      golfMapAddress: golf.address,
      golfMapLat: golf.lat,
      golfMapLng: golf.lng,
      matchScore: best?.score ?? 0,
      matchStatus: "no_match",
      matchReasons: best?.reasons ?? ["후보 없음"],
      imageCount: 0,
      selectedImage: null,
      copyrightCodeRaw: null,
      licenseLabel: null,
      sourcePage: null,
      notes: "",
    };

    if (!best || best.score < 80) {
      baseRow.matchStatus = best && best.score > 0 ? "manual_review" : "no_match";
      baseRow.notes =
        best && best.score < 80
          ? `점수 ${best.score} < 80 — 사진 미사용`
          : "매칭 실패";
      rows.push(baseRow);
      continue;
    }

    // 리베라 후보 131392 등은 제목·주소 완전 일치 추가 확인
    if (
      course.courseId === "gc-4731f8c98a6d" &&
      !(
        (best.item.title ?? "").includes("리베라") &&
        (baseRow.tourApiAddress ?? "").includes("화성")
      )
    ) {
      baseRow.matchStatus = "manual_review";
      baseRow.notes = "리베라 낮은 신뢰도 후보 — 제목/주소 불완전 일치";
      rows.push(baseRow);
      continue;
    }

    const contentId = best.item.contentid!;
    baseRow.resolvedContentId = contentId;
    baseRow.sourcePage = `https://data.visitkorea.or.kr/linkedview/${contentId}`;
    await sleep(250);
    const images = await detailImages(contentId);
    const contentCopyright = best.item.cpyrhtDivCd?.trim() || null;
    const urlPool: Array<{
      url: string;
      code?: string;
      name?: string;
      serialnum?: string;
    }> = [];
    const pushUrl = (
      url?: string,
      code?: string,
      name?: string,
      serialnum?: string,
    ) => {
      if (!url) return;
      const existing = urlPool.find((u) => u.url === url);
      if (existing) {
        if (!existing.code && code) existing.code = code;
        if (!existing.name && name) existing.name = name;
        if (!existing.serialnum && serialnum) existing.serialnum = serialnum;
        return;
      }
      urlPool.push({ url, code, name, serialnum });
    };
    // 대표 이미지: detailCommon/list의 cpyrhtDivCd가 공식 저작권
    pushUrl(best.item.firstimage, contentCopyright ?? undefined);
    pushUrl(best.item.firstimage2, contentCopyright ?? undefined);
    for (const img of images) {
      pushUrl(
        img.originimgurl ?? img.smallimageurl,
        img.cpyrhtDivCd?.trim() || contentCopyright || undefined,
        img.imgname,
        img.serialnum,
      );
    }

    baseRow.imageCount = urlPool.length;
    if (urlPool.length === 0) {
      baseRow.matchStatus = "no_images";
      baseRow.notes = "detailImage/firstimage 없음";
      rows.push(baseRow);
      continue;
    }

    type CandidateImg = {
      url: string;
      code: string | null;
      license: string;
      buf: Buffer;
      md5: string;
      width?: number;
      height?: number;
      contentType: string;
      name?: string;
      serialnum?: string;
      scenicScore: number;
    };
    const usable: CandidateImg[] = [];
    const seenMd5 = new Set<string>();
    const seenSerial = new Set<string>();
    for (const entry of urlPool) {
      await sleep(100);
      const probed = await probeImage(entry.url);
      if (!probed.ok || !probed.buf) continue;
      const code = entry.code?.trim() || null;
      const license = licenseFromCode(code);
      if (!license) {
        continue;
      }
      const md5 = crypto.createHash("md5").update(probed.buf).digest("hex");
      if (seenMd5.has(md5)) continue;
      if (entry.serialnum && seenSerial.has(entry.serialnum)) continue;
      seenMd5.add(md5);
      if (entry.serialnum) seenSerial.add(entry.serialnum);

      const nameLower = (entry.name ?? "").toLowerCase();
      let scenicScore = 0;
      if (/전경|그린|페어웨이|클럽하우스|코스|홀|티잉/.test(entry.name ?? "")) {
        scenicScore += 30;
      }
      if (/로고|logo|ci\b|텍스트|간판|지도/.test(nameLower)) {
        scenicScore -= 40;
      }

      usable.push({
        url: entry.url,
        code,
        license,
        buf: probed.buf,
        md5,
        width: probed.width,
        height: probed.height,
        contentType: probed.contentType ?? "image/jpeg",
        name: entry.name,
        serialnum: entry.serialnum,
        scenicScore,
      });
    }

    // Prefer scenic + landscape + width>=800
    usable.sort((a, b) => {
      if (b.scenicScore !== a.scenicScore) return b.scenicScore - a.scenicScore;
      const aLand = (a.width ?? 0) >= (a.height ?? 0) ? 1 : 0;
      const bLand = (b.width ?? 0) >= (b.height ?? 0) ? 1 : 0;
      if (bLand !== aLand) return bLand - aLand;
      const aWide = (a.width ?? 0) >= 800 ? 1 : 0;
      const bWide = (b.width ?? 0) >= 800 ? 1 : 0;
      if (bWide !== aWide) return bWide - aWide;
      return (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0);
    });

    const chosenList = usable.slice(0, 3);
    if (chosenList.length === 0) {
      baseRow.matchStatus = "no_images";
      baseRow.notes = "라이선스 확인 가능 이미지 없음(cpyrhtDivCd 비어 있음 포함)";
      rows.push(baseRow);
      continue;
    }

    const primary = chosenList[0];
    baseRow.matchStatus = "accepted";
    baseRow.selectedImage = primary.url;
    baseRow.copyrightCodeRaw = primary.code;
    baseRow.licenseLabel = primary.license;
    baseRow.matchScore = best.score;
    baseRow.matchReasons = best.reasons;
    baseRow.width = primary.width;
    baseRow.height = primary.height;
    baseRow.originalUrl = primary.url;
    baseRow.md5 = primary.md5;
    baseRow.notes = `사진 ${chosenList.length}장 선택`;

    const credit =
      primary.license === "공공누리 제3유형"
        ? "사진: 한국관광공사 TourAPI · 공공누리 제3유형(변경금지)"
        : "사진: 한국관광공사 TourAPI · 공공누리 제1유형";

    const savedPaths: string[] = [];
    for (let i = 0; i < chosenList.length; i += 1) {
      const chosen = chosenList[i];
      const ext = extFromContentType(chosen.contentType, chosen.url);
      const indexLabel = String(i + 1).padStart(2, "0");
      const relPath = `/promo-assets/blog/tourapi-courses/${course.courseId}/${contentId}-${indexLabel}.${ext}`;
      const absPath = path.join(ROOT, "public", relPath.replace(/^\//, ""));
      if (i === 0) baseRow.localPath = relPath;

      if (download) {
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        let shouldWrite = true;
        if (fs.existsSync(absPath)) {
          const existing = fs.readFileSync(absPath);
          const existingMd5 = crypto
            .createHash("md5")
            .update(existing)
            .digest("hex");
          if (existingMd5 === chosen.md5) {
            shouldWrite = false;
            console.log(`  keep ${relPath} (md5 match)`);
          }
        }
        if (shouldWrite) {
          fs.writeFileSync(absPath, chosen.buf);
          console.log(`  saved ${relPath} (${chosen.license})`);
        }
      }

      savedPaths.push(relPath);
      const title =
        chosen.name?.trim() ||
        `${course.courseName} 사진 - 한국관광공사 TourAPI`;
      manifestItems.push({
        courseId: course.courseId,
        blogSlug: course.blogSlug,
        courseName: course.courseName,
        contentId,
        path: relPath,
        originalUrl: chosen.url,
        md5: chosen.md5,
        width: chosen.width ?? null,
        height: chosen.height ?? null,
        copyrightCodeRaw: chosen.code,
        licenseLabel: chosen.license,
        sourcePage: baseRow.sourcePage,
        imageTitle: chosen.name?.trim() || undefined,
        serialnum: chosen.serialnum || undefined,
        alt: title,
        credit,
      });
    }

    rows.push(baseRow);
  }

  const summaryByBlog: Record<
    string,
    {
      total: number;
      accepted: number;
      no_match: number;
      manual_review: number;
      no_images: number;
      photos: number;
    }
  > = {};
  for (const row of rows) {
    const s = (summaryByBlog[row.blogSlug] ??= {
      total: 0,
      accepted: 0,
      no_match: 0,
      manual_review: 0,
      no_images: 0,
      photos: 0,
    });
    s.total += 1;
    s[row.matchStatus] += 1;
    if (row.matchStatus === "accepted") {
      const m = row.notes.match(/사진 (\d+)장/);
      s.photos += m ? Number(m[1]) : 1;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    envVarName: "TOUR_API_KEY",
    download,
    target,
    courseCount: rows.length,
    summaryByBlog,
    rows,
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);

  const md: string[] = [
    `# TourAPI 코스 이미지 감사 (${DATE})`,
    "",
    `- 환경변수: \`TOUR_API_KEY\` (값 미기재)`,
    `- 조사 코스: ${rows.length}`,
    `- download: ${download}`,
    "",
    "## 글별 집계",
    "",
  ];
  for (const [slug, s] of Object.entries(summaryByBlog)) {
    md.push(
      `- **${slug}**: total=${s.total}, accepted=${s.accepted}, no_match=${s.no_match}, manual_review=${s.manual_review}, no_images=${s.no_images}, photos=${s.photos}`,
    );
  }
  md.push("", "## 코스별", "");
  for (const row of rows) {
    md.push(
      `### ${row.courseName} (\`${row.courseId}\`)`,
      `- status: **${row.matchStatus}** (score ${row.matchScore})`,
      `- contentId: ${row.resolvedContentId ?? "-"}`,
      `- title: ${row.tourApiTitle ?? "-"}`,
      `- address: ${row.tourApiAddress ?? "-"}`,
      `- license: ${row.licenseLabel ?? "-"} (${row.copyrightCodeRaw ?? "-"})`,
      `- image: ${row.localPath ?? row.selectedImage ?? "-"}`,
      `- notes: ${row.notes || row.matchReasons.join("; ")}`,
      "",
    );
  }
  fs.writeFileSync(REPORT_MD, `${md.join("\n")}\n`);

  if (download) {
    const manifest = {
      version: 1,
      updatedAt: new Date().toISOString(),
      source: "TourAPI KorService2",
      items: manifestItems,
    };
    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`\n[audit:tourapi-course-images] manifest → ${MANIFEST_PATH}`);
  }

  console.log(`\n[audit:tourapi-course-images] report → ${REPORT_JSON}`);
  console.log(`[audit:tourapi-course-images] report → ${REPORT_MD}`);
  const accepted = rows.filter((r) => r.matchStatus === "accepted").length;
  console.log(`[audit:tourapi-course-images] accepted=${accepted}/${rows.length}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
