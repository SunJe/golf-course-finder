import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  TOURNAMENT_OFFICIAL_PHOTOS,
  TOURNAMENT_OFFICIAL_RIGHTS_BASIS,
  TOURNAMENT_PHOTO_ROLES,
  type TournamentPhotoRole,
} from "../lib/tournamentOfficialPhotos";
import { TOURNAMENT_BLOG_POSTS } from "../lib/blogTournamentPosts";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
let failures = 0;
let warnings = 0;

const WINNER_EVIDENCE =
  /우승|시상|트로피|victory|champion|trophy|winner|ceremony|celebrat/i;

const ROLE_SECTION_HINTS: Record<
  TournamentPhotoRole,
  { allow: RegExp; deny?: RegExp }
> = {
  course: { allow: /코스|전경|홀|몽베르|파인비치/ },
  competition: { allow: /경기|공식 경기|대회 현장/ },
  gallery: { allow: /갤러리|관람/ },
  winner: { allow: /우승|시상/ },
  ceremony: { allow: /우승|시상|세리머니/ },
  "sponsor-display": {
    allow: /스폰서|전시|현장/,
    deny: /우승|시상/,
  },
};

function fail(message: string): void {
  console.error(`[audit:tournament-photos] FAIL: ${message}`);
  failures += 1;
}

function warn(message: string): void {
  console.warn(`[audit:tournament-photos] WARN: ${message}`);
  warnings += 1;
}

function ok(message: string): void {
  console.log(`[audit:tournament-photos] OK: ${message}`);
}

function main(): void {
  if (!TOURNAMENT_OFFICIAL_RIGHTS_BASIS.includes("User-confirmed permission")) {
    fail("rightsBasis missing user-confirmed permission");
  }

  const byEvent = new Map<string, typeof TOURNAMENT_OFFICIAL_PHOTOS>();
  for (const photo of TOURNAMENT_OFFICIAL_PHOTOS) {
    const list = byEvent.get(photo.eventSlug) ?? [];
    list.push(photo);
    byEvent.set(photo.eventSlug, list);

    if (!photo.localPath.startsWith("/promo-assets/blog/tournaments/official/")) {
      fail(`${photo.id}: localPath must be under /promo-assets/blog/tournaments/official/`);
    }
    if (!photo.sourcePage || !/^https?:\/\//.test(photo.sourcePage)) {
      fail(`${photo.id}: missing sourcePage`);
    }
    if (!photo.downloadUrl || !/^https?:\/\//.test(photo.downloadUrl)) {
      fail(`${photo.id}: missing downloadUrl`);
    }
    if (!photo.credit) fail(`${photo.id}: missing credit`);
    if (!photo.rightsBasis) fail(`${photo.id}: missing rightsBasis`);
    if (!photo.md5 || !/^[a-f0-9]{32}$/i.test(photo.md5)) {
      fail(`${photo.id}: missing md5`);
    }
    if (!photo.width || !photo.height) fail(`${photo.id}: missing dimensions`);
    if (!photo.officialTitle) fail(`${photo.id}: missing officialTitle`);
    if (!photo.alt || !photo.alt.trim()) fail(`${photo.id}: empty alt`);
    if (!photo.caption || !photo.caption.trim()) fail(`${photo.id}: empty caption`);
    if (!TOURNAMENT_PHOTO_ROLES.includes(photo.role)) {
      fail(`${photo.id}: invalid role ${photo.role}`);
    }

    if (photo.role === "winner" || photo.role === "ceremony") {
      const evidence = `${photo.officialTitle}\n${photo.caption}`;
      if (!WINNER_EVIDENCE.test(evidence)) {
        fail(
          `${photo.id}: role=${photo.role} but officialTitle/caption lack winner/ceremony evidence`,
        );
      }
    }

    const filePath = path.join(ROOT, "public", photo.localPath.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) {
      fail(`${photo.id}: file missing ${photo.localPath}`);
      continue;
    }
    const buf = fs.readFileSync(filePath);
    const md5 = crypto.createHash("md5").update(buf).digest("hex");
    if (md5 !== photo.md5.toLowerCase()) {
      fail(`${photo.id}: md5 mismatch file=${md5} manifest=${photo.md5}`);
    }
  }

  for (const [slug, photos] of byEvent) {
    if (photos.length < 1 || photos.length > 4) {
      fail(`${slug}: expected 1~4 photos, got ${photos.length}`);
    } else {
      ok(`${slug}: ${photos.length} photos`);
    }

    const alts = photos.map((p) => p.alt.trim());
    const altSeen = new Set<string>();
    for (const alt of alts) {
      if (altSeen.has(alt)) fail(`${slug}: duplicate alt "${alt}"`);
      altSeen.add(alt);
    }

    const captionCounts = new Map<string, number>();
    for (const photo of photos) {
      const key = photo.caption.trim();
      captionCounts.set(key, (captionCounts.get(key) ?? 0) + 1);
    }
    for (const [caption, count] of captionCounts) {
      if (count >= 3) {
        warn(`${slug}: caption repeated ${count} times — "${caption}"`);
      }
    }
  }

  // Section heading ↔ role consistency for photos wired in tournament posts
  for (const post of TOURNAMENT_BLOG_POSTS) {
    for (const section of post.sections) {
      if (!section.officialPhotoEventSlug || !section.officialPhotoIds?.length) {
        continue;
      }
      const heading = section.heading;
      for (const id of section.officialPhotoIds) {
        const photo = TOURNAMENT_OFFICIAL_PHOTOS.find((p) => p.id === id);
        if (!photo) {
          fail(`${post.slug}: section "${heading}" references missing photo ${id}`);
          continue;
        }
        const hints = ROLE_SECTION_HINTS[photo.role];
        if (hints.deny?.test(heading)) {
          fail(
            `${post.slug}: role=${photo.role} photo ${id} linked under denied section "${heading}"`,
          );
        }
        if (!hints.allow.test(heading)) {
          warn(
            `${post.slug}: role=${photo.role} photo ${id} under section "${heading}" (title/role mismatch?)`,
          );
        }
      }
    }
  }

  if (failures > 0) {
    console.error(
      `[audit:tournament-photos] ${failures} failure(s), ${warnings} warning(s)`,
    );
    process.exit(1);
  }
  console.log(
    `[audit:tournament-photos] PASS — ${TOURNAMENT_OFFICIAL_PHOTOS.length} photos` +
      (warnings ? ` (${warnings} warning(s))` : ""),
  );
}

main();
