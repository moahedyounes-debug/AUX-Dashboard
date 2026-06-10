// AUX ASC DASHBOARD · DATA (ported from live vanilla app)
import { CONFIG, sheetUrl } from "./config";

export type Row = Record<string, any>;

// ── CSV parser that handles multi-line quoted fields ──
export function parseCSV(text: string): Row[] {
  const raw = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let fields: string[] = [], cur = "", inQ = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i], nxt = raw[i + 1];
    if (ch === '"') {
      if (inQ && nxt === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      fields.push(cur.trim()); cur = "";
    } else if ((ch === "\n" || ch === "\r") && !inQ) {
      if (ch === "\r" && nxt === "\n") i++;
      fields.push(cur.trim()); rows.push(fields); fields = []; cur = "";
    } else { cur += ch; }
  }
  if (cur !== "" || fields.length) { fields.push(cur.trim()); rows.push(fields); }
  if (rows.length < 2) return [];
  const headers = rows[0];
  const uniqueHeaders: string[] = [];
  const headerCounts: Record<string, number> = {};
  headers.forEach((h, i) => {
    let key = h;
    if (!key) key = `__col_${i}`;
    else if (uniqueHeaders.includes(key)) {
      headerCounts[key] = (headerCounts[key] || 1) + 1;
      key = `${h}__${headerCounts[key]}`;
    }
    uniqueHeaders.push(key);
  });
  return rows.slice(1).map((vals) => {
    const o: Row = {};
    uniqueHeaders.forEach((h, i) => { o[h] = (vals[i] || "").trim(); });
    return o;
  }).filter((r) => Object.values(r).some((v) => v !== ""));
}

export function parseCSV_GD(text: string): Row[] {
  const all = parseCSV(text);
  const ticketCol = Object.keys(all[0] || {})[0] || "Ticket Number";
  return all.filter((r) => (r[ticketCol] || "").startsWith("GD"));
}

export async function fetchSheet(name: string): Promise<Row[]> {
  const r = await fetch(sheetUrl(name));
  if (!r.ok) throw new Error(`Cannot load sheet: ${name}`);
  return parseCSV(await r.text());
}

export async function fetchDataSheet(): Promise<Row[]> {
  const r = await fetch(sheetUrl(CONFIG.DATA_SHEET));
  if (!r.ok) throw new Error("Cannot load data sheet");
  return parseCSV_GD(await r.text());
}

export function extractCompany(n?: string): string {
  if (!n) return "";
  const lower = n.toLowerCase();
  if (lower.includes("zam")) return "ZAM";
  if (lower.includes("wifex") || lower.includes("authorized maintenance and operations")) return "wiFEX";
  if (lower.includes("classic")) return "Classic";
  if (lower.includes("dozn")) return "DOZN";
  if (lower.includes("abl")) return "ABL";
  return "";
}

const CITY_NORMALIZE: Record<string, string> = {
  "khamis musheet": "Khamis Mushait", "khamis mushayt": "Khamis Mushait",
  "khamis mushyat": "Khamis Mushait", "khamis musheit": "Khamis Mushait",
  "khamis mushyt": "Khamis Mushait", "hamis mushait": "Khamis Mushait",
  "makkah al mukarramah": "Makkah", "makkah al-mukarramah": "Makkah",
  "mecca": "Makkah", "mekka": "Makkah",
  "al madinah": "Madinah", "al madinah al munawwarah": "Madinah",
  "al-madinah": "Madinah", "medina": "Madinah", "madina": "Madinah",
  "madinah al munawwarah": "Madinah",
  "al hasa": "Alhasa", "al-hasa": "Alhasa", "al ahsa": "Alhasa",
  "al-ahsa": "Alhasa", "ahsa": "Alhasa",
  "jiddah": "Jeddah", "jedda": "Jeddah",
  "al qassim": "Qassim", "al-qassim": "Qassim", "qaseem": "Qassim",
  "qasim": "Qassim", "buraydah": "Qassim", "al buraydah": "Qassim",
  "al-buraydah": "Qassim", "buraidah": "Qassim", "al buraidah": "Qassim",
  "unayzah": "Qassim", "unaizah": "Qassim", "onaizah": "Qassim",
  "jazan": "Jizan", "jizan": "Jizan",
  "al taif": "Taif", "at-taif": "Taif", "at-ta'if": "Taif", "ta'if": "Taif",
  "ha'il": "Hail",
  "ar riyadh": "Riyadh", "ar-riyadh": "Riyadh",
  "ad dammam": "Dammam", "ad-dammam": "Dammam",
  "tabuk city": "Tabuk",
  "alkharj": "Al Kharj", "al-kharj": "Al Kharj",
  "al-baha": "Al Baha", "albaha": "Al Baha",
  "al qunfudah": "Al Qunfudhah", "al-qunfudhah": "Al Qunfudhah", "qunfudhah": "Al Qunfudhah",
  "hafar albatin": "Hafar Al Batin", "hafar-al-batin": "Hafar Al Batin",
  "yanbo": "Yanbu", "yanbu al-bahr": "Yanbu",
  "najran city": "Najran", "sakakah": "Sakaka",
  "rabegh": "Rabigh", "rabigh city": "Rabigh",
  "besha": "Bisha", "bisah": "Bisha",
};

export function normalizeCityName(city?: string): string {
  if (!city) return city || "";
  const trimmed = city.trim();
  return CITY_NORMALIZE[trimmed.toLowerCase()] || trimmed;
}

export function extractBranch(n?: string): string | null {
  if (!n) return null;
  const company = extractCompany(n);
  if (!company) return null;
  const dashIdx = n.lastIndexOf("-");
  if (dashIdx === -1) return null;
  let city = n.substring(dashIdx + 1).trim();
  city = city.replace(/\s*branch\s*/i, "").trim();
  city = normalizeCityName(city);
  if (!city) return null;
  return `${city} - ${company}`;
}

export function parseDate(s?: string): Date | null {
  if (!s) return null;
  const str = s.trim();
  if (!str || str === "—" || str === "-") return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.replace(" ", "T"));
    if (!isNaN(d.getTime())) return d;
  }
  const mo: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const m1 = str.match(/^(\d{1,2})\s+([A-Za-z]{3})[,\s]+(\d{4})?\s*(\d{1,2}):(\d{2})/);
  if (m1) {
    const [, day, mon, yr, hr, min] = m1;
    const month = mo[mon] ?? mo[mon.slice(0, 3)];
    if (month !== undefined) {
      const year = yr ? parseInt(yr) : new Date().getFullYear();
      return new Date(year, month, +day, +hr, +min);
    }
  }
  const m2 = str.match(/^(\d{1,2})\s+([A-Za-z]{3})[,\s]+(\d{4})$/);
  if (m2) {
    const month = mo[m2[2]];
    if (month !== undefined) return new Date(+m2[3], month, +m2[1]);
  }
  const m3 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:(\d{1,2}):(\d{2}))?/);
  if (m3) {
    const [, a, b, y, h = "0", min = "0"] = m3;
    let month: number, day: number;
    if (+b > 12) { month = +a - 1; day = +b; }
    else if (+a > 12) { month = +b - 1; day = +a; }
    else { month = +b - 1; day = +a; }
    return new Date(+y, month, day, +h, +min);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

const MONTHS3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(d?: Date | null): string {
  if (!d) return "—";
  try { return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}
export function fmtDateTime(d?: Date | null): string {
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${dd} ${MONTHS3[d.getMonth()]}, ${hh}:${mm}`;
}
export function fmtTime(d?: Date | null): string {
  if (!d) return "—";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function enrichRow(row: Row): Row {
  const C = CONFIG.COLS;
  const r: Row = { ...row };
  r._company = extractCompany(r[C.PROVIDER_NAME]);
  r._branch = extractBranch(r[C.PROVIDER_NAME]);
  r._validTicket = (r[C.TICKET_NUM] || "").startsWith("GD");
  r._created = parseDate(r[C.CREATED]);
  r._dispatch = parseDate(r[C.DISPATCH]);
  r._completion = parseDate(r[C.COMPLETION_TIME]);
  r._rescheduled = parseDate(r[C.RESCHEDULING]);
  r._appointed = parseDate(r[C.APPOINTED]);

  const affiliated = (r[C.AFFILIATED] || "").trim();
  const completion = (r[C.COMPLETION_RESULT] || "").trim();
  const completionLow = completion.toLowerCase();
  const phase = (r[C.PHASE] || "").trim();
  const phaseLow = phase.toLowerCase();
  const status = (r[C.STATUS] || "").trim();
  const statusLow = status.toLowerCase();
  const serviceInfo = r[C.SERVICE_INFO] || r[C.SERVICE_TYPE] || "";
  const serviceInfoUp = serviceInfo.toUpperCase();

  r._isPending = affiliated !== "" && completion === "";
  r._isRejected = (phaseLow.includes("refusal") || statusLow.includes("rejected")) && completion !== "" && !completionLow.includes("cancel");
  r._isReturned = (phaseLow.includes("rejected upon review") || statusLow.includes("returned")) && completion !== "" && !completionLow.includes("cancel");
  r._isOBMStatement = completionLow.includes("cancel") && serviceInfoUp.includes("OBM");
  r._isCancelled = completionLow.includes("cancel") && !serviceInfoUp.includes("OBM");

  const sh = parseFloat(r[C.SERVICE_HOURS]); r._serviceHours = isNaN(sh) ? null : sh;
  const mi = parseFloat(r[C.MILEAGE]); r._mileage = isNaN(mi) ? null : mi;
  r._farDistance = r._mileage !== null && r._mileage > 60;
  r._hasWorker = !!(r[C.WORKER] && r[C.WORKER].trim());

  const now = new Date();
  if (r._isPending && r._dispatch) r._agingHours = (+now - +r._dispatch) / 3600000;
  else if (!r._isPending && r._completion && r._dispatch) r._agingHours = (+r._completion - +r._dispatch) / 3600000;
  else if (r._dispatch) r._agingHours = (+now - +r._dispatch) / 3600000;
  else r._agingHours = null;

  if (r._dispatch) {
    const end = r._completion || new Date();
    r._pendingDurationHrs = (+end - +r._dispatch) / 3600000;
  } else r._pendingDurationHrs = null;

  r._monthKey = r._created ? `${r._created.getFullYear()}-${String(r._created.getMonth() + 1).padStart(2, "0")}` : "";
  r._rescheduleReason = r[C.RESCHED_REASON] || "";
  r._rescheduleDate = r[C.RESCHEDULING] || "";
  r._rescheduleRemark = r[C.RESCHED_SUPP] || "";
  r._rescheduleDisplay = [
    r._rescheduleDate ? "Date: " + r._rescheduleDate.substring(0, 10) : "",
    r._rescheduleRemark ? r._rescheduleRemark : "",
  ].filter(Boolean).join(" · ") || "—";
  r._hasRescheduleReason = !!(r[C.RESCHED_REASON] && r[C.RESCHED_REASON].trim());
  r._ticketStatus = status;
  r._phase = phase;

  const phaseLowTrimmed = phaseLow.trim();
  const statusLowTrimmed = statusLow.trim();
  let baseLabel = "", baseColor = "gray";
  if (phaseLowTrimmed.includes("dispatch network")) { baseLabel = "Not assigned"; baseColor = "red"; }
  else if (phaseLowTrimmed.includes("branch dispatching")) { baseLabel = "Dispatched But Not Accepted By Technician"; baseColor = "amber"; }
  else if (phaseLowTrimmed.includes("accepting orders")) { baseLabel = "Accepted By Technician"; baseColor = "orange"; }
  else if (phaseLowTrimmed.includes("change of appointment time") && statusLowTrimmed.includes("dispatched")) { baseLabel = "Dispatched & appointment updated But Not Accepted By Technician"; baseColor = "amber"; }
  else if (phaseLowTrimmed.includes("change of appointment time") && statusLowTrimmed.includes("accepted")) { baseLabel = "Accepted By Technician"; baseColor = "green"; }
  else if (phaseLowTrimmed.includes("statement")) { baseLabel = "Completed"; baseColor = "green"; }
  else if (phaseLowTrimmed.includes("change of schedule")) { baseLabel = "Accepted By Technician"; baseColor = "green"; }
  else if (phaseLowTrimmed.includes("completion confirmation")) { baseLabel = "Completed"; baseColor = "green"; }
  else if (phaseLowTrimmed.includes("rejected upon review")) { baseLabel = "Rejected"; baseColor = "red"; }
  else if (phaseLowTrimmed.includes("order creation")) { baseLabel = "Created but not assigned to SVC Center"; baseColor = "red"; }
  else { baseLabel = phase || status || "—"; baseColor = "gray"; }

  let finalLabel = baseLabel;
  const hasAppointment = r._rescheduled;
  const hasReason = r._hasRescheduleReason || r._rescheduleRemark;
  const alreadyHasAppointment = baseLabel.toLowerCase().includes("appointment");
  if (r._isPending && !alreadyHasAppointment) {
    if (hasAppointment && hasReason) finalLabel += " and appointment and reason updated";
    else if (hasAppointment) finalLabel += " and appointment updated";
    else if (hasReason) finalLabel += " and reason updated";
  }
  r._phaseLabel = finalLabel;
  r._phaseColor = baseColor;
  r._isNotAssigned = phaseLowTrimmed.includes("dispatch network");
  r._isDispatchedWork = phaseLowTrimmed.includes("branch dispatching");

  if (r._agingHours === null) r._agingCat = "—";
  else if (r._agingHours <= 12) r._agingCat = "≤ 12h";
  else if (r._agingHours <= 24) r._agingCat = "≤ 24h";
  else if (r._agingHours <= 48) r._agingCat = "≤ 48h";
  else if (r._agingHours <= 72) r._agingCat = "≤ 72h";
  else r._agingCat = "> 72h";
  return r;
}

export interface LoadedData {
  allRaw: Row[];
  raw: Row[];
  isAdmin: boolean;
  userASC: string;
  loadedAt: Date;
}

// Loads + enriches the main ticket sheet. userASC = 'All' for admin.
export async function loadAllData(userASC: string = CONFIG.ALL_ACCESS): Promise<LoadedData> {
  const rawRows = await fetchDataSheet();
  const reasonMap: Record<string, string> = {};
  try {
    const reasonRows = await fetchSheet("Penidng Reason");
    reasonRows.forEach((r) => {
      const reason = (r["Reason For Rescheduling"] || "").trim();
      const cat = (r["Category"] || "").trim();
      if (reason && cat) reasonMap[reason.toLowerCase()] = cat;
    });
  } catch { /* fallback */ }

  const enriched = rawRows
    .map((r) => {
      const row = enrichRow(r);
      row._reasonCategory = row._rescheduleReason && reasonMap[row._rescheduleReason.toLowerCase()]
        ? reasonMap[row._rescheduleReason.toLowerCase()] : "";
      return row;
    })
    .filter((r) => r._company && r._branch && !r._isCancelled);

  const isAdmin = userASC === CONFIG.ALL_ACCESS;
  return {
    allRaw: [...enriched],
    raw: isAdmin ? [...enriched] : enriched.filter((r) => r._company === userASC),
    isAdmin,
    userASC,
    loadedAt: new Date(),
  };
}

export interface TicketFilters {
  from?: string; to?: string; branch?: string; worker?: string; company?: string;
}

export function applyFilters(data: LoadedData, f: TicketFilters): Row[] {
  let src = data.isAdmin ? data.allRaw : data.raw;
  if (data.isAdmin && f.company) src = src.filter((r) => r._company === f.company);
  return src.filter((r) => {
    if (f.from && r._created && r._created < new Date(f.from)) return false;
    if (f.to && r._created && r._created > new Date(f.to + "T23:59:59")) return false;
    if (f.branch && r._branch !== f.branch) return false;
    if (f.worker && r[CONFIG.COLS.WORKER] !== f.worker) return false;
    return true;
  });
}

// ── Helpers ──
export function groupByMonth(rows: Row[]): [string, Row[]][] {
  const m: Record<string, Row[]> = {};
  rows.forEach((r) => { if (!r._monthKey) return; (m[r._monthKey] ||= []).push(r); });
  return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
}
export function groupBy(rows: Row[], fn: (r: Row) => any): Record<string, Row[]> {
  const m: Record<string, Row[]> = {};
  rows.forEach((r) => { const k = fn(r) || "(Unknown)"; (m[k] ||= []).push(r); });
  return m;
}
export function avg(rows: Row[], fn: (r: Row) => number | null): number | null {
  const v = rows.map(fn).filter((x): x is number => x !== null && !isNaN(x as number));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
export function fmt(n: number | null | undefined, d = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString("en", { maximumFractionDigits: d, minimumFractionDigits: d });
}
export function fmtPct(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toFixed(d) + "%";
}
export function formatMonthLabel(ym: string): string {
  if (!ym) return "—";
  const [y, m] = ym.split("-");
  return MONTHS3[parseInt(m) - 1] + " " + y;
}
export function truncate(s: string, n: number): string {
  if (!s) return "—";
  return s.length > n ? s.substring(0, n) + "…" : s;
}