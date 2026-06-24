export type GolfMapOgData = {
  title: string;
  eyebrow?: string;
  brand?: string;
  domain?: string;
  backgroundImageHref: string; // e.g. /promo-assets/backgrounds/default-golf-course.jpg
};

function esc(s: string) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

function fitTitle(title: string) {
  const len = [...title].length;
  if (len <= 7) return { size: 118, y: 835 };
  if (len <= 10) return { size: 104, y: 835 };
  if (len <= 13) return { size: 88, y: 830 };
  return { size: 76, y: 825 };
}

export function generateGolfMapOgSvg(data: GolfMapOgData) {
  const title = esc(data.title);
  const eyebrow = esc(data.eyebrow ?? '전국을 연결하는 골프 정보 플랫폼');
  const brand = esc(data.brand ?? 'GolfMap Korea');
  const domain = esc(data.domain ?? 'golfmap.kr');
  const bg = esc(data.backgroundImageHref);
  const titleFit = fitTitle(data.title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="titleGrad" x1="75" y1="730" x2="720" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#073D36"/><stop offset="1" stop-color="#003D36"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="850" y2="600" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F8FAEE" stop-opacity="0.79"/><stop offset="1" stop-color="#EEF4D6" stop-opacity="0.60"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#052e24" flood-opacity="0.16"/></filter>
    <filter id="logoShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#052e24" flood-opacity="0.30"/></filter>
    <clipPath id="koreaClip"><path d="M342 25C303 20 268 33 244 61C223 83 210 116 188 139C165 165 135 185 121 220C105 260 118 301 103 341C92 373 66 397 69 433C73 480 117 518 165 529C205 538 246 525 279 501C315 475 341 441 377 414C407 391 446 379 466 344C486 309 479 266 464 232C447 193 413 170 398 132C385 100 381 52 342 25Z"/></clipPath>
    <style>
      .kr { font-family: Pretendard, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
      .en { font-family: Inter, Pretendard, Arial, sans-serif; }
    </style>
  </defs>

  <image href="${bg}" x="0" y="0" width="1200" height="1200" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1200" height="1200" fill="rgba(0,80,52,0.04)"/>

  <!-- outer frame -->
  <path d="M22 62H1162C1162 42 1175 29 1198 29V1162C1175 1162 1162 1175 1162 1198H62C62 1175 49 1162 22 1162V62Z" stroke="white" stroke-width="2.4" opacity="0.92" fill="none"/>
  <path d="M45 45H1180C1180 28 1190 20 1198 20V1180C1190 1180 1180 1190 1180 1198H45C45 1190 35 1180 22 1180V45Z" stroke="white" stroke-width="1.6" opacity="0.7" fill="none"/>

  <!-- brand logo -->
  <g transform="translate(70 72) scale(0.65)" filter="url(#logoShadow)">
    <path d="M80 10C49.6 10 25 34.6 25 65c0 44.5 55 86 55 86s55-41.5 55-86c0-30.4-24.6-55-55-55Z" fill="#0B5A38"/>
    <circle cx="80" cy="60" r="34" fill="#F7FAF5"/>
    <path d="M52 94c20-12 40-17 61-18" stroke="#F7FAF5" stroke-width="10" stroke-linecap="round"/>
    <path d="M90 72v42" stroke="#F7FAF5" stroke-width="5" stroke-linecap="round"/>
    <path d="M92 77l32 9-32 10V77Z" fill="#F7FAF5"/>
  </g>
  <text class="en" x="170" y="122" font-size="42" font-weight="800" fill="#07463B">${brand}</text>
  <text class="en" x="172" y="164" font-size="28" font-weight="500" fill="#07463B">${domain}</text>

  <!-- top right motto -->
  <text class="en" x="730" y="120" font-size="18" letter-spacing="16" font-weight="700" fill="#073D36">FIND YOUR NEXT ROUND</text>
  <line x1="730" y1="144" x2="1118" y2="144" stroke="#073D36" stroke-opacity="0.42" stroke-width="1.2"/>
  <circle cx="1120" cy="144" r="3" fill="#073D36"/>

  <!-- Korea map overlay -->
  <g transform="translate(730 145) scale(0.75)" opacity="0.78">
    <g clip-path="url(#koreaClip)" opacity="0.32">
      <g stroke="white" stroke-width="1"><path d="M40 40V540M80 40V540M120 40V540M160 40V540M200 40V540M240 40V540M280 40V540M320 40V540M360 40V540M400 40V540M440 40V540M480 40V540"/><path d="M20 80H500M20 120H500M20 160H500M20 200H500M20 240H500M20 280H500M20 320H500M20 360H500M20 400H500M20 440H500M20 480H500M20 520H500"/></g>
    </g>
    <path d="M342 25C303 20 268 33 244 61C223 83 210 116 188 139C165 165 135 185 121 220C105 260 118 301 103 341C92 373 66 397 69 433C73 480 117 518 165 529C205 538 246 525 279 501C315 475 341 441 377 414C407 391 446 379 466 344C486 309 479 266 464 232C447 193 413 170 398 132C385 100 381 52 342 25Z" fill="rgba(255,255,255,0.12)" stroke="white" stroke-width="5" stroke-linejoin="round"/>
    <path d="M236 103C257 136 279 160 311 174C334 184 356 195 372 216M165 243C197 248 219 264 236 290C255 319 283 332 315 329M123 401C163 390 197 397 228 419C249 434 278 438 306 430M327 90C326 124 337 150 361 170" stroke="white" stroke-width="2.5" stroke-opacity="0.8"/>
    <path d="M443 91c25-18 45 6 34 25-11 18-45 13-47-7-1-7 3-13 13-18Z" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="4"/>
    <path d="M490 112c12-10 27 2 20 15-8 14-31 10-31-5 0-4 3-7 11-10Z" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="3"/>
    <path d="M292 263c-26 0-47 21-47 47 0 37 47 72 47 72s47-35 47-72c0-26-21-47-47-47Z" fill="white"/>
    <circle cx="292" cy="307" r="16" fill="#11824A"/>
  </g>

  <!-- glass panel -->
  <g transform="translate(0 565)" filter="url(#softShadow)">
    <path d="M0 0C210 42 417 62 618 51C759 43 893 11 1018 0V522C1018 554 992 580 960 580H42C19 580 0 561 0 538V0Z" fill="url(#glass)" stroke="white" stroke-width="1.5"/>
    <path d="M0 0C242 48 472 61 690 40C815 28 924 12 1018 0" stroke="white" stroke-opacity="0.55" stroke-width="1.5"/>
  </g>

  <text class="kr" x="78" y="710" font-size="34" font-weight="800" fill="#073D36">${eyebrow}</text>
  <line x1="78" y1="733" x2="540" y2="733" stroke="#073D36" stroke-width="1.4" opacity="0.75"/>
  <circle cx="542" cy="733" r="3" fill="#073D36" opacity="0.9"/>

  <text class="kr" x="78" y="${titleFit.y}" font-size="${titleFit.size}" font-weight="900" fill="url(#titleGrad)" letter-spacing="-4">${title}</text>

  <!-- glass flag decoration -->
  <g transform="translate(880 735)" opacity="0.85">
    <path d="M32 24V200" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <path d="M35 34C62 42 86 54 112 62C86 69 62 81 35 91V34Z" fill="white" fill-opacity="0.86"/>
  </g>

  <!-- dot grid -->
  <g transform="translate(940 920)" fill="white" opacity="0.8">
    ${Array.from({ length: 4 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<circle cx="${c * 22}" cy="${r * 20}" r="2.6"/>`).join('')).join('')}
  </g>

  <!-- bottom icons -->
  <g class="kr" transform="translate(0 1015)" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(96 0)"><path d="M48 12c-14 0-25 11-25 25 0 20 25 43 25 43s25-23 25-43c0-14-11-25-25-25Z"/><circle cx="48" cy="37" r="9"/><path d="M22 65 9 86h78L74 65"/><text x="48" y="130" text-anchor="middle" font-size="24" font-weight="800" fill="#073D36" stroke="none">위치</text></g>
    <line x1="250" y1="22" x2="250" y2="112" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <g transform="translate(290 0)"><path d="M30 17 18 28c-4 4 2 22 19 39s35 23 39 19l11-12-18-16-10 9c-8-3-15-8-21-15s-12-14-15-21l9-9-2-5Z"/><path d="M59 18c10 3 17 10 20 20M56 31c5 2 8 5 10 10"/><text x="48" y="130" text-anchor="middle" font-size="24" font-weight="800" fill="#073D36" stroke="none">연락처</text></g>
    <line x1="455" y1="22" x2="455" y2="112" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <g transform="translate(500 0)"><path d="M18 22h60v40H18z"/><path d="M34 78h28M48 62v16"/><path d="M18 62h60"/><text x="48" y="130" text-anchor="middle" font-size="24" font-weight="800" fill="#073D36" stroke="none">홈페이지</text></g>
    <line x1="670" y1="22" x2="670" y2="112" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <g transform="translate(705 0)"><ellipse cx="34" cy="25" rx="22" ry="10"/><path d="M12 25v25c0 6 10 10 22 10s22-4 22-10V25"/><path d="M12 38c0 6 10 10 22 10s22-4 22-10"/><ellipse cx="62" cy="55" rx="22" ry="10"/><path d="M40 55v20c0 6 10 10 22 10s22-4 22-10V55"/><path d="M40 68c0 6 10 10 22 10s22-4 22-10"/><text x="48" y="130" text-anchor="middle" font-size="24" font-weight="800" fill="#073D36" stroke="none">실시간 요금</text></g>
  </g>
</svg>`;
}
