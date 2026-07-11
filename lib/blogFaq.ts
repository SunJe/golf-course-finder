export type BlogFaqItem = {
  question: string;
  answer: string;
};

/** "질문? — 답변" 또는 "질문? - 답변" 형태 FAQ body 파싱 */
export function parseBlogFaqItems(body: string[]): BlogFaqItem[] {
  const items: BlogFaqItem[] = [];
  for (const paragraph of body) {
    const text = paragraph.trim();
    if (!text) continue;
    const match = text.match(/^(.+?[?？])\s*[—–\-−]\s*([\s\S]+)$/);
    if (!match) continue;
    const question = match[1].trim();
    const answer = match[2].trim();
    if (!question || !answer) continue;
    items.push({ question, answer });
  }
  return items;
}

export function isBlogFaqSection(heading: string): boolean {
  return heading.trim() === "자주 묻는 질문";
}
