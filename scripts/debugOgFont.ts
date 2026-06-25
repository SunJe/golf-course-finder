import fs from "fs";
import path from "path";
import { Resvg } from "@resvg/resvg-js";
import { buildResvgFontOptions, buildOgFontFaceCss } from "../lib/seo-images/ogFontConfig";
import { KR_FONT_FAMILY } from "../lib/seo-images/ogFontConfig";
import { getProjectRoot } from "./lib/sourceRegistry";

async function main(): Promise<void> {
  const root = getProjectRoot();
  const fontCss = buildOgFontFaceCss(root);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
  <defs><style>${fontCss}</style></defs>
  <rect width="800" height="300" fill="#B9E6FF"/>
  <text font-family="${KR_FONT_FAMILY}" x="40" y="120" font-size="96" font-weight="800" fill="#053F35">나인홀 골프장</text>
  <text font-family="${KR_FONT_FAMILY}" x="40" y="220" font-size="28" font-weight="700" fill="#053F35">위치 연락처 홈페이지</text>
</svg>`;
  const out = path.join(root, "public/seo-images/collections/_font-debug.png");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 800 },
    background: "rgba(0,0,0,0)",
    font: buildResvgFontOptions(root),
  });
  await fs.promises.writeFile(out, resvg.render().asPng());
  console.log("wrote", out);
  console.log("font css present:", fontCss.length > 0);
}

main();
