import fs from "fs";
import path from "path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = path.join(process.cwd(), "public", "og-image.png");

const COLORS = {
  cream: "#F8F7EF",
  softGreen: "#EAF7EF",
  borderGreen: "#BFE8CD",
  brandGreen: "#15803D",
  brandGreenDark: "#166534",
  ink: "#10231A",
  muted: "#667085",
  white: "#FFFFFF",
  accent: "#F3E8C8",
};

const FONT = "Malgun Gothic, Apple SD Gothic Neo, Arial, Helvetica, sans-serif";

function buildOgSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.cream}"/>
      <stop offset="55%" stop-color="${COLORS.softGreen}"/>
      <stop offset="100%" stop-color="${COLORS.white}"/>
    </linearGradient>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.brandGreen}"/>
      <stop offset="100%" stop-color="${COLORS.brandGreenDark}"/>
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#10231A" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${COLORS.brandGreen}"/>

  <!-- subtle map grid -->
  <g opacity="0.08" stroke="${COLORS.brandGreenDark}" stroke-width="1">
    ${Array.from({ length: 14 }, (_, i) => {
      const x = 680 + i * 36;
      return `<line x1="${x}" y1="40" x2="${x}" y2="${HEIGHT - 40}"/>`;
    }).join("")}
    ${Array.from({ length: 12 }, (_, i) => {
      const y = 60 + i * 44;
      return `<line x1="660" y1="${y}" x2="${WIDTH - 40}" y2="${y}"/>`;
    }).join("")}
  </g>

  <!-- decorative circles -->
  <circle cx="1040" cy="120" r="90" fill="${COLORS.accent}" opacity="0.45"/>
  <circle cx="1120" cy="500" r="120" fill="${COLORS.borderGreen}" opacity="0.35"/>

  <!-- map card -->
  <g filter="url(#cardShadow)">
    <rect x="700" y="118" width="420" height="394" rx="28" fill="${COLORS.white}" stroke="${COLORS.borderGreen}" stroke-width="2"/>
    <rect x="724" y="142" width="372" height="346" rx="18" fill="${COLORS.softGreen}" opacity="0.55"/>

    <!-- simplified roads -->
    <path d="M760 420 C820 360, 900 390, 980 330" fill="none" stroke="${COLORS.white}" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
    <path d="M760 420 C820 360, 900 390, 980 330" fill="none" stroke="${COLORS.borderGreen}" stroke-width="3" stroke-linecap="round"/>

    <!-- golf flag -->
    <g transform="translate(930, 210)">
      <line x1="0" y1="0" x2="0" y2="120" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
      <polygon points="0,0 72,18 0,36" fill="${COLORS.brandGreen}"/>
      <circle cx="0" cy="120" r="8" fill="${COLORS.brandGreenDark}"/>
    </g>

    <!-- map pin -->
    <g transform="translate(820, 300)">
      <path d="M0,-58 C32,-58 58,-32 58,0 C58,38 0,92 0,92 C0,92 -58,38 -58,0 C-58,-32 -32,-58 0,-58 Z" fill="url(#pinGrad)" stroke="${COLORS.white}" stroke-width="4"/>
      <circle cx="0" cy="0" r="18" fill="${COLORS.white}"/>
    </g>

    <!-- small secondary pin -->
    <g transform="translate(1020, 380) scale(0.72)">
      <path d="M0,-58 C32,-58 58,-32 58,0 C58,38 0,92 0,92 C0,92 -58,38 -58,0 C-58,-32 -32,-58 0,-58 Z" fill="${COLORS.brandGreen}" opacity="0.85"/>
      <circle cx="0" cy="0" r="16" fill="${COLORS.white}"/>
    </g>
  </g>

  <!-- left text -->
  <g font-family="${FONT}">
    <text x="80" y="210" fill="${COLORS.brandGreenDark}" font-size="72" font-weight="700">GolfMap Korea</text>
    <text x="80" y="290" fill="${COLORS.ink}" font-size="48" font-weight="700">전국 골프장 지도</text>
    <text x="80" y="360" fill="${COLORS.muted}" font-size="28" font-weight="500">주소 · 전화번호 · 홈페이지 · 요금 정보</text>

    <rect x="80" y="410" width="320" height="4" rx="2" fill="${COLORS.brandGreen}" opacity="0.35"/>
    <text x="80" y="470" fill="${COLORS.brandGreen}" font-size="26" font-weight="600">golfmap.kr</text>
  </g>
</svg>`;
}

async function main(): Promise<void> {
  const svg = buildOgSvg();
  const publicDir = path.dirname(OUTPUT);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await sharp(Buffer.from(svg, "utf-8"), { density: 144 })
    .resize(WIDTH, HEIGHT)
    .png({ compressionLevel: 9, palette: false })
    .toFile(OUTPUT);

  const meta = await sharp(OUTPUT).metadata();
  const { size } = fs.statSync(OUTPUT);

  console.log(`Generated: ${OUTPUT}`);
  console.log(`Dimensions: ${meta.width}x${meta.height}`);
  console.log(`File size: ${(size / 1024).toFixed(1)} KB`);
}

main().catch((error) => {
  console.error("[generate:og-image] Failed:", error);
  process.exit(1);
});
