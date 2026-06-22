import { NAVER_MAP_BASE } from "./selectors";
import { TEXT_PATTERNS } from "./selectors";
import { getNaverMapSearchUrl } from "../naverPriceCandidates";

export interface NaverBlockDetection {
  blocked: true;
  reason: string;
  matchedText: string;
}

export type NaverAccessStatus = "ok" | "blocked" | "error";

export interface NaverAccessCheckResult {
  status: NaverAccessStatus;
  reason: string;
  matchedText?: string;
  searchOk?: boolean;
  message?: string;
}

/** 차단/보안 문구 — 감지 시 즉시 중단 */
export const NAVER_BLOCK_PHRASES: Array<{
  pattern: RegExp;
  reason: string;
  label: string;
}> = [
  { pattern: /과도한\s*접근/i, reason: "excessive_access", label: "과도한 접근" },
  {
    pattern: /비정상(?:적인)?\s*접근/i,
    reason: "abnormal_access",
    label: "비정상적인 접근",
  },
  {
    pattern: /자동화된\s*접근/i,
    reason: "automated_access",
    label: "자동화된 접근",
  },
  {
    pattern: TEXT_PATTERNS.captcha,
    reason: "captcha",
    label: "CAPTCHA/보안문자",
  },
  { pattern: /보안\s*확인/i, reason: "security_check", label: "보안 확인" },
  { pattern: /로봇/i, reason: "robot_check", label: "로봇" },
  {
    pattern: /접근\s*(?:이\s*)?제한|접근이\s*제한/i,
    reason: "access_restricted",
    label: "접근 제한",
  },
  {
    pattern: /이용이\s*제한|이용\s*제한/i,
    reason: "usage_restricted",
    label: "이용이 제한",
  },
  {
    pattern: TEXT_PATTERNS.accessBlocked,
    reason: "service_restricted",
    label: "서비스 이용 제한",
  },
  {
    pattern: /일시적으로\s*(?:이용|제한|접근)/i,
    reason: "temporarily_unavailable",
    label: "일시적으로 이용할 수 없음",
  },
  {
    pattern: /잠시\s*후\s*다시/i,
    reason: "retry_later",
    label: "잠시 후 다시 시도",
  },
  {
    pattern: /서비스\s*이용이\s*원활하지\s*않/i,
    reason: "service_unstable",
    label: "서비스 이용이 원활하지 않습니다",
  },
  {
    pattern: TEXT_PATTERNS.excessiveAccess,
    reason: "rate_limited",
    label: "요청 횟수/과도한 접근",
  },
];

export function detectNaverBlock(text: string): NaverBlockDetection | null {
  for (const phrase of NAVER_BLOCK_PHRASES) {
    const match = text.match(phrase.pattern);
    if (match) {
      return {
        blocked: true,
        reason: phrase.reason,
        matchedText: match[0] || phrase.label,
      };
    }
  }
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function collectVisibleNaverText(
  page: import("playwright").Page,
): Promise<string> {
  const parts: string[] = [];
  parts.push(await page.locator("body").innerText().catch(() => ""));

  for (const frame of page.frames()) {
    const url = frame.url() || "";
    const name = frame.name() || "";
    if (
      /searchIframe|entryIframe|pcmap\.place\.naver\.com|map\.naver\.com/i.test(
        `${url} ${name}`,
      )
    ) {
      parts.push(await frame.locator("body").innerText().catch(() => ""));
    }
  }

  return parts.join("\n");
}

async function isMapUiReady(page: import("playwright").Page): Promise<boolean> {
  const searchFrame = page
    .frames()
    .find((frame) =>
      /searchIframe|map\.naver\.com.*search/i.test(
        `${frame.url() || ""} ${frame.name() || ""}`,
      ),
    );

  if (searchFrame) {
    const searchInput = searchFrame.locator(
      'input[type="text"], input[type="search"], [role="combobox"], [placeholder*="검색"]',
    );
    if (await searchInput.first().isVisible().catch(() => false)) {
      return true;
    }
  }

  const mapHints = [
    page.locator("#map, [class*='map'], canvas").first(),
    page.locator('iframe#searchIframe, iframe[name="searchIframe"]').first(),
  ];
  for (const locator of mapHints) {
    if (await locator.isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

export interface RunNaverAccessCheckOptions {
  headless: boolean;
  waitMs: number;
  /** 설정 시 지도 검색 1회 추가 확인 */
  testSearchQuery?: string;
}

/**
 * 네이버 지도 접근 가능 여부 확인 (retry 없음, 단일 세션).
 * blocked → status blocked, 네트워크/예외 → error, 정상 → ok
 */
export async function runNaverMapAccessCheck(
  options: RunNaverAccessCheckOptions,
): Promise<NaverAccessCheckResult> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: options.headless });
  const context = await browser.newContext({
    locale: "ko-KR",
    viewport: { width: 1400, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    await page.goto(NAVER_MAP_BASE, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await sleep(options.waitMs);

    let combinedText = await collectVisibleNaverText(page);
    let block = detectNaverBlock(combinedText);
    if (block) {
      return {
        status: "blocked",
        reason: block.reason,
        matchedText: block.matchedText,
        message: "Naver map main page blocked",
      };
    }

    const mapReady = await isMapUiReady(page);
    if (!mapReady) {
      return {
        status: "error",
        reason: "map_ui_not_detected",
        message: "Block text not found but map UI was not clearly detected",
      };
    }

    if (options.testSearchQuery?.trim()) {
      const searchUrl = getNaverMapSearchUrl(options.testSearchQuery.trim());
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      await sleep(options.waitMs);
      combinedText = await collectVisibleNaverText(page);
      block = detectNaverBlock(combinedText);
      if (block) {
        return {
          status: "blocked",
          reason: block.reason,
          matchedText: block.matchedText,
          message: "Naver map search page blocked",
          searchOk: false,
        };
      }
      const searchLoaded =
        TEXT_PATTERNS.addressPlacesSection.test(combinedText) ||
        combinedText.length > 200;
      return {
        status: "ok",
        reason: searchLoaded ? "search_result_loaded" : "search_page_loaded",
        searchOk: searchLoaded,
        message: "Naver map access OK",
      };
    }

    return {
      status: "ok",
      reason: "map_loaded",
      message: "Naver map access OK",
    };
  } catch (error) {
    return {
      status: "error",
      reason: "network_or_timeout",
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}
