import fs from "fs";
import path from "path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { getProjectRoot } from "./lib/sourceRegistry";
import { resolveTitleFontPath } from "./lib/golfMapTitleOgRender";

function main(): void {
  const root = getProjectRoot();
  const fontPath = resolveTitleFontPath();
  GlobalFonts.registerFromPath(fontPath, "Malgun Gothic");

  const canvas = createCanvas(800, 240);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#B9E6FF";
  ctx.fillRect(0, 0, 800, 240);
  ctx.font = 'bold 72px "Malgun Gothic"';
  ctx.fillStyle = "#024136";
  ctx.textBaseline = "top";
  ctx.fillText("서울 근교", 20, 40);
  ctx.fillText("초보자 골프장", 20, 130);

  const out = path.join(root, "public/seo-images/collections/_canvas-title-debug.png");
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log("wrote", out);
}

main();
