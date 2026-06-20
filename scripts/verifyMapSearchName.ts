import { normalizeCourseNameForMapSearch } from "../lib/mapSearchName";
import { getNaverSearchUrl } from "../lib/externalSearchLinks";
import { buildExternalSearchQuery } from "../lib/externalMapLinks";

const CASES: Array<{ input: string; expected: string }> = [
  { input: "가야컨트리클럽(대중제)", expected: "가야컨트리클럽" },
  { input: "가야컨트리클럽 (회원제)", expected: "가야컨트리클럽" },
  { input: "뉴스프링빌골프장(대중형)", expected: "뉴스프링빌골프장" },
  { input: "푸른솔 골프클럽 포천", expected: "푸른솔 골프클럽 포천" },
  { input: "오펠골프클럽", expected: "오펠골프클럽" },
  { input: "오션비치골프&리조트 (대중제)", expected: "오션비치골프&리조트" },
];

function main(): void {
  console.log("=== normalizeCourseNameForMapSearch (map search query) ===\n");
  let failed = 0;

  for (const { input, expected } of CASES) {
    const searchQuery = normalizeCourseNameForMapSearch(input);
    const ok = searchQuery === expected;

    console.log(`${ok ? "ok" : "FAIL"}  "${input}"`);
    console.log(`      → "${searchQuery}"`);

    if (!ok) {
      failed += 1;
      console.log(`      expected: "${expected}"`);
    }
    console.log("");
  }

  if (failed > 0) {
    console.error(`${failed} case(s) failed`);
    process.exitCode = 1;
    return;
  }

  console.log("All normalize cases passed.\n");
  console.log("=== getNaverSearchUrl (sample) ===\n");

  const sample = { name: "가야컨트리클럽(대중제)", address: "경남 김해시" } as const;
  const url = getNaverSearchUrl(sample as import("../types/course").Course);
  const expectedQuery = "가야컨트리클럽";
  const ok =
    url ===
    `https://search.naver.com/search.naver?query=${encodeURIComponent(expectedQuery)}`;
  console.log(`${ok ? "ok" : "FAIL"}  ${url}`);
  console.log(`      query: "${buildExternalSearchQuery(sample as import("../types/course").Course)}"`);

  if (!ok) {
    process.exitCode = 1;
    return;
  }

  console.log("\nAll cases passed.");
}

main();
