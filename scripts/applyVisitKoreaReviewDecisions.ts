/**
 * 사용자가 검수한 Visit Korea 이미지 후보 승인/거부 결과를 applied 매칭에 반영
 * Usage: npm run apply:visit-korea-review-decisions
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_PATH = path.join(ROOT, "data/visit-korea-golf-image-review.json");
const APPLIED_PATH = path.join(
  ROOT,
  "data/visit-korea-golf-image-matches-applied.json",
);
const DECISIONS_PATH = path.join(
  ROOT,
  "data/visit-korea-golf-image-review-decisions.json",
);
const RESOLVED_REVIEW_PATH = path.join(
  ROOT,
  "data/visit-korea-golf-image-review-resolved.json",
);

type ImageMatchConfidence = "exact" | "high" | "medium" | "low" | "ambiguous";

type ReviewCandidate = {
  courseId: string;
  courseName: string;
  visitKoreaContentId: string;
  visitKoreaTitle: string;
  images: string[];
  scores: {
    imageMatchConfidence: ImageMatchConfidence;
    [key: string]: unknown;
  };
};

type ReviewItem = {
  courseId: string;
  courseName: string;
  best?: ReviewCandidate;
  alternatives?: ReviewCandidate[];
};

type AppliedItem = {
  courseId: string;
  courseName: string;
  visitKoreaContentId: string;
  visitKoreaTitle: string;
  images: string[];
  imageMatchConfidence: ImageMatchConfidence;
  scores?: Record<string, unknown>;
  appliedAt: string;
  manualDecision?: "approved";
};

type DecisionsFile = {
  approved: string[];
  rejected: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function main(): void {
  const reviewFile = readJson<{ items: ReviewItem[] }>(REVIEW_PATH);
  const appliedFile = readJson<{ items: AppliedItem[] }>(APPLIED_PATH);
  const decisions = readJson<DecisionsFile>(DECISIONS_PATH);

  const approved = new Set(decisions.approved);
  const rejected = new Set(decisions.rejected);
  const reviewByCourseId = new Map(
    reviewFile.items.map((item) => [item.courseId, item]),
  );
  const appliedByCourseId = new Map(
    appliedFile.items.map((item) => [item.courseId, item]),
  );

  let approvedAdded = 0;
  let rejectedRemoved = 0;
  const missingApproved: string[] = [];

  for (const courseId of rejected) {
    if (appliedByCourseId.delete(courseId)) {
      rejectedRemoved += 1;
    }
  }

  for (const courseId of approved) {
    const reviewItem = reviewByCourseId.get(courseId);
    if (!reviewItem?.best) {
      missingApproved.push(courseId);
      continue;
    }

    appliedByCourseId.set(courseId, {
      courseId,
      courseName: reviewItem.courseName,
      visitKoreaContentId: reviewItem.best.visitKoreaContentId,
      visitKoreaTitle: reviewItem.best.visitKoreaTitle,
      images: reviewItem.best.images,
      imageMatchConfidence: reviewItem.best.scores.imageMatchConfidence,
      scores: reviewItem.best.scores,
      appliedAt: new Date().toISOString(),
      manualDecision: "approved",
    });
    approvedAdded += 1;
  }

  const resolved = reviewFile.items.map((item) => ({
    ...item,
    manualDecision: approved.has(item.courseId)
      ? "approved"
      : rejected.has(item.courseId)
        ? "rejected"
        : "pending",
  }));

  const appliedItems = [...appliedByCourseId.values()].sort((a, b) =>
    a.courseId.localeCompare(b.courseId),
  );

  fs.writeFileSync(
    APPLIED_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        appliedCount: appliedItems.length,
        manualApprovedCount: approved.size,
        manualRejectedCount: rejected.size,
        items: appliedItems,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  fs.writeFileSync(
    RESOLVED_REVIEW_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        approvedCount: approved.size,
        rejectedCount: rejected.size,
        pendingCount: resolved.filter((item) => item.manualDecision === "pending")
          .length,
        missingApproved,
        items: resolved,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("=== Apply Visit Korea review decisions ===");
  console.log(`approvedAdded=${approvedAdded}`);
  console.log(`rejectedRemoved=${rejectedRemoved}`);
  console.log(`missingApproved=${missingApproved.length}`);
  console.log(`appliedTotal=${appliedItems.length}`);
  console.log(`saved: ${APPLIED_PATH}`);
  console.log(`saved: ${RESOLVED_REVIEW_PATH}`);
}

main();
