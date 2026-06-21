import { getNaverMapSearchUrl } from "./lib/naverPriceCandidates";
import { TEXT_PATTERNS } from "./lib/naverMapEnrichment/selectors";

const BLOCK_PHRASES: Array<{ pattern: RegExp; reason: string; label: string }> = [
  {
    pattern: /과도한\s*접근/i,
    reason: "excessive_access_detected",
    label: "과도한 접근",
  },
  {
    pattern: /서비스\s*이용\s*제한/i,
    reason: "service_restricted",
    label: "서비스 이용 제한",
  },
  {
    pattern: /이용이\s*제한/i,
    reason: "access_limited",
    label: "이용이 제한",
  },
  {
    pattern: /비정상(?:적인)?\s*접근/i,
    reason: "abnormal_access_detected",
    label: "비정상 접근",
  },
  {
    pattern: /자동화된\s*접근/i,
    reason: "automated_access_detected",
    label: "자동화된 접근",
  },
  {
    pattern: /일시적으로\s*제한/i,
    reason: "temporarily_restricted",
    label: "일시적으로 제한",
  },
  {
    pattern: /captcha|자동\s*입력\s*방지|보안문자|로봇이\s*아닙니다|로봇\s*확인/i,
    reason: "captcha_detected",
    label: "CAPTCHA/보안문자",
  },
];

interface CliOptions {
  query: string;
  headless: boolean;
  keepOpen: boolean;
  waitMs: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    query: "",
    headless: false,
    keepOpen: false,
    waitMs: 7000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--headless") {
      options.headless = true;
    } else if (arg === "--keep-open") {
      options.keepOpen = true;
    } else if (arg === "--query") {
      options.query = (argv[i + 1] ?? "").trim();
      if (!options.query) {
        throw new Error("--query requires a non-empty search string.");
      }
      i += 1;
    } else if (arg === "--wait") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--wait requires a non-negative integer (ms).");
      }
      options.waitMs = value;
      i += 1;
    }
  }

  if (!options.query) {
    throw new Error("--query is required.");
  }

  return options;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectBlock(text: string): { blocked: true; reason: string; matchedText: string } | null {
  for (const phrase of BLOCK_PHRASES) {
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

async function collectVisibleText(page: import("playwright").Page): Promise<string> {
  const parts: string[] = [];
  parts.push(await page.locator("body").innerText().catch(() => ""));

  for (const frame of page.frames()) {
    if (/searchIframe|entryIframe|pcmap\.place\.naver\.com/i.test(frame.url() || frame.name())) {
      parts.push(await frame.locator("body").innerText().catch(() => ""));
    }
  }

  return parts.join("\n");
}

function parseAddressPlaceTitles(text: string): string[] {
  const startMatch = text.match(/이\s*주소의\s*장소\s*\d*/);
  if (!startMatch || startMatch.index === undefined) return [];

  const start = startMatch.index;
  const endMarkers = ["가볼만한 곳", "정보수정 제안", "패널 접기"];
  let end = text.length;
  for (const marker of endMarkers) {
    const idx = text.indexOf(marker, start);
    if (idx >= 0) end = Math.min(end, idx);
  }

  const section = text.slice(start, end);
  return section
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== "더보기" && !/^이\s*주소의\s*장소/.test(line))
    .slice(0, 8);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const url = getNaverMapSearchUrl(options.query);

  console.log("Naver Map search access check");
  console.log(`query: ${options.query}`);
  console.log(`URL: ${url}`);
  console.log(`mode: ${options.headless ? "headless" : "headful"}, wait: ${options.waitMs}ms`);

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
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await sleep(options.waitMs);

    const combinedText = await collectVisibleText(page);
    const block = detectBlock(combinedText);

    if (block) {
      console.log("blocked: true");
      console.log(`reason: ${block.reason}`);
      console.log(`matchedText: ${block.matchedText}`);
      console.log("search_result_loaded: false");
      console.log("recommendation: wait 30-60 minutes before retrying; do not run collect");
      if (options.keepOpen) {
        console.log("browser kept open (--keep-open). Press Ctrl+C to exit.");
        await sleep(Number.MAX_SAFE_INTEGER);
      }
      process.exitCode = 1;
      return;
    }

    const hasAddressSection =
      TEXT_PATTERNS.addressPlacesSection.test(combinedText) ||
      (await page.getByText(TEXT_PATTERNS.addressPlacesSection).first().isVisible().catch(() => false));

    const candidates = parseAddressPlaceTitles(combinedText);
    const golfCandidates = candidates.filter((line) => /골프|cc|클럽/i.test(line));

    if (hasAddressSection) {
      console.log("blocked: false");
      console.log("reason: search_result_loaded");
      console.log("search_result_loaded: true");
      console.log(`addressPlacesSection: true`);
      if (candidates.length > 0) {
        console.log(`candidates: ${candidates.join(" | ")}`);
      }
      if (golfCandidates.length > 0) {
        console.log(`golfCandidates: ${golfCandidates.join(" | ")}`);
      }
      console.log("recommendation: search access OK; single-row collect test may proceed");
    } else {
      console.log("blocked: false");
      console.log("reason: search_page_loaded");
      console.log("search_result_loaded: false");
      console.log(
        "note: no block text but '이 주소의 장소' section not detected — verify manually",
      );
    }

    if (options.keepOpen) {
      console.log("browser kept open (--keep-open). Press Ctrl+C to exit.");
      await sleep(Number.MAX_SAFE_INTEGER);
    }
  } finally {
    if (!options.keepOpen) {
      await browser.close().catch(() => undefined);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
