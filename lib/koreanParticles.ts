/**
 * 한글 조사 유틸리티.
 * 영문·숫자·괄호가 섞인 골프장명은 종성 판별이 불안정하므로,
 * 조사 부착보다 문장 구조를 바꾸는 쪽을 우선한다.
 */

function lastHangulSyllable(text: string): string | null {
  const cleaned = text.replace(/[\s()[\]{}«»"'_\-·.,/\\]+$/g, "");
  for (let i = cleaned.length - 1; i >= 0; i -= 1) {
    const ch = cleaned[i];
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return ch;
  }
  return null;
}

function hasFinalConsonant(hangul: string): boolean {
  const code = hangul.charCodeAt(0);
  return (code - 0xac00) % 28 !== 0;
}

/** 종성 여부를 신뢰할 수 있을 때만 true/false, 그 외 null */
export function tryHasBatchim(word: string): boolean | null {
  const syllable = lastHangulSyllable(word);
  if (!syllable) return null;
  return hasFinalConsonant(syllable);
}

export function attachTopicParticle(word: string): string {
  const batchim = tryHasBatchim(word);
  if (batchim === null) return `${word}의`;
  return batchim ? `${word}은` : `${word}는`;
}

export function formatCourseDisplayName(name: string): string {
  return name
    .trim()
    .replace(/\bcc\b/gi, "CC")
    .replace(/\bgc\b/gi, "GC");
}

/** "충청·충주시"처럼 광역·시군이 중복 결합된 표기를 자연스럽게 줄인다 */
export function formatNaturalLocationLabel(
  region?: string | null,
  city?: string | null,
): string {
  const regionTrim = region?.trim() ?? "";
  const cityTrim = city?.trim() ?? "";
  if (!regionTrim && !cityTrim) return "";
  if (!regionTrim) return cityTrim;
  if (!cityTrim) return regionTrim;

  // 시·군·구가 있으면 광역 중복 표기 대신 시군만 우선
  if (/[시군구]$/.test(cityTrim)) return cityTrim;

  if (cityTrim.startsWith(regionTrim) || regionTrim.includes(cityTrim)) {
    return cityTrim.length >= regionTrim.length ? cityTrim : regionTrim;
  }

  return `${regionTrim} ${cityTrim}`;
}

export function looksLikeSoftParticleTemplate(text: string): boolean {
  return /은\(는\)|이\(가\)|을\(를\)|와\(과\)/.test(text);
}
