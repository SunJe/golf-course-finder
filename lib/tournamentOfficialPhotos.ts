import officialManifest from "@/data/tournamentOfficialPhotos.json";

export type TournamentOfficialPhoto = {
  id: string;
  eventSlug: string;
  localPath: string;
  sourcePage: string;
  downloadUrl: string;
  officialTitle: string;
  caption: string;
  credit: string;
  rightsBasis: string;
  downloadedAt: string;
  md5: string;
  width: number;
  height: number;
};

type LegacyPhoto = {
  localPath: string;
  sourcePage: string;
  downloadUrl: string;
  officialTitle: string;
  caption: string;
  credit: string;
  rightsBasis: string;
  downloadedAt: string;
  md5: string;
  width: number;
  height: number;
};

type LegacyManifest = {
  rightsBasis: string;
  tournaments: Record<
    string,
    {
      name: string;
      sourcePage: string;
      photos: LegacyPhoto[];
    }
  >;
};

const EVENT_SLUG_BY_KEY: Record<string, string> = {
  "mediheal-2025": "2026-mediheal-hankook-ilbo-montvert-guide",
  "bmw-ladies-2025": "2026-bmw-ladies-championship-guide",
};

function toWebPath(localPath: string): string {
  if (localPath.startsWith("/")) return localPath;
  if (localPath.startsWith("public/")) return `/${localPath.slice("public/".length)}`;
  return `/${localPath}`;
}

function normalizePhotos(): TournamentOfficialPhoto[] {
  const legacy = officialManifest as LegacyManifest;
  const items: TournamentOfficialPhoto[] = [];
  for (const [key, group] of Object.entries(legacy.tournaments ?? {})) {
    const eventSlug = EVENT_SLUG_BY_KEY[key] ?? key;
    group.photos.forEach((photo, index) => {
      const fileName =
        photo.localPath.split(/[/\\]/).pop()?.replace(/\.[^.]+$/, "") ??
        `${key}-${index + 1}`;
      items.push({
        id: fileName,
        eventSlug,
        localPath: toWebPath(photo.localPath),
        sourcePage: photo.sourcePage,
        downloadUrl: photo.downloadUrl,
        officialTitle: photo.officialTitle,
        caption: photo.caption,
        credit: photo.credit,
        rightsBasis: photo.rightsBasis,
        downloadedAt: photo.downloadedAt,
        md5: photo.md5,
        width: photo.width,
        height: photo.height,
      });
    });
  }
  return items;
}

export const TOURNAMENT_OFFICIAL_PHOTOS = normalizePhotos();

export const TOURNAMENT_OFFICIAL_RIGHTS_BASIS =
  (officialManifest as LegacyManifest).rightsBasis ??
  "User-confirmed permission for GolfMap editorial use";

export function getOfficialPhotosForEvent(
  eventSlug: string,
  ids?: string[],
): TournamentOfficialPhoto[] {
  const photos = TOURNAMENT_OFFICIAL_PHOTOS.filter(
    (photo) => photo.eventSlug === eventSlug,
  );
  if (!ids || ids.length === 0) return photos.slice(0, 4);
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  return ids
    .map((id) => byId.get(id))
    .filter((photo): photo is TournamentOfficialPhoto => Boolean(photo));
}
