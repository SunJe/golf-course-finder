import fs from "node:fs";

export interface EncodingResult {
  encoding: string;
  content: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

function countHangul(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) count += 1;
  }
  return count;
}

function countReplacementChars(text: string): number {
  return (text.match(/\uFFFD/g) ?? []).length;
}

/** UTF-8 우선, 한글 비율·BOM으로 인코딩 추정 */
export function readCsvWithEncodingGuess(filePath: string): EncodingResult {
  const buffer = fs.readFileSync(filePath);

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    return {
      encoding: "UTF-8 (BOM)",
      content: buffer.subarray(3).toString("utf8"),
      confidence: "high",
      notes: "BOM detected",
    };
  }

  const utf8 = buffer.toString("utf8");
  const sample = utf8.slice(0, 4000);
  const hangul = countHangul(sample);
  const replacements = countReplacementChars(sample);
  const lines = sample.split("\n").filter(Boolean);
  const firstLine = lines[0] ?? "";

  if (replacements === 0 && hangul > 0) {
    return {
      encoding: "UTF-8",
      content: utf8,
      confidence: "high",
      notes: `Hangul chars in sample: ${hangul}`,
    };
  }

  if (replacements === 0 && /[a-zA-Z0-9_,]/.test(firstLine)) {
    return {
      encoding: "UTF-8 (ASCII)",
      content: utf8,
      confidence: "high",
      notes: "ASCII-dominant header",
    };
  }

  if (replacements > 0 || (hangul === 0 && buffer.length > 50)) {
    return {
      encoding: "Unknown (possibly CP949/EUC-KR)",
      content: utf8,
      confidence: "low",
      notes:
        "UTF-8 decode may be incorrect. Re-save as UTF-8 or convert from CP949 before merge.",
    };
  }

  return {
    encoding: "UTF-8",
    content: utf8,
    confidence: "medium",
    notes: "Default UTF-8 assumption",
  };
}
