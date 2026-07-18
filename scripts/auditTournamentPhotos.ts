import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  TOURNAMENT_OFFICIAL_PHOTOS,
  TOURNAMENT_OFFICIAL_RIGHTS_BASIS,
} from "../lib/tournamentOfficialPhotos";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
let failures = 0;

function fail(message: string): void {
  console.error(`[audit:tournament-photos] FAIL: ${message}`);
  failures += 1;
}

function ok(message: string): void {
  console.log(`[audit:tournament-photos] OK: ${message}`);
}

function main(): void {
  if (!TOURNAMENT_OFFICIAL_RIGHTS_BASIS.includes("User-confirmed permission")) {
    fail("rightsBasis missing user-confirmed permission");
  }

  const byEvent = new Map<string, number>();
  for (const photo of TOURNAMENT_OFFICIAL_PHOTOS) {
    byEvent.set(photo.eventSlug, (byEvent.get(photo.eventSlug) ?? 0) + 1);

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
    if (!photo.officialTitle && !photo.caption) {
      fail(`${photo.id}: missing officialTitle/caption`);
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

  for (const [slug, count] of byEvent) {
    if (count < 1 || count > 4) {
      fail(`${slug}: expected 1~4 photos, got ${count}`);
    } else {
      ok(`${slug}: ${count} photos`);
    }
  }

  if (failures > 0) {
    console.error(`[audit:tournament-photos] ${failures} failure(s)`);
    process.exit(1);
  }
  console.log(
    `[audit:tournament-photos] PASS — ${TOURNAMENT_OFFICIAL_PHOTOS.length} photos`,
  );
}

main();
