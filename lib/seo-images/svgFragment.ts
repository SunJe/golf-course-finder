import fs from "fs";

function prefixIds(fragment: string, prefix: string): string {
  let out = fragment.replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefix}-${id}"`);
  out = out.replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefix}-${id})`);
  return out;
}

export function loadSvgFragment(filePath: string, idPrefix: string): { defs: string; markup: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const defsMatch = raw.match(/<defs>([\s\S]*?)<\/defs>/);
  const defs = defsMatch ? prefixIds(defsMatch[1], idPrefix) : "";
  const markup = prefixIds(
    raw
      .replace(/<\?xml[\s\S]*?\?>/g, "")
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<defs>[\s\S]*?<\/defs>/, "")
      .trim(),
    idPrefix,
  );
  return { defs, markup };
}
