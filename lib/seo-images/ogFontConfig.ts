import fs from "fs";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";

export const KR_FONT_FAMILY = "'OG Sans KR', 'Malgun Gothic', 'Noto Sans KR', sans-serif";

export const EN_FONT_FAMILY = "Inter, 'Malgun Gothic', Arial, sans-serif";

const WINDOWS_FONT_CANDIDATES = [
  "C:\\Windows\\Fonts\\malgunbd.ttf",
  "C:\\Windows\\Fonts\\malgun.ttf",
  "C:\\Windows\\Fonts\\NotoSansKR-VF.ttf",
];

const UNIX_FONT_CANDIDATES = [
  "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
  "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
  "/System/Library/Fonts/AppleSDGothicNeo.ttc",
];

export function resolvePrimaryOgFontFile(projectRoot: string): string | null {
  const candidates = [
    path.join(projectRoot, "public/seo-assets/fonts/malgunbd.ttf"),
    ...WINDOWS_FONT_CANDIDATES,
    path.join(projectRoot, "node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-0-700-normal.woff2"),
  ];
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

export function buildOgFontFaceCss(projectRoot: string): string {
  const fontFile = resolvePrimaryOgFontFile(projectRoot);
  if (!fontFile) return "";
  const href = pathToFileURL(fontFile).href;
  const format = fontFile.endsWith(".woff2") ? "woff2" : "truetype";
  return `@font-face {
      font-family: 'OG Sans KR';
      src: url('${href}') format('${format}');
      font-weight: 100 900;
      font-style: normal;
    }`;
}

export function resolveOgFontFiles(projectRoot: string): string[] {
  const bundled = ["public/seo-assets/fonts/malgunbd.ttf"]
    .map((relative) => path.join(projectRoot, relative))
    .filter((file) => fs.existsSync(file));

  const notoPackageDir = path.join(projectRoot, "node_modules/@fontsource/noto-sans-kr/files");
  const notoChunks =
    bundled.length > 0 || !fs.existsSync(notoPackageDir)
      ? []
      : fs
          .readdirSync(notoPackageDir)
          .filter((name) => /noto-sans-kr-\d+-(700|800|900)-normal\.woff2$/.test(name))
          .map((name) => path.join(notoPackageDir, name));

  const platform =
    process.platform === "win32"
      ? WINDOWS_FONT_CANDIDATES
      : process.platform === "darwin"
        ? UNIX_FONT_CANDIDATES
        : UNIX_FONT_CANDIDATES;

  const system = platform.filter((file) => fs.existsSync(file));
  const primary = resolvePrimaryOgFontFile(projectRoot);
  return [...new Set([...(primary ? [primary] : []), ...bundled, ...system, ...notoChunks])];
}

export function buildResvgFontOptions(projectRoot: string) {
  const fontFiles = resolveOgFontFiles(projectRoot);
  return {
    loadSystemFonts: false,
    fontFiles,
    defaultFontFamily: "OG Sans KR",
    sansSerifFamily: "OG Sans KR",
    serifFamily: "OG Sans KR",
    cursiveFamily: "OG Sans KR",
    fantasyFamily: "OG Sans KR",
  };
}

export function logOgFontResolution(projectRoot: string): void {
  const primary = resolvePrimaryOgFontFile(projectRoot);
  const files = resolveOgFontFiles(projectRoot);
  if (!primary) {
    console.warn(
      `[seo-images] No Korean font files found on ${os.platform()}; text may fall back to system defaults.`,
    );
    return;
  }
  console.log(`[seo-images] OG primary font: ${path.basename(primary)}`);
  console.log(`[seo-images] OG font files: ${files.map((f) => path.basename(f)).join(", ")}`);
}
