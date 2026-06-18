import type { GeocodingInputRow } from "./geocodingUtils";
import {
  buildAddressSearchQuery,
  buildKeywordQueries,
  isAddressTooShort,
  isLikelyRoadOrJibunAddress,
  normalizeAddress,
} from "./addressNormalize";
import {
  assessCandidates,
  pickBestCandidate,
  scoreCandidate,
  type GeocodeCandidate,
} from "./geocodingConfidence";

export const KAKAO_ADDRESS_ENDPOINT =
  "https://dapi.kakao.com/v2/local/search/address.json";
export const KAKAO_KEYWORD_ENDPOINT =
  "https://dapi.kakao.com/v2/local/search/keyword.json";

export interface KakaoSearchStep {
  endpoint: string;
  query: string;
  candidateCount: number;
}

export interface KakaoGeocodeAttempt {
  candidate: GeocodeCandidate | null;
  assessment: ReturnType<typeof assessCandidates>;
  steps: KakaoSearchStep[];
  normalizedAddress: string;
  winningEndpoint: string;
  winningQuery: string;
  addressSearchHits: number;
  keywordSearchHits: number;
}

async function kakaoFetch<T>(
  endpoint: string,
  query: string,
  apiKey: string,
): Promise<T> {
  const url = new URL(endpoint);
  url.searchParams.set("query", query);
  url.searchParams.set("size", "5");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Kakao API HTTP ${response.status} (${endpoint})`);
  }

  return response.json() as Promise<T>;
}

function mapAddressDocuments(
  documents: Array<{ x: string; y: string; address_name?: string }>,
): GeocodeCandidate[] {
  return documents.map((doc) => ({
    latitude: Number(doc.y),
    longitude: Number(doc.x),
    matchedAddress: doc.address_name ?? "",
    rawPlaceName: "",
    roadAddress: doc.address_name ?? "",
  }));
}

function mapKeywordDocuments(
  documents: Array<{
    x: string;
    y: string;
    place_name?: string;
    address_name?: string;
    road_address_name?: string;
  }>,
): GeocodeCandidate[] {
  return documents.map((doc) => ({
    latitude: Number(doc.y),
    longitude: Number(doc.x),
    matchedAddress: doc.address_name ?? doc.road_address_name ?? "",
    rawPlaceName: doc.place_name ?? "",
    roadAddress: doc.road_address_name ?? "",
  }));
}

async function searchAddress(
  query: string,
  apiKey: string,
): Promise<GeocodeCandidate[]> {
  const data = await kakaoFetch<{ documents?: Array<{ x: string; y: string; address_name?: string }> }>(
    KAKAO_ADDRESS_ENDPOINT,
    query,
    apiKey,
  );
  return mapAddressDocuments(data.documents ?? []);
}

async function searchKeyword(
  query: string,
  apiKey: string,
): Promise<GeocodeCandidate[]> {
  const data = await kakaoFetch<{
    documents?: Array<{
      x: string;
      y: string;
      place_name?: string;
      address_name?: string;
      road_address_name?: string;
    }>;
  }>(KAKAO_KEYWORD_ENDPOINT, query, apiKey);
  return mapKeywordDocuments(data.documents ?? []);
}

export async function geocodeRowWithKakaoFallback(
  row: GeocodingInputRow,
  apiKey: string,
): Promise<KakaoGeocodeAttempt> {
  const steps: KakaoSearchStep[] = [];
  let addressSearchHits = 0;
  let keywordSearchHits = 0;

  const normalizedAddress = normalizeAddress(row.address, row.region, row.city);
  const addressQuery = buildAddressSearchQuery(
    row.address,
    row.region,
    row.city,
  );

  const tryCandidates = async (
    endpoint: string,
    query: string,
  ): Promise<GeocodeCandidate[]> => {
    const candidates =
      endpoint === KAKAO_ADDRESS_ENDPOINT
        ? await searchAddress(query, apiKey)
        : await searchKeyword(query, apiKey);

    steps.push({
      endpoint,
      query,
      candidateCount: candidates.length,
    });

    if (endpoint === KAKAO_ADDRESS_ENDPOINT) {
      addressSearchHits += candidates.length;
    } else {
      keywordSearchHits += candidates.length;
    }

    return candidates;
  };

  if (addressQuery) {
    const addressCandidates = await tryCandidates(
      KAKAO_ADDRESS_ENDPOINT,
      addressQuery,
    );
    const picked = pickBestCandidate(row, addressCandidates);
    if (picked.candidate && picked.assessment.status === "success") {
      return {
        ...picked,
        steps,
        normalizedAddress,
        winningEndpoint: KAKAO_ADDRESS_ENDPOINT,
        winningQuery: addressQuery,
        addressSearchHits,
        keywordSearchHits,
      };
    }
  }

  const keywordQueries = buildKeywordQueries(
    row.name,
    row.region,
    row.city,
    normalizedAddress,
  );

  for (const keywordQuery of keywordQueries) {
    const keywordCandidates = await tryCandidates(
      KAKAO_KEYWORD_ENDPOINT,
      keywordQuery,
    );
    if (keywordCandidates.length === 0) continue;

    const picked = pickBestCandidate(row, keywordCandidates);
    if (
      picked.candidate &&
      (picked.assessment.status === "success" ||
        picked.assessment.status === "low_confidence" ||
        picked.assessment.status === "multiple_candidates")
    ) {
      return {
        ...picked,
        steps,
        normalizedAddress,
        winningEndpoint: KAKAO_KEYWORD_ENDPOINT,
        winningQuery: keywordQuery,
        addressSearchHits,
        keywordSearchHits,
      };
    }
  }

  const nameAddressQuery = `${row.name} ${normalizedAddress}`.trim();
  if (nameAddressQuery) {
    const combinedCandidates = await tryCandidates(
      KAKAO_KEYWORD_ENDPOINT,
      nameAddressQuery,
    );
    const picked = pickBestCandidate(row, combinedCandidates);
    return {
      ...picked,
      steps,
      normalizedAddress,
      winningEndpoint: picked.candidate ? KAKAO_KEYWORD_ENDPOINT : "",
      winningQuery: picked.candidate ? nameAddressQuery : addressQuery,
      addressSearchHits,
      keywordSearchHits,
    };
  }

  return {
    candidate: null,
    assessment: assessCandidates(row, []),
    steps,
    normalizedAddress,
    winningEndpoint: "",
    winningQuery: addressQuery,
    addressSearchHits,
    keywordSearchHits,
  };
}

export function buildDebugSampleMarkdown(
  rows: GeocodingInputRow[],
  endpoint = KAKAO_ADDRESS_ENDPOINT,
): string {
  const lines = [
    "# Geocoding Debug Sample",
    "",
    `> Generated: ${new Date().toISOString()}`,
    "",
    "## no_result 20건 원인 추정 (수정 전)",
    "",
    "- master CSV 주소에 **시·도 접두(예: 강원특별자치도)가 없음**",
    "- geocoding_input query에 **골프장명+주소 혼합** → address search 부적합",
    "- Kakao address search는 **도로명/지번 + 시도** 형태를 선호",
    "",
    "## 샘플 20행 분석",
    "",
  ];

  rows.forEach((row, index) => {
    const normalized = normalizeAddress(row.address, row.region, row.city);
    const addressQuery = buildAddressSearchQuery(
      row.address,
      row.region,
      row.city,
    );

    let cause = "시·도 접두 없는 주소 — address search miss 가능";
    if (!row.query.trim()) cause = "query 비어 있음";
    else if (isAddressTooShort(row.address)) cause = "주소가 너무 짧음";
    else if (!isLikelyRoadOrJibunAddress(row.address)) {
      cause = "도로명/지번 패턴 약함 — keyword fallback 필요";
    } else if (row.query.includes(row.name)) {
      cause = "query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요";
    }

    lines.push(`### ${index + 1}. ${row.name}`);
    lines.push("");
    lines.push(`- **id:** ${row.id}`);
    lines.push(`- **region / city:** ${row.region} / ${row.city}`);
    lines.push(`- **address:** ${row.address}`);
    lines.push(`- **generated query (기존):** ${row.query}`);
    lines.push(`- **normalized address (신규):** ${normalized}`);
    lines.push(`- **address search query (신규):** ${addressQuery}`);
    lines.push(`- **query length:** ${row.query.length}`);
    lines.push(`- **query empty:** ${row.query.trim() ? "false" : "true"}`);
    lines.push(
      `- **도로명/지번 주소:** ${isLikelyRoadOrJibunAddress(row.address) ? "yes" : "weak"}`,
    );
    lines.push(`- **Kakao endpoint (기존):** ${endpoint}`);
    lines.push(`- **no_result 원인 추정:** ${cause}`);
    lines.push("");
  });

  return lines.join("\n");
}

export interface ReviewCandidate {
  rank: number;
  placeName: string;
  addressName: string;
  roadAddressName: string;
  latitude: number;
  longitude: number;
  confidence: number;
  query: string;
  endpoint: string;
  reason: string;
}

export async function fetchReviewCandidates(
  row: GeocodingInputRow,
  apiKey: string,
): Promise<ReviewCandidate[]> {
  const seen = new Set<string>();
  const collected: ReviewCandidate[] = [];

  const normalizedAddress = normalizeAddress(row.address, row.region, row.city);
  const addressQuery = buildAddressSearchQuery(
    row.address,
    row.region,
    row.city,
  );

  const queries: Array<{ endpoint: string; query: string }> = [];
  if (addressQuery) {
    queries.push({ endpoint: KAKAO_ADDRESS_ENDPOINT, query: addressQuery });
  }
  for (const keywordQuery of buildKeywordQueries(
    row.name,
    row.region,
    row.city,
    normalizedAddress,
  )) {
    queries.push({ endpoint: KAKAO_KEYWORD_ENDPOINT, query: keywordQuery });
  }

  for (const item of queries) {
    const candidates =
      item.endpoint === KAKAO_ADDRESS_ENDPOINT
        ? await searchAddress(item.query, apiKey)
        : await searchKeyword(item.query, apiKey);

    for (const candidate of candidates) {
      const key = `${candidate.latitude},${candidate.longitude},${candidate.rawPlaceName},${candidate.matchedAddress}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const confidence = scoreCandidate(row, candidate);
      collected.push({
        rank: 0,
        placeName: candidate.rawPlaceName,
        addressName: candidate.matchedAddress,
        roadAddressName: candidate.roadAddress,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        confidence,
        query: item.query,
        endpoint: item.endpoint.includes("address") ? "address" : "keyword",
        reason: `query="${item.query}" score=${confidence}`,
      });
    }
  }

  collected.sort((a, b) => b.confidence - a.confidence);
  return collected.slice(0, 5).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

export async function retryNoResultWithQueries(
  row: GeocodingInputRow,
  queries: string[],
  apiKey: string,
): Promise<{
  winningQuery: string;
  endpoint: string;
  status: string;
  confidence: number;
  candidateCount: number;
  candidates: ReviewCandidate[];
}> {
  const seen = new Set<string>();
  const allCandidates: ReviewCandidate[] = [];

  for (const query of queries) {
    const keywordCandidates = await searchKeyword(query, apiKey);
    if (keywordCandidates.length === 0) {
      const addressCandidates = await searchAddress(query, apiKey);
      for (const candidate of addressCandidates) {
        const key = `${candidate.latitude},${candidate.longitude}`;
        if (seen.has(key)) continue;
        seen.add(key);
        allCandidates.push({
          rank: 0,
          placeName: candidate.rawPlaceName,
          addressName: candidate.matchedAddress,
          roadAddressName: candidate.roadAddress,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          confidence: scoreCandidate(row, candidate),
          query,
          endpoint: "address",
          reason: `retry address query="${query}"`,
        });
      }
      continue;
    }

    for (const candidate of keywordCandidates) {
      const key = `${candidate.latitude},${candidate.longitude},${candidate.rawPlaceName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      allCandidates.push({
        rank: 0,
        placeName: candidate.rawPlaceName,
        addressName: candidate.matchedAddress,
        roadAddressName: candidate.roadAddress,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        confidence: scoreCandidate(row, candidate),
        query,
        endpoint: "keyword",
        reason: `retry keyword query="${query}"`,
      });
    }

    const assessment = assessCandidates(row, keywordCandidates);
    if (assessment.status === "success") {
      allCandidates.sort((a, b) => b.confidence - a.confidence);
      return {
        winningQuery: query,
        endpoint: "keyword",
        status: assessment.status,
        confidence: assessment.score,
        candidateCount: keywordCandidates.length,
        candidates: allCandidates.slice(0, 5).map((item, index) => ({
          ...item,
          rank: index + 1,
        })),
      };
    }
  }

  allCandidates.sort((a, b) => b.confidence - a.confidence);
  const top = allCandidates[0];
  if (!top) {
    return {
      winningQuery: "",
      endpoint: "",
      status: "no_result",
      confidence: 0,
      candidateCount: 0,
      candidates: [],
    };
  }

  const merged = allCandidates.slice(0, 5).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
  const assessment = assessCandidates(
    row,
    merged.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      matchedAddress: item.addressName,
      rawPlaceName: item.placeName,
      roadAddress: item.roadAddressName,
    })),
  );

  return {
    winningQuery: top.query,
    endpoint: top.endpoint,
    status: assessment.status,
    confidence: assessment.score,
    candidateCount: merged.length,
    candidates: merged,
  };
}
