import fs from "node:fs";
import path from "node:path";

/** 간단한 CSV 파서 (따옴표·쉼표 처리) */
export function parseCsv(content: string): { headers: string[]; rows: string[][] } {
  const text = content.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map((h) => h.trim());
  return { headers, rows: rows.slice(1) };
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function rowsToCsv(
  headers: string[],
  rows: string[][],
  options?: { crlf?: boolean },
): string {
  const lineBreak = options?.crlf ? "\r\n" : "\n";
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(
      headers.map((_, index) => escapeCsvField(row[index] ?? "")).join(","),
    );
  }
  return `${lines.join(lineBreak)}${lineBreak}`;
}

const WRITE_RETRY_MS = 1000;
const WRITE_RETRY_COUNT = 5;

function sleepSync(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* wait */
  }
}

function isEBUSY(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as NodeJS.ErrnoException).code;
  return code === "EBUSY" || /EBUSY|resource busy or locked/i.test(error.message);
}

function writePayloadOnce(filePath: string, payload: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, payload, "utf8");
}

export function writeFileUtf8Bom(filePath: string, content: string): void {
  const payload = `\uFEFF${content}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= WRITE_RETRY_COUNT; attempt += 1) {
    try {
      writePayloadOnce(filePath, payload);
      return;
    } catch (error) {
      lastError = error;
      if (!isEBUSY(error) || attempt === WRITE_RETRY_COUNT) {
        break;
      }
      console.warn(
        `[warn] EBUSY writing ${filePath} — retry ${attempt}/${WRITE_RETRY_COUNT} in ${WRITE_RETRY_MS}ms`,
      );
      sleepSync(WRITE_RETRY_MS);
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Failed to write ${filePath} after ${WRITE_RETRY_COUNT} attempts: ${message}. Close Excel/VS Code preview and retry.`,
  );
}

/** EBUSY 시 .tmp / timestamp backup 경로로 저장 시도. 실제 저장 경로 반환. */
export function writeFileUtf8BomWithFallback(
  filePath: string,
  content: string,
): string {
  const payload = `\uFEFF${content}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= WRITE_RETRY_COUNT; attempt += 1) {
    try {
      writePayloadOnce(filePath, payload);
      return filePath;
    } catch (error) {
      lastError = error;
      if (!isEBUSY(error)) throw error;
      if (attempt < WRITE_RETRY_COUNT) {
        console.warn(
          `[warn] EBUSY writing ${filePath} — retry ${attempt}/${WRITE_RETRY_COUNT} in ${WRITE_RETRY_MS}ms`,
        );
        sleepSync(WRITE_RETRY_MS);
      }
    }
  }

  const baseName = path.basename(filePath);
  console.error(`${baseName} is locked. Close Excel or VS Code preview.`);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  const dir = path.dirname(filePath);
  const stem = baseName.replace(/\.csv$/i, "");
  const fallbacks = [
    `${filePath}.tmp`,
    path.join(dir, `${stem}.${timestamp}.backup.csv`),
  ];

  for (const fallbackPath of fallbacks) {
    try {
      writePayloadOnce(fallbackPath, payload);
      console.warn(`Saved to ${fallbackPath} instead.`);
      return fallbackPath;
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Failed to write ${filePath} after ${WRITE_RETRY_COUNT} attempts and fallbacks: ${message}`,
  );
}

export function readFileUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

export function writeFileUtf8(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}
