"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDifficultyForDisplay } from "@/lib/enrichment/difficultyUtils";
import {
  effectiveReviewStatus,
  type NaverReviewItem,
  type ReviewFilter,
  type ReviewProgressStats,
  type ReviewSaveAction,
} from "@/lib/enrichment/naverReviewTypes";
import {
  filterAndSortReviewItems,
  getReviewSortRank,
} from "@/lib/enrichment/naverReviewLogic";

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pending", label: "미검수" },
  { id: "approved", label: "승인됨" },
  { id: "needs_edit", label: "수정 필요" },
  { id: "no_price", label: "가격 없음" },
  { id: "no_phone", label: "phone 없음" },
  { id: "no_homepage", label: "homepage 없음" },
  { id: "low_confidence", label: "low confidence" },
];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "needs_edit":
      return "bg-amber-100 text-amber-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function FieldRow({
  label,
  candidate,
  candidateExtra,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  candidate: string;
  candidateExtra?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-sm text-gray-600">
        후보: {candidate || "—"}
        {candidateExtra ? (
          <span className="ml-2 text-xs text-gray-400">{candidateExtra}</span>
        ) : null}
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}

export default function NaverReviewClient() {
  const [items, setItems] = useState<NaverReviewItem[]>([]);
  const [progress, setProgress] = useState<ReviewProgressStats | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [draft, setDraft] = useState<NaverReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/naver-review");
      if (!response.ok) {
        throw new Error("Review data를 불러오지 못했습니다.");
      }
      const data = (await response.json()) as {
        items: NaverReviewItem[];
        progress: ReviewProgressStats;
      };
      setItems(data.items);
      setProgress(data.progress);
      setSelectedId((prev) => {
        if (prev && data.items.some((item) => item.id === prev)) return prev;
        const sorted = filterAndSortReviewItems(data.items, "", "pending");
        return sorted[0]?.id ?? data.items[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : String(loadError),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredItems = useMemo(
    () => filterAndSortReviewItems(items, query, filter),
    [items, query, filter],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (selectedItem) {
      setDraft({ ...selectedItem });
    } else {
      setDraft(null);
    }
  }, [selectedItem]);

  const save = async (action: ReviewSaveAction) => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/naver-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          action,
          fields: {
            review_phone: draft.review_phone,
            review_homepage_url: draft.review_homepage_url,
            review_price_min: draft.review_price_min,
            review_price_max: draft.review_price_max,
            review_price_type: draft.review_price_type,
            review_difficulty: draft.review_difficulty,
            review_avg_score: draft.review_avg_score,
            review_note: draft.review_note,
            reviewer_note: draft.reviewer_note,
            review_status: draft.review_status,
          },
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        item?: NaverReviewItem;
        nextId?: string | null;
        progress?: ReviewProgressStats;
      };
      if (!response.ok || !data.ok || !data.item) {
        throw new Error(data.error ?? "저장에 실패했습니다.");
      }
      setItems((prev) =>
        prev.map((item) => (item.id === data.item!.id ? data.item! : item)),
      );
      setDraft(data.item);
      if (data.progress) setProgress(data.progress);
      setMessage("저장되었습니다.");
      if (action === "save_and_next" && data.nextId) {
        setSelectedId(data.nextId);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  const runQuickAction = async (action: ReviewSaveAction) => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/naver-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, action }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        item?: NaverReviewItem;
        nextId?: string | null;
        progress?: ReviewProgressStats;
      };
      if (!response.ok || !data.ok || !data.item) {
        throw new Error(data.error ?? "처리에 실패했습니다.");
      }
      setItems((prev) =>
        prev.map((item) => (item.id === data.item!.id ? data.item! : item)),
      );
      setDraft(data.item);
      if (data.progress) setProgress(data.progress);
      setMessage("반영되었습니다.");
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : String(actionError),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-gray-500">
        Review CSV 로딩 중…
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[1600px] flex-col gap-3 p-4">
      <header className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Naver 후보 검수 (로컬 전용)
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              source_url을 새 탭으로 열어 네이버 페이지와 나란히 비교하세요.
            </p>
          </div>
          {progress ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700 md:grid-cols-4">
              <div>전체 {progress.total}개</div>
              <div>검수 완료 {progress.reviewed}개</div>
              <div>미검수 {progress.pending}개</div>
              <div>수정 필요 {progress.needs_edit}개</div>
              <div>승인 {progress.approved}개</div>
              <div>거절 {progress.rejected}개</div>
              <div>phone 승인 {progress.phone_approved}</div>
              <div>homepage 승인 {progress.homepage_approved}</div>
              <div>price 승인 {progress.price_approved}</div>
              <div>난이도 승인 {progress.difficulty_approved}</div>
              <div>avg_score 승인 {progress.avg_score_approved}</div>
            </div>
          ) : null}
        </div>
        {error ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[360px_1fr]">
        <aside className="flex min-h-0 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="골프장명 / 주소 / 후보 검색"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setFilter(entry.id)}
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    filter === entry.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {filteredItems.map((item) => {
              const status = effectiveReviewStatus(item);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full border-b border-gray-50 px-3 py-3 text-left hover:bg-gray-50 ${
                      selectedId === item.id ? "bg-emerald-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-500">
                      {item.address || item.candidate_title || item.id}
                    </div>
                    <div className="mt-1 flex gap-2 text-[10px] text-gray-400">
                      <span>{item.confidence || "—"}</span>
                      <span>rank {getReviewSortRank(item)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="min-h-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {!draft ? (
            <div className="text-sm text-gray-500">항목을 선택하세요.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {draft.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{draft.address}</p>
                  <p className="mt-1 font-mono text-xs text-gray-400">
                    {draft.id}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.source_url ? (
                    <a
                      href={draft.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      source_url 열기
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md bg-gray-50 p-3 text-sm">
                  <h3 className="mb-2 font-medium text-gray-800">후보 데이터</h3>
                  <dl className="space-y-1 text-gray-700">
                    <div>
                      <dt className="text-xs text-gray-500">candidate_title</dt>
                      <dd>{draft.candidate_title || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">candidate_address</dt>
                      <dd>{draft.candidate_address || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">confidence</dt>
                      <dd>{draft.confidence || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">query_variant</dt>
                      <dd>{draft.query_variant || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">matched_query</dt>
                      <dd>{draft.matched_query || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">candidate_price_text</dt>
                      <dd>{draft.candidate_price_text || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">candidate_difficulty</dt>
                      <dd>
                        {draft.candidate_difficulty
                          ? formatDifficultyForDisplay(draft.candidate_difficulty)
                          : "—"}
                        {draft.candidate_difficulty_text ? (
                          <span className="ml-2 text-xs text-gray-500">
                            원문: {draft.candidate_difficulty_text}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-gray-800">검수 입력</h3>
                  <FieldRow
                    label="review_phone"
                    candidate={draft.candidate_phone}
                    value={draft.review_phone}
                    onChange={(value) =>
                      setDraft((prev) => (prev ? { ...prev, review_phone: value } : prev))
                    }
                  />
                  <FieldRow
                    label="review_homepage_url"
                    candidate={draft.candidate_homepage_url}
                    value={draft.review_homepage_url}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, review_homepage_url: value } : prev,
                      )
                    }
                  />
                  <FieldRow
                    label="review_price_min"
                    candidate={draft.candidate_price_min}
                    value={draft.review_price_min}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, review_price_min: value } : prev,
                      )
                    }
                  />
                  <FieldRow
                    label="review_price_max"
                    candidate={draft.candidate_price_max}
                    value={draft.review_price_max}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, review_price_max: value } : prev,
                      )
                    }
                  />
                  <FieldRow
                    label="review_price_type"
                    candidate={draft.candidate_price_type}
                    value={draft.review_price_type}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, review_price_type: value } : prev,
                      )
                    }
                  />
                  <FieldRow
                    label="review_difficulty (숫자만, UI 표시 /10)"
                    candidate={
                      draft.candidate_difficulty
                        ? formatDifficultyForDisplay(draft.candidate_difficulty)
                        : ""
                    }
                    candidateExtra={
                      draft.candidate_difficulty_text
                        ? `원문: ${draft.candidate_difficulty_text}`
                        : undefined
                    }
                    value={draft.review_difficulty}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, review_difficulty: value } : prev,
                      )
                    }
                  />
                  <FieldRow
                    label="review_avg_score"
                    candidate={draft.candidate_avg_score}
                    value={draft.review_avg_score}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, review_avg_score: value } : prev,
                      )
                    }
                  />
                  <FieldRow
                    label="review_note"
                    candidate={draft.candidate_reservation_prices_text}
                    value={draft.review_note}
                    onChange={(value) =>
                      setDraft((prev) => (prev ? { ...prev, review_note: value } : prev))
                    }
                  />
                  <FieldRow
                    label="reviewer_note"
                    candidate=""
                    value={draft.reviewer_note}
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, reviewer_note: value } : prev,
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runQuickAction("approve_all")}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  후보값 전체 승인
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runQuickAction("approve_contacts")}
                  className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                >
                  연락처만 승인
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runQuickAction("approve_price")}
                  className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                >
                  가격만 승인
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runQuickAction("approve_stats")}
                  className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                >
                  통계만 승인
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runQuickAction("needs_edit")}
                  className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                >
                  수정 필요
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runQuickAction("reject")}
                  className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 hover:bg-red-200 disabled:opacity-50"
                >
                  거절
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save("save")}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save("save_and_next")}
                  className="rounded-md border border-emerald-300 px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                >
                  저장 후 다음
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 md:grid-cols-5">
                <div>phone: {draft.phone_status || "pending"}</div>
                <div>homepage: {draft.homepage_status || "pending"}</div>
                <div>price: {draft.price_status || "pending"}</div>
                <div>difficulty: {draft.difficulty_status || "pending"}</div>
                <div>avg_score: {draft.avg_score_status || "pending"}</div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
