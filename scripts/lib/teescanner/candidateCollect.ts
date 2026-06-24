import type { Locator, Page } from "playwright";
import { parseCandidateFields } from "./candidateParse";
import type { TeescannerSearchCandidate } from "./types";
import { TEESCANNER_BASE } from "./access";

const RECOMMENDATION_NOISE =
  /MD\s*추천|메가딜|쿠폰\s*증정|^\d+\s*팀$|가까운\s*골프장|국내\/해외\s*투어|달력|새벽|오전|오후|야간|최근\s*검색|조건으로\s*검색/i;

const REGION_LINE =
  /(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\n|>]*>\s*[^\s\d.]+/;

const OVERLAY_SCOPES = [
  '[class*="keyword"]',
  '[class*="Keyword"]',
  '[class*="overlay"]',
  '[class*="modal"]',
  '[class*="suggest"]',
  '[class*="Suggest"]',
  '[role="listbox"]',
  '[class*="search-result"]',
  '[class*="SearchResult"]',
] as const;

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isNoiseLine(line: string): boolean {
  return RECOMMENDATION_NOISE.test(line) || /^평점\s*[\d.]+$/i.test(line);
}

async function readRowText(titleLocator: Locator): Promise<string> {
  const titleText = normalizeLine(await titleLocator.innerText());
  const rowSelectors = [
    "xpath=ancestor::li[1]",
    "xpath=ancestor::*[@role='option'][1]",
    "xpath=ancestor::*[@role='listitem'][1]",
    "xpath=ancestor::div[1]",
  ];

  for (const selector of rowSelectors) {
    const row = titleLocator.locator(selector);
    try {
      if ((await row.count()) > 0 && (await row.isVisible())) {
        const raw = normalizeLine(await row.innerText());
        if (raw.length >= titleText.length) return raw;
      }
    } catch {
      /* try next ancestor */
    }
  }

  return titleText;
}

async function readRowUrl(rowLocator: Locator): Promise<string> {
  try {
    const link = rowLocator.locator("a").first();
    if ((await link.count()) === 0) return "";
    const href = await link.getAttribute("href");
    if (!href) return "";
    return href.startsWith("http") ? href : `${TEESCANNER_BASE}${href}`;
  } catch {
    return "";
  }
}

async function readScopedOverlayText(page: Page, query: string): Promise<string> {
  for (const selector of OVERLAY_SCOPES) {
    const scope = page.locator(selector);
    const count = await scope.count();
    for (let index = 0; index < Math.min(count, 4); index += 1) {
      const item = scope.nth(index);
      try {
        if (!(await item.isVisible())) continue;
        const text = await item.innerText();
        if (text.includes(query)) return text;
      } catch {
        /* try next scope */
      }
    }
  }
  return "";
}

function pushCandidate(
  candidates: TeescannerSearchCandidate[],
  seen: Set<string>,
  rawLines: string[],
  candidate: TeescannerSearchCandidate,
  rawText: string,
): void {
  const title = normalizeLine(candidate.title);
  if (!title || title.length < 2 || isNoiseLine(title)) return;
  const key = title.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  rawLines.push(rawText.slice(0, 160));
  candidates.push({
    ...candidate,
    title,
    region: candidate.region.trim(),
    candidateIndex: candidates.length,
    rawText: rawText.slice(0, 300),
  });
}

export async function collectSearchCandidatesWithLocators(
  page: Page,
  query: string,
): Promise<{ candidates: TeescannerSearchCandidate[]; rawTextSample: string }> {
  const candidates: TeescannerSearchCandidate[] = [];
  const seen = new Set<string>();
  const rawLines: string[] = [];
  const normalizedQuery = query.trim();

  const titleMatches = page.getByText(normalizedQuery, { exact: false });
  const matchCount = await titleMatches.count();

  for (let index = 0; index < Math.min(matchCount, 10); index += 1) {
    const titleLocator = titleMatches.nth(index);
    try {
      if (!(await titleLocator.isVisible())) continue;

      const rawText = await readRowText(titleLocator);
      if (!rawText.toLowerCase().includes(normalizedQuery.toLowerCase())) {
        continue;
      }
      if (RECOMMENDATION_NOISE.test(rawText)) continue;

      const parsed = parseCandidateFields(normalizedQuery, rawText);
      const row = titleLocator.locator("xpath=ancestor::li[1]").first();
      const url = await readRowUrl(row);

      pushCandidate(
        candidates,
        seen,
        rawLines,
        {
          title: parsed.title,
          region: parsed.region,
          url,
          candidateIndex: 0,
          rawText: parsed.rawText,
          rating: parsed.rating,
        },
        rawText,
      );
      if (candidates.length >= 8) break;
    } catch {
      /* try next match */
    }
  }

  if (candidates.length === 0) {
    const scopedText = await readScopedOverlayText(page, normalizedQuery);
    const bodyText = scopedText || (await page.locator("body").innerText());
    if (bodyText.includes(normalizedQuery)) {
      const lines = bodyText
        .split(/\n+/)
        .map((line) => normalizeLine(line))
        .filter((line) => line && !isNoiseLine(line));

      const relevant = lines.filter(
        (line) =>
          line.includes(normalizedQuery) ||
          REGION_LINE.test(line) ||
          /^평점\s*[\d.]+$/i.test(line),
      );

      const parsed = parseCandidateFields(
        normalizedQuery,
        relevant.join("\n") || bodyText,
      );

      pushCandidate(
        candidates,
        seen,
        rawLines,
        {
          title: parsed.title,
          region: parsed.region,
          url: "",
          candidateIndex: 0,
          rawText: parsed.rawText,
          rating: parsed.rating,
        },
        relevant.join(" | ") || bodyText.slice(0, 300),
      );
    }
  }

  return {
    candidates: candidates.slice(0, 8),
    rawTextSample: rawLines.slice(0, 15).join(" | "),
  };
}
