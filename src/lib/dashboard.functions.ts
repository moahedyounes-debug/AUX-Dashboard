import { createServerFn } from "@tanstack/react-start";
import { fetchSheet, num, norm } from "./sheets.server";

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sortMonths<T extends { month: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const ai = MONTH_ORDER.indexOf(a.month.slice(0, 3));
    const bi = MONTH_ORDER.indexOf(b.month.slice(0, 3));
    return ai - bi;
  });
}

function hmsToSeconds(v: string): number {
  const p = norm(v).split(":").map((x) => parseInt(x, 10));
  if (p.some((n) => Number.isNaN(n))) return 0;
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
}
function secToMMSS(s: number): string {
  if (!s) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

// ---------------- SERVICE TICKETS ----------------
export const getServiceKpis = createServerFn({ method: "GET" }).handler(async () => {
  const rows = (await fetchSheet("tickets")).slice(1).filter((r) => norm(r[0]));
  let total = 0, completed = 0, w48 = 0, w72 = 0, completedWithHours = 0;
  const byMonth: Record<string, { c: number; w48: number; w72: number }> = {};
  const byBranch: Record<string, { completed: number; pending: number }> = {};
  const reasons: Record<string, number> = {};
  const lines: Record<string, { tickets: number; completed: number }> = {};

  for (const r of rows) {
    total++;
    const productLine = norm(r[1]) || "Other";
    const branch = (norm(r[2]) || "Unknown").replace(/\s*-\s*/, " - ");
    const isCompleted = norm(r[20]).length > 0;
    const hours = num(r[21]);
    const month = norm(r[14]).slice(0, 7); // YYYY-MM
    const reason = norm(r[26]);

    lines[productLine] = lines[productLine] || { tickets: 0, completed: 0 };
    lines[productLine].tickets++;
    byBranch[branch] = byBranch[branch] || { completed: 0, pending: 0 };

    if (isCompleted) {
      completed++;
      lines[productLine].completed++;
      byBranch[branch].completed++;
      if (hours > 0) {
        completedWithHours++;
        const within48 = hours <= 48, within72 = hours <= 72;
        if (within48) w48++;
        if (within72) w72++;
        if (month) {
          byMonth[month] = byMonth[month] || { c: 0, w48: 0, w72: 0 };
          byMonth[month].c++;
          if (within48) byMonth[month].w48++;
          if (within72) byMonth[month].w72++;
        }
      }
    } else {
      byBranch[branch].pending++;
    }
    if (reason) reasons[reason] = (reasons[reason] || 0) + 1;
  }

  const pending = total - completed;
  const monthlyRepairRate = Object.entries(byMonth)
    .map(([month, v]) => ({
      month: monthLabel(month),
      rate48h: pct(v.w48, v.c),
      rate72h: pct(v.w72, v.c),
      target48: 80, target72: 90,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const branchPerformance = Object.entries(byBranch)
    .map(([branch, v]) => ({
      branch, completed: v.completed, pending: v.pending,
      rate: pct(v.completed, v.completed + v.pending),
    }))
    .sort((a, b) => b.completed + b.pending - (a.completed + a.pending))
    .slice(0, 8);

  const rescheduledReasons = Object.entries(reasons)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const productLinePerformance = Object.entries(lines)
    .map(([line, v]) => ({ line, tickets: v.tickets, rate: pct(v.completed, v.tickets) }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 6);

  return {
    kpis: {
      total, pending, completed,
      pendingRate: pct(pending, total),
      rate48h: pct(w48, completedWithHours),
      rate72h: pct(w72, completedWithHours),
    },
    monthlyRepairRate, branchPerformance, rescheduledReasons, productLinePerformance,
  };
});

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const idx = parseInt(m, 10) - 1;
  return MONTH_ORDER[idx] ? `${MONTH_ORDER[idx]} ${y?.slice(2)}` : ym;
}

// ---------------- CALL CENTER ----------------
export const getCallCenterKpis = createServerFn({ method: "GET" }).handler(async () => {
  const rows = (await fetchSheet("calls")).slice(1).filter((r) => norm(r[12]));
  let totalIB = 0, answeredIB = 0, withinSLA = 0, abandonedIB = 0;
  let ahtSum = 0, ahtN = 0, thtSum = 0, thtN = 0;
  const byMonth: Record<string, { totalIB: number; answered: number; within: number; abandoned: number }> = {};
  const byQueue: Record<string, number> = {};

  for (const r of rows) {
    const callType = norm(r[13]).toUpperCase();
    if (callType !== "IB") continue;
    const status = norm(r[12]).toUpperCase();
    const month = norm(r[15]) || "—";
    const within = norm(r[24]) === "1";
    const queue = norm(r[2]) || "Unknown";
    const isAbandon = status.includes("ABANDON");
    const isAnswered = status.includes("ANSWER");

    totalIB++;
    byMonth[month] = byMonth[month] || { totalIB: 0, answered: 0, within: 0, abandoned: 0 };
    byMonth[month].totalIB++;
    byQueue[queue] = (byQueue[queue] || 0) + 1;

    if (isAnswered) {
      answeredIB++;
      byMonth[month].answered++;
      if (within) { withinSLA++; byMonth[month].within++; }
      const aht = hmsToSeconds(r[9]); if (aht) { ahtSum += aht; ahtN++; }
      const tht = hmsToSeconds(r[10]); if (tht) { thtSum += tht; thtN++; }
    }
    if (isAbandon) { abandonedIB++; byMonth[month].abandoned++; }
  }

  const monthly = sortMonths(
    Object.entries(byMonth).map(([month, v]) => ({
      month,
      slaRate: pct(v.within, v.answered),
      abandonRate: pct(v.abandoned, v.totalIB),
      totalIB: v.totalIB, answered: v.answered,
    })),
  );

  const callsByQueue = Object.entries(byQueue)
    .map(([queue, calls]) => ({ queue, calls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 6);

  // WhatsApp
  let whatsapp: { month: string; messages: number }[] = [];
  try {
    const wa = (await fetchSheet("whatsapp")).slice(1).filter((r) => norm(r[6]));
    const waByMonth: Record<string, number> = {};
    for (const r of wa) {
      const month = norm(r[13]) || norm(r[6]).slice(0, 7);
      waByMonth[month] = (waByMonth[month] || 0) + 1;
    }
    whatsapp = sortMonths(Object.entries(waByMonth).map(([month, messages]) => ({ month, messages })));
  } catch { /* ignore */ }

  return {
    kpis: {
      totalIB, answeredIB, withinSLA, abandonedIB,
      slaRate: pct(withinSLA, answeredIB),
      abandonRate: pct(abandonedIB, totalIB),
      avgAHT: secToMMSS(ahtN ? ahtSum / ahtN : 0),
      avgTHT: secToMMSS(thtN ? thtSum / thtN : 0),
    },
    monthly, callsByQueue, whatsapp,
  };
});

// ---------------- AGENT EVALUATION ----------------
export const getEvaluations = createServerFn({ method: "GET" }).handler(async () => {
  const rows = (await fetchSheet("evaluation")).slice(1).filter((r) => norm(r[0]));
  const byAgent: Record<string, { sum: number; n: number; cats: Record<string, { s: number; n: number }> }> = {};
  for (const r of rows) {
    const agent = norm(r[0]);
    const category = norm(r[3]) || "General";
    const score = num(r[6]); // Score (1-5)
    if (!agent || !score) continue;
    byAgent[agent] = byAgent[agent] || { sum: 0, n: 0, cats: {} };
    byAgent[agent].sum += score;
    byAgent[agent].n++;
    byAgent[agent].cats[category] = byAgent[agent].cats[category] || { s: 0, n: 0 };
    byAgent[agent].cats[category].s += score;
    byAgent[agent].cats[category].n++;
  }
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return Object.entries(byAgent)
    .map(([agent, v]) => ({
      agent,
      overall: round1(v.sum / v.n),
      categories: Object.entries(v.cats).map(([name, c]) => ({ name, score: round1(c.s / c.n) })),
    }))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 12);
});

// ---------------- SPARE PARTS ----------------
export const getSparePartsKpis = createServerFn({ method: "GET" }).handler(async () => {
  const rows = (await fetchSheet("parts")).slice(1).filter((r) => norm(r[6]) || norm(r[10]));
  const skus = new Set<string>();
  let totalStock = 0, lowStock = 0, outOfStock = 0, reorder = 0;
  const byBranch: Record<string, { skus: Set<string>; stock: number }> = {};
  let amtA = 0, amtB = 0, amtC = 0;

  for (const r of rows) {
    const code = norm(r[6]) || norm(r[10]);
    const branch = norm(r[5]) || norm(r[4]) || "Main WH";
    const qty = num(r[13]);
    const amount = num(r[14]);
    skus.add(code);
    totalStock += qty;
    if (qty <= 0) outOfStock++;
    else if (qty < 5) lowStock++;
    if (qty < 10) reorder++;
    byBranch[branch] = byBranch[branch] || { skus: new Set(), stock: 0 };
    byBranch[branch].skus.add(code);
    byBranch[branch].stock += qty;
    if (amount >= 500) amtA++; else if (amount >= 100) amtB++; else amtC++;
  }

  const branchStock = Object.entries(byBranch)
    .map(([branch, v]) => ({ branch, skus: v.skus.size, stock: v.stock }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 6);

  const totalClass = amtA + amtB + amtC || 1;
  const abcClassification = [
    { name: "A (High value)", value: Math.round((amtA / totalClass) * 100) },
    { name: "B (Medium)", value: Math.round((amtB / totalClass) * 100) },
    { name: "C (Low)", value: Math.round((amtC / totalClass) * 100) },
  ];

  return {
    kpis: {
      totalSkus: skus.size,
      totalStock: Math.round(totalStock),
      lowStock, outOfStock, reorderAlert: reorder,
    },
    branchStock, abcClassification,
  };
});
