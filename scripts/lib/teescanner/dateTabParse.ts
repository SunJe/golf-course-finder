import type { Page } from "playwright";
import { sleep } from "./access";

export type DateTabMatchConfidence = "high" | "medium" | "low" | "none";

export interface DateTabCard {
  month: number | null;
  dayOfWeek: string;
  dayNumber: number;
  teamCount: number;
  isSelected: boolean;
  rawText: string;
}

export interface DateTabParseResult {
  cards: DateTabCard[];
  availableTeamCountFromDateTab: number | null;
  matchConfidence: DateTabMatchConfidence;
  selectedDateTabRawText: string;
  cardsSnapshot: string;
}

interface RawDateTabCard {
  month: number | null;
  dayOfWeek: string;
  dayNumber: number;
  teamCount: number;
  isSelected: boolean;
  rawText: string;
}

function formatCardsSnapshot(cards: DateTabCard[]): string {
  return cards
    .map((card) => {
      const monthPrefix = card.month != null ? `${card.month}/` : "";
      const selectedSuffix = card.isSelected ? " selected" : "";
      return `${monthPrefix}${card.dayNumber} ${card.dayOfWeek} ${card.teamCount}팀${selectedSuffix}`;
    })
    .join("\n");
}

function parseSelectedRoundDayParts(selectedRoundDay: string): {
  day: number;
  month: number;
} {
  const date = new Date(`${selectedRoundDay}T12:00:00`);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
  };
}

function monthMatches(
  cardMonth: number | null,
  targetMonth: number,
): boolean {
  return cardMonth == null || cardMonth === targetMonth;
}

export function matchDateTabToRoundDay(
  cards: DateTabCard[],
  selectedRoundDay: string,
): Pick<
  DateTabParseResult,
  "availableTeamCountFromDateTab" | "matchConfidence" | "selectedDateTabRawText"
> {
  const { day: targetDay, month: targetMonth } =
    parseSelectedRoundDayParts(selectedRoundDay);

  const dayMatches = cards.filter(
    (card) =>
      card.dayNumber === targetDay && monthMatches(card.month, targetMonth),
  );

  const dayAndSelected = dayMatches.filter((card) => card.isSelected);
  if (dayAndSelected.length === 1) {
    const card = dayAndSelected[0];
    return {
      availableTeamCountFromDateTab: card.teamCount,
      matchConfidence: "high",
      selectedDateTabRawText: card.rawText,
    };
  }
  if (dayAndSelected.length > 1) {
    return {
      availableTeamCountFromDateTab: null,
      matchConfidence: "none",
      selectedDateTabRawText: "",
    };
  }

  if (dayMatches.length === 1) {
    const card = dayMatches[0];
    return {
      availableTeamCountFromDateTab: card.teamCount,
      matchConfidence: "medium",
      selectedDateTabRawText: card.rawText,
    };
  }
  if (dayMatches.length > 1) {
    return {
      availableTeamCountFromDateTab: null,
      matchConfidence: "none",
      selectedDateTabRawText: "",
    };
  }

  const selectedOnly = cards.filter((card) => card.isSelected);
  if (selectedOnly.length === 1) {
    const card = selectedOnly[0];
    return {
      availableTeamCountFromDateTab: card.teamCount,
      matchConfidence: "low",
      selectedDateTabRawText: card.rawText,
    };
  }

  return {
    availableTeamCountFromDateTab: null,
    matchConfidence: "none",
    selectedDateTabRawText: "",
  };
}

function parseDateCardsFromSection(section: string): RawDateTabCard[] {
  const cards: RawDateTabCard[] = [];
  const seen = new Set<string>();

  const addCard = (card: RawDateTabCard) => {
    const key = `${card.month ?? "x"}-${card.dayNumber}-${card.dayOfWeek}-${card.teamCount}`;
    if (seen.has(key)) return;
    seen.add(key);
    cards.push(card);
  };

  for (const match of section.matchAll(
    /(?:^|\s)(?:(\d{1,2})\/)?(\d{1,2})\s*(일|월|화|수|목|금|토)\s*:?\s*(\d{1,3})\s*팀/g,
  )) {
    const month = match[1] ? Number.parseInt(match[1], 10) : null;
    const dayNumber = Number.parseInt(match[2], 10);
    const dayOfWeek = match[3];
    const teamCount = Number.parseInt(match[4], 10);
    if (
      dayNumber < 1 ||
      dayNumber > 31 ||
      teamCount <= 0 ||
      teamCount > 200
    ) {
      continue;
    }
    const monthPrefix = month != null ? `${month}/` : "";
    addCard({
      month,
      dayOfWeek,
      dayNumber,
      teamCount,
      isSelected: false,
      rawText: `${monthPrefix}${dayNumber} ${dayOfWeek} ${teamCount}팀`,
    });
  }

  for (const match of section.matchAll(
    /(일|월|화|수|목|금|토)\s*(\d{1,2})\s*:?\s*(\d{1,3})\s*팀/g,
  )) {
    const dayOfWeek = match[1];
    const dayNumber = Number.parseInt(match[2], 10);
    const teamCount = Number.parseInt(match[3], 10);
    if (
      dayNumber < 1 ||
      dayNumber > 31 ||
      teamCount <= 0 ||
      teamCount > 200
    ) {
      continue;
    }
    addCard({
      month: null,
      dayOfWeek,
      dayNumber,
      teamCount,
      isSelected: false,
      rawText: `${dayNumber} ${dayOfWeek} ${teamCount}팀`,
    });
  }

  for (const match of section.matchAll(
    /(?:^|\s)(\d{1,2})\s*(일|월|화|수|목|금|토)\s+(\d{1,3})\s*팀/g,
  )) {
    const dayNumber = Number.parseInt(match[1], 10);
    const dayOfWeek = match[2];
    const teamCount = Number.parseInt(match[3], 10);
    if (
      dayNumber < 1 ||
      dayNumber > 31 ||
      teamCount <= 0 ||
      teamCount > 200
    ) {
      continue;
    }
    addCard({
      month: null,
      dayOfWeek,
      dayNumber,
      teamCount,
      isSelected: false,
      rawText: `${dayNumber} ${dayOfWeek} ${teamCount}팀`,
    });
  }

  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let currentMonth: number | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const monthHeader = line.match(/^(\d{1,2})월$/);
    if (monthHeader) {
      currentMonth = Number.parseInt(monthHeader[1], 10);
      continue;
    }

    if (!WEEKDAYS.includes(line)) continue;

    const weekday = line;
    let dayNumber: number | null = null;
    let month: number | null = null;
    let teamCount: number | null = null;

    for (let offset = 1; offset <= 5 && index + offset < lines.length; offset += 1) {
      const next = lines[index + offset];
      if (WEEKDAYS.includes(next)) break;

      const monthDay = next.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (monthDay) {
        month = Number.parseInt(monthDay[1], 10);
        dayNumber = Number.parseInt(monthDay[2], 10);
        currentMonth = month;
        continue;
      }

      if (/^(내일|오늘)$/.test(next)) continue;

      const dayOnly = next.match(/^(\d{1,2})$/);
      if (dayOnly && dayNumber == null) {
        const value = Number.parseInt(dayOnly[1], 10);
        if (value >= 1 && value <= 31) dayNumber = value;
        continue;
      }

      const team = next.match(/^(\d{1,3})\s*팀$/);
      if (team) {
        teamCount = Number.parseInt(team[1], 10);
        break;
      }
    }

    if (
      dayNumber == null ||
      teamCount == null ||
      teamCount <= 0 ||
      teamCount > 200
    ) {
      continue;
    }

    const monthPrefix = month != null ? `${month}/` : "";
    addCard({
      month: month ?? currentMonth,
      dayOfWeek: weekday,
      dayNumber,
      teamCount,
      isSelected: false,
      rawText: `${monthPrefix}${dayNumber} ${weekday} ${teamCount}팀`,
    });
  }

  cards.sort((a, b) => {
    if (a.month != null && b.month != null && a.month !== b.month) {
      return a.month - b.month;
    }
    return a.dayNumber - b.dayNumber;
  });

  return cards;
}

function extractDateTabSection(bodyText: string): string {
  const calendarIdx = bodyText.indexOf("달력");
  const startIdx =
    calendarIdx >= 0 ? calendarIdx : bodyText.indexOf("티타임");
  if (startIdx < 0) return bodyText;

  const endIdx = bodyText.indexOf("시간대", startIdx + 5);
  return bodyText.slice(
    startIdx,
    endIdx > startIdx ? endIdx : startIdx + 2500,
  );
}

async function markSelectedDateCards(
  page: Page,
  cards: RawDateTabCard[],
): Promise<void> {
  const selectedKeys = await page.evaluate(() => {
    const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

    function elementClassName(node: Element): string {
      if (typeof node.className === "string") return node.className;
      const svgClass = node.className as { baseVal?: string };
      return svgClass?.baseVal || node.getAttribute("class") || "";
    }

    function isSelectedElement(el: Element): boolean {
      let node: Element | null = el;
      for (let depth = 0; depth < 6; depth += 1) {
        if (!node) break;
        if (node.getAttribute("aria-selected") === "true") return true;
        const cls = elementClassName(node);
        if (/selected|active|current|on\b/i.test(cls)) return true;
        const style = window.getComputedStyle(node as HTMLElement);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = Number.parseInt(match[1], 10);
          const g = Number.parseInt(match[2], 10);
          const b = Number.parseInt(match[3], 10);
          if (b > 120 && b > r + 20 && b > g) return true;
        }
        node = node.parentElement;
      }
      return false;
    }

    const selected: string[] = [];
    for (const el of document.querySelectorAll("div, span, button, a, li")) {
      const text = ((el as HTMLElement).innerText || "")
        .trim()
        .replace(/\r/g, "");
      if (!text || text.length > 80) continue;
      if (!/(일|월|화|수|목|금|토)/.test(text) || !/\d{1,3}\s*팀/.test(text)) {
        continue;
      }
      if (!isSelectedElement(el)) continue;

      const weekdayMatch = text.match(/(일|월|화|수|목|금|토)/);
      const teamMatch = text.match(/(\d{1,3})\s*팀/);
      if (!weekdayMatch || !teamMatch) continue;

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      let dayNumber: number | null = null;
      let month: number | null = null;
      for (const line of lines) {
        const monthDay = line.match(/^(\d{1,2})\/(\d{1,2})$/);
        if (monthDay) {
          month = Number.parseInt(monthDay[1], 10);
          dayNumber = Number.parseInt(monthDay[2], 10);
          continue;
        }
        const dayOnly = line.match(/^(\d{1,2})$/);
        if (dayOnly) {
          dayNumber = Number.parseInt(dayOnly[1], 10);
        }
      }
      if (dayNumber == null || !WEEKDAYS.includes(weekdayMatch[1])) continue;
      selected.push(`${month ?? "x"}-${dayNumber}-${weekdayMatch[1]}`);
    }
    return selected;
  });

  for (const card of cards) {
    const key = `${card.month ?? "x"}-${card.dayNumber}-${card.dayOfWeek}`;
    card.isSelected = selectedKeys.includes(key);
  }
}

async function collectDateTabCardsFromDom(page: Page): Promise<RawDateTabCard[]> {
  return page.evaluate(() => {
    const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

    function elementClassName(node: Element): string {
      if (typeof node.className === "string") return node.className;
      const svgClass = node.className as { baseVal?: string };
      return svgClass?.baseVal || node.getAttribute("class") || "";
    }

    function isSelectedElement(el: Element): boolean {
      let node: Element | null = el;
      for (let depth = 0; depth < 6; depth += 1) {
        if (!node) break;
        if (node.getAttribute("aria-selected") === "true") return true;
        const cls = elementClassName(node);
        if (/selected|active|current|on\b/i.test(cls)) return true;
        const style = window.getComputedStyle(node as HTMLElement);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = Number.parseInt(match[1], 10);
          const g = Number.parseInt(match[2], 10);
          const b = Number.parseInt(match[3], 10);
          if (b > 120 && b > r + 20 && b > g) return true;
        }
        node = node.parentElement;
      }
      return false;
    }

    function parseCardText(text: string, isSelected: boolean) {
      const normalized = text.replace(/\s+/g, " ").trim();
      if (!normalized || normalized.length > 100) return null;
      if (/\b([01]?\d|2[0-3]):[0-5]\d\b/.test(normalized)) return null;

      const teamMatch = normalized.match(/(\d{1,3})\s*팀/);
      const weekdayMatch = normalized.match(/(일|월|화|수|목|금|토)/);
      if (!teamMatch || !weekdayMatch) return null;

      let dayNumber: number | null = null;
      let month: number | null = null;
      const monthDay = normalized.match(/(\d{1,2})\/(\d{1,2})/);
      if (monthDay) {
        month = Number.parseInt(monthDay[1], 10);
        dayNumber = Number.parseInt(monthDay[2], 10);
      }
      if (dayNumber == null) {
        const dayMatch = normalized.match(/(?:^|\s)(\d{1,2})(?:\s|$)/);
        if (dayMatch) dayNumber = Number.parseInt(dayMatch[1], 10);
      }
      if (
        dayNumber == null ||
        dayNumber < 1 ||
        dayNumber > 31 ||
        !WEEKDAYS.includes(weekdayMatch[1])
      ) {
        return null;
      }

      const teamCount = Number.parseInt(teamMatch[1], 10);
      if (!Number.isFinite(teamCount) || teamCount <= 0 || teamCount > 200) {
        return null;
      }

      return {
        month,
        dayOfWeek: weekdayMatch[1],
        dayNumber,
        teamCount,
        isSelected,
        rawText: normalized,
      };
    }

    const cards: Array<{
      month: number | null;
      dayOfWeek: string;
      dayNumber: number;
      teamCount: number;
      isSelected: boolean;
      rawText: string;
    }> = [];
    const seen = new Set<string>();

    const candidates = document.querySelectorAll(
      '[aria-selected], button, a, [role="button"], div, span, li',
    );

    for (const el of candidates) {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!/\d{1,3}\s*팀/.test(text) || !/(일|월|화|수|목|금|토)/.test(text)) {
        continue;
      }
      const card = parseCardText(text, isSelectedElement(el));
      if (!card) continue;
      const key = `${card.month ?? "x"}-${card.dayNumber}-${card.dayOfWeek}-${card.teamCount}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cards.push(card);
    }

    cards.sort((a, b) => {
      if (a.month != null && b.month != null && a.month !== b.month) {
        return a.month - b.month;
      }
      return a.dayNumber - b.dayNumber;
    });

    return cards;
  });
}

async function collectDateTabCardsFromPage(
  page: Page,
): Promise<RawDateTabCard[]> {
  try {
    const bodyText = await page.locator("body").innerText();
    const section = extractDateTabSection(bodyText);
    let cards = parseDateCardsFromSection(section);
    if (cards.length === 0) {
      cards = parseDateCardsFromSection(bodyText);
    }
    if (cards.length === 0) {
      cards = await collectDateTabCardsFromDom(page);
    }
    if (cards.length === 0) {
      return [];
    }
    try {
      await markSelectedDateCards(page, cards);
    } catch {
      /* selection styling is auxiliary */
    }
    return cards;
  } catch {
    return [];
  }
}

export async function parseDateTabForSelectedDay(
  page: Page,
  selectedRoundDay: string,
): Promise<DateTabParseResult> {
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
  const dateRow = page
    .locator("text=/^(일|월|화|수|목|금|토)$/")
    .first();
  if ((await dateRow.count()) > 0) {
    await dateRow.scrollIntoViewIfNeeded().catch(() => undefined);
    await sleep(500);
  }

  const cards = await collectDateTabCardsFromPage(page);
  const match = matchDateTabToRoundDay(cards, selectedRoundDay);

  return {
    cards,
    cardsSnapshot: formatCardsSnapshot(cards),
    ...match,
  };
}
