import fs from "node:fs";

export function normalizeCsvHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim();
}

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

  const headers = rows[0].map((header) => header.trim());
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

export function readCsvWithBom(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    return buffer.subarray(3).toString("utf8");
  }
  return buffer.toString("utf8");
}

export function writeFileUtf8Bom(filePath: string, content: string): void {
  fs.writeFileSync(filePath, `\uFEFF${content}`, "utf8");
}
