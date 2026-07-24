import assert from "assert";
import {
  buildMapQuickFilterHref,
  buildMapSearchHref,
  parseMapUrlState,
  serializeMapUrlState,
} from "../lib/mapUrlState";
import { EMPTY_FILTERS } from "../types/course";

function main(): void {
  assert.strictEqual(
    buildMapSearchHref(" 서울 "),
    `/map?q=${encodeURIComponent("서울")}`,
  );
  assert.ok(buildMapQuickFilterHref("budget").includes("price="));
  assert.ok(buildMapQuickFilterHref("nine-hole").includes("holes="));

  const parsed = parseMapUrlState({
    q: "포천",
    holes: "9홀",
    price: "10만원 이하",
    view: "list",
  });
  assert.strictEqual(parsed.filters.query, "포천");
  assert.deepStrictEqual(parsed.filters.holeCounts, ["9홀"]);
  assert.deepStrictEqual(parsed.filters.priceRanges, ["10만원 이하"]);
  assert.strictEqual(parsed.view, "list");

  const qs = serializeMapUrlState({
    filters: {
      ...EMPTY_FILTERS,
      query: "포천",
      holeCounts: ["9홀"],
    },
    view: "list",
  });
  assert.ok(qs.includes("q=%ED%8F%AC%EC%B2%9C") || qs.includes("q=포천"));
  assert.ok(qs.includes("holes="));
  assert.ok(qs.includes("view=list"));

  console.log("[verify:mobile-map-url] PASS");
}

main();
