import { NAVER_MAP_BASE } from "./lib/naverMapEnrichment/selectors";

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
  headless: boolean;
  keepOpen: boolean;
  waitMs: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
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
    } else if (arg === "--wait") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--wait requires a non-negative integer (ms).");
      }
      options.waitMs = value;
      i += 1;
    }
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

  const searchFrame = page
    .frames()
    .find((frame) => /searchIframe|map\.naver\.com.*search/i.test(frame.url() || frame.name()));

  if (searchFrame) {
    parts.push(await searchFrame.locator("body").innerText().catch(() => ""));
  }

  return parts.join("\n");
}

async function isMapUiReady(page: import("playwright").Page): Promise<{
  ok: boolean;
  reason: string;
}> {
  const searchFrame = page
    .frames()
    .find((frame) => /searchIframe|map\.naver\.com.*search/i.test(frame.url() || frame.name()));

  if (searchFrame) {
    const searchInput = searchFrame.locator(
      'input[type="text"], input[type="search"], [role="combobox"], [placeholder*="검색"]',
    );
    if (await searchInput.first().isVisible().catch(() => false)) {
      return { ok: true, reason: "search_input_visible" };
    }
  }

  const mapHints = [
    page.locator("#map, [class*='map'], canvas").first(),
    page.locator('iframe#searchIframe, iframe[name="searchIframe"]').first(),
  ];
  for (const locator of mapHints) {
    if (await locator.isVisible().catch(() => false)) {
      return { ok: true, reason: "map_loaded" };
    }
  }

  return { ok: false, reason: "map_ui_not_detected" };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const url = NAVER_MAP_BASE;

  console.log("Naver Map access check");
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
      console.log("recommendation: wait 30-60 minutes before retrying");
      if (options.keepOpen) {
        console.log("browser kept open (--keep-open). Press Ctrl+C to exit.");
        await sleep(Number.MAX_SAFE_INTEGER);
      }
      process.exitCode = 1;
      return;
    }

    const ui = await isMapUiReady(page);
    console.log(`blocked: false`);
    console.log(`reason: ${ui.reason}`);
    if (!ui.ok) {
      console.log(
        "note: block text not found but map UI was not clearly detected — verify manually if unsure",
      );
    } else {
      console.log("recommendation: light access check passed; start with single-row headful collect test");
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
