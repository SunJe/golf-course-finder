import { TEESCANNER_BASE } from "./access";

export const DETAIL_URL_ENTRY_PATH = "SC";

export function parseGolfclubSeqFromUrl(url: string): string {
  const match = url.match(/[?&]golfclub_seq=(\d+)/i);
  return match?.[1] ?? "";
}

export function buildDetailUrlTemplate(golfclubSeq: string): string {
  return `${TEESCANNER_BASE}/booking/detail?tab=teetime&golfclub_seq=${golfclubSeq}&roundDay={roundDay}&entry_path=${DETAIL_URL_ENTRY_PATH}`;
}

export function buildDetailUrl(golfclubSeq: string, roundDay: string): string {
  return `${TEESCANNER_BASE}/booking/detail?tab=teetime&golfclub_seq=${golfclubSeq}&roundDay=${encodeURIComponent(roundDay)}&entry_path=${DETAIL_URL_ENTRY_PATH}`;
}
