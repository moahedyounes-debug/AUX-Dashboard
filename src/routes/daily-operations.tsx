import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { Send } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { useTickets } from "@/lib/aux/useTickets";
import { KPI, buildPendingPivot } from "@/lib/aux/kpis";
import { CONFIG } from "@/lib/aux/config";
import { fmt, fmtPct } from "@/lib/aux/data";
import type { Row } from "@/lib/aux/data";

export const Route = createFileRoute("/daily-operations")({
  head: () => ({
    meta: [
      { title: "Daily Operations — AUX ASC Dashboard" },
      { name: "description", content: "Today's work queue: pending tickets, aging distribution, reschedule reasons and branch alerts." },
      { property: "og:title", content: "Daily Operations — AUX ASC Dashboard" },
      { property: "og:description", content: "Today's work queue and pending ticket operations." },
    ],
  }),
  component: DailyOperations,
});

const C = CONFIG.COLS;
const AGING_COLORS = ["var(--success)", "var(--chart-3)", "var(--warning)", "var(--destructive)", "var(--foreground)"];

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="h-1.5" style={{ background: accent }} />
      <div className="p-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    red: "bg-destructive/10 text-destructive",
    amber: "bg-warning/15 text-warning",
    orange: "bg-warning/15 text-warning",
    green: "bg-success/10 text-success",
    gray: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${map[color] ?? map.gray}`}>{label}</span>;
}

function AgingBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    "≤ 12h": "bg-success/10 text-success",
    "≤ 24h": "bg-success/10 text-success",
    "≤ 48h": "bg-warning/15 text-warning",
    "≤ 72h": "bg-destructive/10 text-destructive",
    "> 72h": "bg-foreground/10 text-foreground",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${map[cat] ?? "bg-muted text-muted-foreground"}`}>{cat}</span>;
}

function TicketTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="px-4 py-6 text-sm text-muted-foreground">No tickets.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">Ticket #</th>
            <th className="px-3 py-2 font-medium">Branch</th>
            <th className="px-3 py-2 font-medium">Worker</th>
            <th className="px-3 py-2 font-medium">Ticket Status</th>
            <th className="px-3 py-2 font-medium">Aging</th>
            <th className="px-3 py-2 font-medium">Reason</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Remark</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 hover:bg-secondary/40">
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r[C.TICKET_NUM]}</td>
              <td className="px-3 py-2 whitespace-nowrap text-card-foreground">{r._branch}</td>
              <td className="px-3 py-2 whitespace-nowrap text-card-foreground">{r._hasWorker ? r[C.WORKER] : <StatusBadge label="Not Assigned" color="red" />}</td>
              <td className="px-3 py-2"><StatusBadge label={r._phaseLabel} color={r._phaseColor} /></td>
              <td className="px-3 py-2"><AgingBadge cat={r._agingCat} /></td>
              <td className="px-3 py-2 text-muted-foreground">{r._rescheduleReason || "—"}</td>
              <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{r._rescheduleDate ? r._rescheduleDate.substring(0, 10) : "—"}</td>
              <td className="px-3 py-2 max-w-[260px] truncate text-muted-foreground" title={r._rescheduleRemark}>{r._rescheduleRemark || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyOperations() {
  const { data, isLoading, error } = useTickets();
  const rows = data?.raw ?? [];
  const [sent, setSent] = useState<Record<string, boolean>>({});

  const view = useMemo(() => {
    if (!rows.length) return null;
    const pending = KPI.pending(rows);
    const today = KPI.todaySchedule(rows);
    const activeWorkers = new Set(today.filter((r) => r._hasWorker).map((r) => r[C.WORKER])).size;
    const dispatched = pending.filter((r) => r._isDispatchedWork).length;
    const noWorker = pending.filter((r) => !r._hasWorker).length;

    const aging = KPI.agingDistribution(pending);
    const reasons = KPI.pendingByReason(rows).slice(0, 8);
    const pivot = buildPendingPivot(rows);
    const cities = KPI.byCity(rows);

    const byBranch: Record<string, { pending: number; noReason: number; today: number }> = {};
    pending.forEach((r) => {
      const b = r._branch || "(Unknown)";
      byBranch[b] ||= { pending: 0, noReason: 0, today: 0 };
      byBranch[b].pending++;
      if (!r._hasRescheduleReason) byBranch[b].noReason++;
    });
    today.forEach((r) => { const b = r._branch || "(Unknown)"; if (byBranch[b]) byBranch[b].today++; });
    const alerts = Object.entries(byBranch).map(([branch, v]) => ({ branch, ...v })).sort((a, b) => b.pending - a.pending);

    return {
      pendingCount: pending.length, todayCount: today.length, activeWorkers, dispatched, noWorker,
      aging, reasons, todayRows: today, pendingRows: pending, pivot, cities, alerts,
    };
  }, [rows]);

  return (
    <DashboardLayout title="Daily Operations" subtitle="Today's Work Queue">
      {isLoading ? (
        <Loading />
      ) : error || !view ? (
        <ErrorState message={(error as Error)?.message ?? "No data"} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Today's Visits" value={fmt(view.todayCount)} hint="Rescheduled to today" accent="var(--primary)" />
            <StatCard label="Total Pending" value={fmt(view.pendingCount)} hint="Completion Result blank" accent="var(--warning)" />
            <StatCard label="Active Workers" value={fmt(view.activeWorkers)} hint="On today's schedule" accent="var(--primary)" />
            <StatCard label="Dispatched (Not Accepted)" value={fmt(view.dispatched)} hint="Status = Dispatched Work" accent="var(--success)" />
            <StatCard label="No Worker Assigned" value={fmt(view.noWorker)} hint="Worker Name = blank" accent="var(--destructive)" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Aging Distribution (Pending)">
              <div className="space-y-3 py-2">
                {view.aging.map((a, i) => {
                  const max = Math.max(...view.aging.map((x) => x.count), 1);
                  return (
                    <div key={a.label} className="flex items-center gap-3 text-xs">
                      <span className="w-20 shrink-0 text-muted-foreground">{a.label}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${(a.count / max) * 100}%`, background: AGING_COLORS[i] }} />
                      </div>
                      <span className="w-8 shrink-0 text-right font-medium text-card-foreground">{a.count}</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            <ChartCard title="Reschedule Reasons">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={view.reasons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="reason" stroke="var(--muted-foreground)" fontSize={9} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="Pending" radius={[3, 3, 0, 0]}>
                    {view.reasons.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "var(--destructive)" : "var(--chart-1)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Today's Visits (from Rescheduling date)" subtitle={`${view.todayRows.length} tickets`}>
            <TicketTable rows={view.todayRows} />
          </ChartCard>

          <ChartCard title="All Pending Tickets" subtitle={`${view.pendingRows.length} tickets`}>
            <TicketTable rows={view.pendingRows} />
          </ChartCard>

          <ChartCard title="Pending Summary — Pivot (Branch × Aging)" subtitle={`${view.pivot.totalPending} pending`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Branch</th>
                    {view.pivot.cols.map((c) => <th key={c} className="px-3 py-2 text-center font-medium">{c}</th>)}
                    <th className="px-3 py-2 text-center font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {view.pivot.rows.map((r: any) => (
                    <tr key={r.branch} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="px-3 py-2 whitespace-nowrap text-card-foreground">{r.branch}</td>
                      {view.pivot.cols.map((c) => <td key={c} className="px-3 py-2 text-center text-muted-foreground">{r[c] || ""}</td>)}
                      <td className="px-3 py-2 text-center font-semibold text-card-foreground">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Load by City" subtitle={`Registration & Closed by City · ${view.cities.length} cities`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Branch</th>
                    <th className="px-3 py-2 text-center font-medium">Registration</th>
                    <th className="px-3 py-2 text-center font-medium">Closed</th>
                    <th className="px-3 py-2 text-center font-medium">Pending</th>
                    <th className="px-3 py-2 text-center font-medium">Pending %</th>
                    <th className="px-3 py-2 text-center font-medium">48h Rate</th>
                    <th className="px-3 py-2 text-center font-medium">72h Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {view.cities.map((c) => (
                    <tr key={c.city} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="px-3 py-2 whitespace-nowrap text-card-foreground">{c.city}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{c.registration}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{c.closed}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{c.pending}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{fmtPct(c.pendingRate)}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{fmtPct(c.rate48h)}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{fmtPct(c.rate72h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {data?.isAdmin && (
            <ChartCard title="Branch Alerts — Pending Notification" subtitle="Admin Only">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Branch</th>
                      <th className="px-3 py-2 text-center font-medium">Pending</th>
                      <th className="px-3 py-2 text-center font-medium">No Reason</th>
                      <th className="px-3 py-2 text-center font-medium">Visit Today</th>
                      <th className="px-3 py-2 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.alerts.map((a) => (
                      <tr key={a.branch} className="border-b border-border/60 hover:bg-secondary/40">
                        <td className="px-3 py-2 whitespace-nowrap text-card-foreground">{a.branch}</td>
                        <td className="px-3 py-2 text-center font-medium text-card-foreground">{a.pending}</td>
                        <td className="px-3 py-2 text-center font-medium text-card-foreground">{a.noReason}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{a.today > 0 ? "Yes" : "No"}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => setSent((s) => ({ ...s, [a.branch]: true }))}
                            className="inline-flex items-center gap-1.5 rounded-md bg-success px-3 py-1 text-xs font-medium text-success-foreground transition-opacity hover:opacity-90"
                          >
                            <Send className="size-3" /> {sent[a.branch] ? "Sent" : "Send Alert"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
