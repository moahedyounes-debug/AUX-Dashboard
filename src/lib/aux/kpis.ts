// AUX ASC DASHBOARD · KPIs (ported from live vanilla app)
import { CONFIG } from "./config";
import { Row, groupBy, groupByMonth, formatMonthLabel } from "./data";

export const KPI = {
  pending(rows: Row[]) { return rows.filter((r) => r._isPending); },
  pendingRate(rows: Row[]) { return rows.length ? (rows.filter((r) => r._isPending).length / rows.length * 100) : null; },
  completed(rows: Row[]) { return rows.filter((r) => !r._isPending); },
  rate48h(rows: Row[]) {
    const d = rows.filter((r) => !r._isPending && r._serviceHours !== null);
    return d.length ? (d.filter((r) => r._serviceHours <= 48).length / d.length * 100) : null;
  },
  rate72h(rows: Row[]) {
    const d = rows.filter((r) => !r._isPending && r._serviceHours !== null);
    return d.length ? (d.filter((r) => r._serviceHours <= 72).length / d.length * 100) : null;
  },
  unassignedCount(rows: Row[]) { return rows.filter((r) => !r._hasWorker).length; },
  pendingNoReason(rows: Row[]) { return rows.filter((r) => r._isPending && !r._hasRescheduleReason); },
  withRescheduleReason(rows: Row[]) { return rows.filter((r) => r._hasRescheduleReason); },

  agingDistribution(rows: Row[]) {
    const cats = CONFIG.AGING_CATEGORIES.map((c) => ({ label: c.label, max: c.max, count: 0 }));
    rows.forEach((r) => {
      const h = r._agingHours; if (h === null) return;
      for (const c of cats) { if (h <= c.max) { c.count++; return; } }
      cats[cats.length - 1].count++;
    });
    return cats;
  },

  byMonth(rows: Row[]) {
    const months = groupByMonth(rows);
    return months.map(([month, mRows]) => {
      const [y, m] = month.split("-").map(Number);
      const mStart = new Date(y, m - 1, 1), mEnd = new Date(y, m, 0, 23, 59, 59);
      const done = mRows.filter((r) => !r._isPending && r._serviceHours !== null);
      const tc = done.length;
      const openInMonth = rows.filter((r) => {
        if (!r._dispatch) return false;
        const closed = r._completion || new Date();
        return r._dispatch <= mEnd && closed >= mStart;
      });
      return {
        month, label: formatMonthLabel(month),
        total: mRows.length,
        pending: mRows.filter((r) => r._isPending).length,
        pendingSnapshot: openInMonth.filter((r) => r._isPending).length,
        pendingDuration: openInMonth.length,
        completed: tc,
        rate48h: tc ? (done.filter((r) => r._serviceHours <= 48).length / tc * 100) : null,
        rate72h: tc ? (done.filter((r) => r._serviceHours <= 72).length / tc * 100) : null,
        withReason: mRows.filter((r) => r._hasRescheduleReason).length,
        noReason: mRows.filter((r) => r._isPending && !r._hasRescheduleReason).length,
      };
    });
  },

  pendingByReason(rows: Row[]) {
    const p = rows.filter((r) => r._isPending); const m: Record<string, number> = {};
    p.forEach((r) => { const k = r._rescheduleReason || "(No reason)"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort(([, a], [, b]) => b - a).map(([reason, count]) => ({ reason, count }));
  },
  pendingByBranch(rows: Row[]) {
    const m = groupBy(rows.filter((r) => r._isPending), (r) => r._branch);
    return Object.entries(m).map(([branch, b]) => ({ branch, count: b.length })).sort((a, b) => b.count - a.count);
  },
  pendingByWorker(rows: Row[]) {
    const m = groupBy(rows.filter((r) => r._isPending), (r) => r[CONFIG.COLS.WORKER]);
    return Object.entries(m).map(([worker, w]) => ({ worker, count: w.length })).sort((a, b) => b.count - a.count);
  },
  pendingByProduct(rows: Row[]) {
    const m = groupBy(rows.filter((r) => r._isPending), (r) => r[CONFIG.COLS.PRODUCT_TYPE] || r[CONFIG.COLS.PRODUCT_LINE]);
    return Object.entries(m).map(([product, p]) => ({ product, count: p.length })).sort((a, b) => b.count - a.count);
  },

  analyzeDelayReasons(rows: Row[]) {
    const pending = rows.filter((r) => r._isPending);
    const C = CONFIG.COLS;
    const CATS = [
      { key: "distance", label: "Distance Delay", color: "distance", badge: "#dc2626", badgeBg: "#fee2e2", keywords: [] as string[] },
      { key: "parts", label: "Spare Parts Delay", color: "parts", badge: "#7c3aed", badgeBg: "#f3f0ff", keywords: ["part", "spare", "replacement", "awaiting part", "no parts", "out of stock", "قطع", "قطعة"] },
      { key: "customer", label: "Customer Delay", color: "customer", badge: "#d97706", badgeBg: "#fef3c7", keywords: ["customer not available", "postponed", "no answer", "customer unavailable", "customer request", "not available", "reschedule", "عميل", "تأجيل"] },
      { key: "technical", label: "Service Center Delay", color: "technical", badge: "#003D8F", badgeBg: "#eaf3ff", keywords: ["technician delay", "no technician", "technician unavailable", "no worker", "no technician available", "assignment delay", "فني", "لا يوجد فني"] },
    ];
    const res: Record<string, any> = {};
    CATS.forEach((c) => { res[c.key] = { ...c, tickets: [] as Row[], count: 0, totalAging: 0 }; });
    res.unspecified = { key: "unspecified", label: "Unspecified Delay", color: "other", badge: "#5a607a", badgeBg: "#f3f5f9", tickets: [] as Row[], count: 0, totalAging: 0 };
    pending.forEach((r) => {
      const txt = [r[C.COMPLETION_RESULT] || "", r[C.MAINTENANCE] || "", r[C.RESCHED_SUPP] || "", r[C.RESCHED_REASON] || "", r[C.RESCHEDULING] || ""].join(" ").toLowerCase();
      let matched = false;
      if (r._farDistance) { res.distance.tickets.push(r); res.distance.count++; if (r._agingHours) res.distance.totalAging += r._agingHours; matched = true; }
      else { for (const cat of CATS.slice(1)) { if (cat.keywords.some((k) => txt.includes(k))) { res[cat.key].tickets.push(r); res[cat.key].count++; if (r._agingHours) res[cat.key].totalAging += r._agingHours; matched = true; break; } } }
      if (!matched) { res.unspecified.tickets.push(r); res.unspecified.count++; if (r._agingHours) res.unspecified.totalAging += r._agingHours; }
    });
    return Object.values(res).filter((c: any) => c.count > 0).map((c: any) => {
      c.avgAging = c.count > 0 ? c.totalAging / c.count : null;
      c.branches = Object.entries(groupBy(c.tickets, (t: Row) => t._branch)).map(([branch, t]) => ({ branch, count: t.length })).sort((a, b) => b.count - a.count);
      c.technicians = Object.entries(groupBy(c.tickets, (t: Row) => t[CONFIG.COLS.WORKER] || "(Unassigned)")).map(([tech, t]) => ({ tech, count: t.length })).sort((a, b) => b.count - a.count);
      return c;
    }).sort((a: any, b: any) => b.count - a.count);
  },

  byBranch(rows: Row[]) {
    return Object.entries(groupBy(rows, (r) => r._branch)).map(([branch, bRows]) => {
      const done = bRows.filter((r) => !r._isPending && r._serviceHours !== null);
      const pc = bRows.filter((r) => r._isPending).length;
      const b: any = {
        branch, total: bRows.length, pending: pc,
        pendingRate: bRows.length ? pc / bRows.length * 100 : null,
        rate48h: done.length ? done.filter((r) => r._serviceHours <= 48).length / done.length * 100 : null,
        rate72h: done.length ? done.filter((r) => r._serviceHours <= 72).length / done.length * 100 : null,
        unassigned: bRows.filter((r) => !r._hasWorker).length, score: 0,
      };
      b.score = (b.rate48h ?? 50) * 0.4 + (b.rate72h ?? 50) * 0.35 + (100 - (b.pendingRate ?? 50)) * 0.25;
      return b;
    }).sort((a, b) => b.score - a.score);
  },

  byCity(rows: Row[]) {
    const m = groupBy(rows, (r) => {
      if (!r._branch) return "(Unknown)";
      return r._branch.split("-")[0].trim() || "(Unknown)";
    });
    return Object.entries(m).map(([city, cRows]) => {
      const done = cRows.filter((r) => !r._isPending && r._serviceHours !== null);
      const pc = cRows.filter((r) => r._isPending).length;
      const closed = cRows.filter((r) => !r._isPending).length;
      return {
        city, registration: cRows.length, closed, pending: pc,
        pendingRate: cRows.length ? pc / cRows.length * 100 : null,
        rate48h: done.length ? done.filter((r) => r._serviceHours <= 48).length / done.length * 100 : null,
        rate72h: done.length ? done.filter((r) => r._serviceHours <= 72).length / done.length * 100 : null,
      };
    }).sort((a, b) => b.registration - a.registration);
  },

  rejectedAll(rows: Row[]) { return rows.filter((r) => r._isRejected || r._isReturned || r._isOBMStatement); },
  rejectedOnly(rows: Row[]) { return rows.filter((r) => r._isRejected); },
  returnedOnly(rows: Row[]) { return rows.filter((r) => r._isReturned); },
  obmOnly(rows: Row[]) { return rows.filter((r) => r._isOBMStatement); },
  rejectedByBranch(rows: Row[]) {
    const m = groupBy(KPI.rejectedAll(rows), (r) => r._branch);
    return Object.entries(m).map(([branch, r]) => ({ branch, count: r.length })).sort((a, b) => b.count - a.count);
  },
  rejectedByWorker(rows: Row[]) {
    const m = groupBy(KPI.rejectedAll(rows), (r) => r[CONFIG.COLS.WORKER]);
    return Object.entries(m).map(([worker, r]) => ({ worker, count: r.length })).sort((a, b) => b.count - a.count);
  },

  todaySchedule(rows: Row[]) {
    const t = new Date();
    const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    return rows.filter((r) => {
      if (!r._isPending) return false;
      if (r._rescheduled) {
        const d = r._rescheduled;
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (dStr === todayStr) return true;
      }
      return false;
    });
  },

  byASC(rows: Row[]) {
    const ascGroups = groupBy(rows, (r) => r._company || "Unknown");
    return Object.entries(ascGroups).map(([asc, ascRows]) => {
      if (!asc || asc === "Unknown" || asc === "") return null;
      const total = ascRows.length;
      const pending = ascRows.filter((r) => r._isPending).length;
      const completed = ascRows.filter((r) => !r._isPending && r._serviceHours !== null).length;
      const unassigned = ascRows.filter((r) => !r._hasWorker).length;
      const rescheduled = ascRows.filter((r) => r[CONFIG.COLS.RESCHEDULING]).length;
      const pendingRate = total ? (pending / total * 100) : null;
      const rate48h = completed ? (ascRows.filter((r) => !r._isPending && r._serviceHours !== null && r._serviceHours <= 48).length / completed * 100) : null;
      const rate72h = completed ? (ascRows.filter((r) => !r._isPending && r._serviceHours !== null && r._serviceHours <= 72).length / completed * 100) : null;
      const T = CONFIG.TARGETS;
      const score48 = rate48h !== null ? (rate48h / T.RATE_48H) * 100 : 0;
      const score72 = rate72h !== null ? (rate72h / T.RATE_72H) * 100 : 0;
      const scorePend = pendingRate !== null ? ((T.PENDING_RATE - pendingRate) / T.PENDING_RATE) * 100 : 0;
      return {
        asc, total, pending, completed, pending_rate: pendingRate,
        rate_48h: rate48h, rate_72h: rate72h, unassigned, rescheduled,
        score: (score48 + score72 + scorePend) / 3,
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null).sort((a, b) => b.score - a.score);
  },
};

export function buildPendingPivot(rows: Row[]) {
  const pending = rows.filter((r) => r._isPending);
  const agingCols = ["≤ 12h", "≤ 24h", "≤ 48h", "≤ 72h", "> 72h"];
  const branchMap: Record<string, any> = {};
  pending.forEach((r) => {
    const br = r._branch || "(Unknown)";
    if (!branchMap[br]) branchMap[br] = { total: 0 };
    agingCols.forEach((c) => { if (!branchMap[br][c]) branchMap[br][c] = 0; });
    branchMap[br][r._agingCat] = (branchMap[br][r._agingCat] || 0) + 1;
    branchMap[br].total++;
  });
  const rows2 = Object.entries(branchMap).map(([br, data]) => ({ branch: br, ...(data as any) })).sort((a, b) => b.total - a.total);
  return { cols: agingCols, rows: rows2, totalPending: pending.length };
}