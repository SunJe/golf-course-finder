import { NextResponse } from "next/server";
import {
  applyReviewSave,
  computeReviewProgress,
  findNextPendingId,
} from "@/lib/enrichment/naverReviewLogic";
import {
  loadNaverReviewItems,
  saveNaverReviewItem,
} from "@/lib/enrichment/naverReviewCsv";
import { isReviewAdminEnabled } from "@/lib/enrichment/reviewAccess";
import type { ReviewSavePayload } from "@/lib/enrichment/naverReviewTypes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function guardReviewAdmin() {
  if (!isReviewAdminEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const blocked = guardReviewAdmin();
  if (blocked) return blocked;

  const { items, headers } = loadNaverReviewItems();
  return NextResponse.json({
    items,
    headers,
    progress: computeReviewProgress(items),
  });
}

export async function POST(request: Request) {
  const blocked = guardReviewAdmin();
  if (blocked) return blocked;

  let payload: ReviewSavePayload;
  try {
    payload = (await request.json()) as ReviewSavePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.id?.trim()) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { items, headers } = loadNaverReviewItems();
  const current = items.find((item) => item.id === payload.id);
  if (!current) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { item, error } = applyReviewSave(current, payload);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  saveNaverReviewItem(item, headers);

  const nextId =
    payload.action === "save_and_next"
      ? findNextPendingId(items, payload.id)
      : null;

  const refreshed = loadNaverReviewItems();
  return NextResponse.json({
    ok: true,
    item,
    nextId,
    progress: computeReviewProgress(refreshed.items),
  });
}
