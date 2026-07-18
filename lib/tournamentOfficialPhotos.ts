import officialManifest from "@/data/tournamentOfficialPhotos.json";

export type TournamentPhotoRole =
  | "course"
  | "competition"
  | "gallery"
  | "winner"
  | "ceremony"
  | "sponsor-display";

export type TournamentOfficialPhoto = {
  id: string;
  eventSlug: string;
  role: TournamentPhotoRole;
  localPath: string;
  sourcePage: string;
  downloadUrl: string;
  officialTitle: string;
  alt: string;
  caption: string;
  credit: string;
  rightsBasis: string;
  downloadedAt: string;
  md5: string;
  width: number;
  height: number;
};

type ManifestFile = {
  generatedAt?: string;
  rightsBasis: string;
  items: TournamentOfficialPhoto[];
};

const manifest = officialManifest as ManifestFile;

export const TOURNAMENT_OFFICIAL_PHOTOS: TournamentOfficialPhoto[] =
  manifest.items ?? [];

export const TOURNAMENT_OFFICIAL_RIGHTS_BASIS =
  manifest.rightsBasis ??
  "User-confirmed permission for GolfMap editorial use";

export const TOURNAMENT_PHOTO_ROLES: TournamentPhotoRole[] = [
  "course",
  "competition",
  "gallery",
  "winner",
  "ceremony",
  "sponsor-display",
];

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
