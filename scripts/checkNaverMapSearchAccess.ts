import { TEXT_PATTERNS } from "./lib/naverMapEnrichment/selectors";
import {
  collectVisibleNaverText,
  detectNaverBlock,
  sleep,
} from "./lib/naverMapEnrichment/ultraSafeAccess";
import { getNaverMapSearchUrl } from "./lib/naverPriceCandidates";

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

    const combinedText = await collectVisibleNaverText(page);
    const block = detectNaverBlock(combinedText);

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
      process.exitCode = 2;
      return;
    }

    const hasAddressSection =
      TEXT_PATTERNS.addressPlacesSection.test(combinedText) ||
      (await page
        .getByText(TEXT_PATTERNS.addressPlacesSection)
        .first()
        .isVisible()
        .catch(() => false));

    const candidates = parseAddressPlaceTitles(combinedText);
    const golfCandidates = candidates.filter((line) => /골프|cc|클럽/i.test(line));

    if (hasAddressSection) {
      console.log("blocked: false");
      console.log("reason: search_result_loaded");
      console.log("search_result_loaded: true");
      console.log("addressPlacesSection: true");
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
