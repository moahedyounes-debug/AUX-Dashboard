// Server-only helpers for reading public Google Sheets via the gviz CSV export.
// Runs inside server functions so the browser never makes cross-origin calls.

export const SHEETS = {
  tickets: { id: "1x796CMZf8b3RUNkqsanO56F_Wmo75L2uLzIlgE65doY", gid: "0" },
  parts: { id: "1jQvpH0ZA5V_JB0Y2uLBM-3_Bt9VurTbncAE4WDv4wUg", gid: "1518496575" },
  calls: { id: "1U-GUCKqShHLkqg4FvCur-T0Tic0cMAP1ou9hvoSw_FI", gid: "2031790486" },
  whatsapp: { id: "1U-GUCKqShHLkqg4FvCur-T0Tic0cMAP1ou9hvoSw_FI", gid: "998889607" },
  evaluation: { id: "1KDMVAKplmbNvfdd66Ha-TmJ3fm_6mD29F2AsT9UsqvE", gid: "1121662705" },
} as const;

export type SheetKey = keyof typeof SHEETS;

// Minimal RFC-4180-ish CSV parser (handles quotes, escaped quotes, newlines).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else if (c === "\r") {
      // ignore
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

export async function fetchSheet(key: SheetKey): Promise<string[][]> {
  const { id, gid } = SHEETS[key];
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to fetch ${key}: HTTP ${res.status}`);
  const text = await res.text();
  return parseCsv(text);
}

export const num = (v: string | undefined): number => {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const norm = (v: string | undefined): string => (v ?? "").trim();
