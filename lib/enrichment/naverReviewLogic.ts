import {
  normalizeReviewDifficultyInput,
  parseDifficultyRaw,
} from "@/lib/enrichment/difficultyUtils";
import {
  effectiveReviewStatus,
  isApprovedFlag,
  type NaverReviewItem,
  type ReviewFilter,
  type ReviewProgressStats,
  type ReviewSaveAction,
  type ReviewSavePayload,
} from "@/lib/enrichment/naverReviewTypes";

export function computeReviewProgress(items: NaverReviewItem[]): ReviewProgressStats {
  const stats: ReviewProgressStats = {
    total: items.length,
    pending: 0,
    approved: 0,
    needs_edit: 0,
    rejected: 0,
    phone_approved: 0,
    homepage_approved: 0,
    price_approved: 0,
    difficulty_approved: 0,
    avg_score_approved: 0,
    reviewed: 0,
  };

  for (const item of items) {
    const status = effectiveReviewStatus(item);
    if (status === "pending") stats.pending += 1;
    if (status === "approved") stats.approved += 1;
    if (status === "needs_edit") stats.needs_edit += 1;
    if (status === "rejected") stats.rejected += 1;
    if (status !== "pending") stats.reviewed += 1;

    if (isApprovedFlag(item.approve_phone)) stats.phone_approved += 1;
    if (isApprovedFlag(item.approve_homepage)) stats.homepage_approved += 1;
    if (isApprovedFlag(item.approve_price)) stats.price_approved += 1;
    if (isApprovedFlag(item.approve_difficulty)) stats.difficulty_approved += 1;
    if (isApprovedFlag(item.approve_avg_score)) stats.avg_score_approved += 1;
  }

  return stats;
}

function hasPrice(item: NaverReviewItem): boolean {
  return Boolean(
    item.candidate_price_text.trim() ||
      item.review_price_min.trim() ||
      item.candidate_price_min.trim(),
  );
}

export function matchesReviewFilter(
  item: NaverReviewItem,
  filter: ReviewFilter,
): boolean {
  const status = effectiveReviewStatus(item);
  switch (filter) {
    case "all":
      return true;
    case "pending":
      return status === "pending";
    case "approved":
      return status === "approved";
    case "needs_edit":
      return status === "needs_edit";
    case "no_price":
      return !hasPrice(item);
    case "no_phone":
      return !item.candidate_phone.trim() && !item.review_phone.trim();
    case "no_homepage":
      return (
        !item.candidate_homepage_url.trim() && !item.review_homepage_url.trim()
      );
    case "low_confidence":
      return item.confidence.trim().toLowerCase() === "low";
    default:
      return true;
  }
}

export function getReviewSortRank(item: NaverReviewItem): number {
  const status = effectiveReviewStatus(item);
  if (status === "needs_edit") return 0;
  if (status === "pending" && item.confidence.trim().toLowerCase() === "low") {
    return 1;
  }
  if (status === "pending" && !hasPrice(item)) return 2;
  if (status === "pending") return 3;
  if (status === "approved") return 4;
  if (status === "rejected") return 5;
  return 3;
}

export function filterAndSortReviewItems(
  items: NaverReviewItem[],
  query: string,
  filter: ReviewFilter,
): NaverReviewItem[] {
  const needle = query.trim().toLowerCase();
  return items
    .filter((item) => matchesReviewFilter(item, filter))
    .filter((item) => {
      if (!needle) return true;
      const haystack = [
        item.name,
        item.address,
        item.candidate_title,
        item.candidate_address,
        item.id,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    })
    .sort((a, b) => {
      const rankDiff = getReviewSortRank(a) - getReviewSortRank(b);
      if (rankDiff !== 0) return rankDiff;
      return a.name.localeCompare(b.name, "ko");
    });
}

function normalizeDifficultyFields(item: NaverReviewItem): {
  item: NaverReviewItem;
  error?: string;
} {
  const next = { ...item };
  if (next.review_difficulty.trim()) {
    const normalized = normalizeReviewDifficultyInput(next.review_difficulty);
    if (normalized.error) {
      return { item: next, error: normalized.error };
    }
    next.review_difficulty = normalized.difficulty;
  }
  if (next.candidate_difficulty.trim()) {
    next.candidate_difficulty = parseDifficultyRaw(
      next.candidate_difficulty,
    ).difficulty;
  }
  return { item: next };
}

function applyApproveAll(item: NaverReviewItem): NaverReviewItem {
  const now = new Date().toISOString();
  const next: NaverReviewItem = {
    ...item,
    review_phone: item.review_phone.trim() || item.candidate_phone.trim(),
    review_homepage_url:
      item.review_homepage_url.trim() || item.candidate_homepage_url.trim(),
    review_price_min:
      item.review_price_min.trim() || item.candidate_price_min.trim(),
    review_price_max:
      item.review_price_max.trim() || item.candidate_price_max.trim(),
    review_price_type:
      item.review_price_type.trim() ||
      item.candidate_price_type.trim() ||
      "unknown",
    review_difficulty:
      item.review_difficulty.trim() ||
      parseDifficultyRaw(item.candidate_difficulty).difficulty,
    review_avg_score:
      item.review_avg_score.trim() || item.candidate_avg_score.trim(),
    approve_phone: "y",
    approve_homepage: "y",
    approve_price: "y",
    approve_difficulty: "y",
    approve_avg_score: "y",
    phone_status: "approved",
    homepage_status: "approved",
    price_status: "approved",
    difficulty_status: "approved",
    avg_score_status: "approved",
    review_status: "approved",
    reviewed_at: now,
  };
  return normalizeDifficultyFields(next).item;
}

function applyApproveContacts(item: NaverReviewItem): NaverReviewItem {
  const now = new Date().toISOString();
  return {
    ...item,
    review_phone: item.review_phone.trim() || item.candidate_phone.trim(),
    review_homepage_url:
      item.review_homepage_url.trim() || item.candidate_homepage_url.trim(),
    approve_phone: "y",
    approve_homepage: "y",
    phone_status: "approved",
    homepage_status: "approved",
    reviewed_at: now,
  };
}

function applyApprovePrice(item: NaverReviewItem): NaverReviewItem {
  const now = new Date().toISOString();
  return {
    ...item,
    review_price_min:
      item.review_price_min.trim() || item.candidate_price_min.trim(),
    review_price_max:
      item.review_price_max.trim() || item.candidate_price_max.trim(),
    review_price_type:
      item.review_price_type.trim() ||
      item.candidate_price_type.trim() ||
      "unknown",
    approve_price: "y",
    price_status: "approved",
    reviewed_at: now,
  };
}

function applyApproveStats(item: NaverReviewItem): NaverReviewItem {
  const now = new Date().toISOString();
  const next: NaverReviewItem = {
    ...item,
    review_difficulty:
      item.review_difficulty.trim() ||
      parseDifficultyRaw(item.candidate_difficulty).difficulty,
    review_avg_score:
      item.review_avg_score.trim() || item.candidate_avg_score.trim(),
    approve_difficulty: "y",
    approve_avg_score: "y",
    difficulty_status: "approved",
    avg_score_status: "approved",
    reviewed_at: now,
  };
  return normalizeDifficultyFields(next).item;
}

export function applyReviewSave(
  current: NaverReviewItem,
  payload: ReviewSavePayload,
): { item: NaverReviewItem; error?: string } {
  let item = { ...current, ...(payload.fields ?? {}) } as NaverReviewItem;

  switch (payload.action) {
    case "approve_all":
      item = applyApproveAll(item);
      break;
    case "approve_contacts":
      item = applyApproveContacts(item);
      break;
    case "approve_price":
      item = applyApprovePrice(item);
      break;
    case "approve_stats":
      item = applyApproveStats(item);
      break;
    case "needs_edit":
      item = { ...item, review_status: "needs_edit", reviewed_at: new Date().toISOString() };
      break;
    case "reject":
      item = { ...item, review_status: "rejected", reviewed_at: new Date().toISOString() };
      break;
    case "save":
    case "save_and_next":
      break;
    default:
      break;
  }

  if (payload.fields) {
    const editedAt = new Date().toISOString();
    if (payload.fields.review_phone !== undefined && payload.fields.review_phone.trim()) {
      item.phone_status = "edited";
      item.approve_phone = item.approve_phone || "y";
    }
    if (
      payload.fields.review_homepage_url !== undefined &&
      payload.fields.review_homepage_url.trim()
    ) {
      item.homepage_status = "edited";
      item.approve_homepage = item.approve_homepage || "y";
    }
    if (
      payload.fields.review_price_min !== undefined ||
      payload.fields.review_price_max !== undefined
    ) {
      item.price_status = "edited";
      item.approve_price = item.approve_price || "y";
    }
    if (payload.fields.review_difficulty !== undefined) {
      item.difficulty_status = "edited";
      item.approve_difficulty = item.approve_difficulty || "y";
    }
    if (payload.fields.review_avg_score !== undefined) {
      item.avg_score_status = "edited";
      item.approve_avg_score = item.approve_avg_score || "y";
    }
    if (payload.fields.review_status === "approved") {
      item.reviewed_at = editedAt;
    }
  }

  const normalized = normalizeDifficultyFields(item);
  if (normalized.error) {
    return { item: current, error: normalized.error };
  }

  if (!normalized.item.reviewed_at && payload.action.startsWith("approve")) {
    normalized.item.reviewed_at = new Date().toISOString();
  }

  return { item: normalized.item };
}

export function findNextPendingId(
  items: NaverReviewItem[],
  currentId: string,
): string | null {
  const sorted = filterAndSortReviewItems(items, "", "pending");
  const index = sorted.findIndex((item) => item.id === currentId);
  if (index >= 0 && index < sorted.length - 1) {
    return sorted[index + 1].id;
  }
  const fallback = sorted.find((item) => item.id !== currentId);
  return fallback?.id ?? null;
}

export type { ReviewSaveAction };
