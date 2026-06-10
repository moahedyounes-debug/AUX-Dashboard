import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend, LabelList,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { useTickets } from "@/lib/aux/useTickets";
import { KPI } from "@/lib/aux/kpis";
import { CONFIG } from "@/lib/aux/config";
import { fmt, fmtPct, truncate } from "@/lib/aux/data";

export const Route = createFileRoute("/pending-analysis")({
  head: () => ({
    meta: [
      { title: "Pending Analysis — AUX ASC Dashboard" },
      { name: "description", content: "Pending ticket categorization by delay reason and aging analysis." },
      { property: "og:title", content: "Pending Analysis — AUX ASC Dashboard" },
      { property: "og:description", content: "Delay reasons and aging breakdown for pending tickets." },
    ],
  }),
  component: PendingAnalysis,
});

const PAL = ["var(--primary)", "var(--chart-3)", "var(--chart-2)", "var(--success)", "var(--warning)", "var(--destructive)", "var(--chart-1)"];
const AGING_COLORS = ["var(--primary)", "var(--chart-3)", "var(--chart-2)", "var(--destructive)", "var(--warning)"];

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="h-1.5" style={{ background: accent }} />
      <div className="p-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function PendingAnalysis() {
  const { data, isLoading, error } = useTickets();
  const rows = data?.raw ?? [];

  const view = useMemo(() => {
    if (!rows.length) return null;
    const pending = KPI.pending(rows);
    const byBranch = KPI.pendingByBranch(rows);
    const byWorker = KPI.pendingByWorker(rows).slice(0, 10);
    const byReason = KPI.pendingByReason(rows);
    const aging = KPI.agingDistribution(pending);
    const causes = KPI.analyzeDelayReasons(rows);
    const farCount = pending.filter((r) => r._farDistance).length;
    const pendNoReason = KPI.pendingNoReason(rows).length;

    const catMap: Record<string, number> = {};
    pending.forEach((r) => { const c = r._reasonCategory || "Unspecified"; catMap[c] = (catMap[c] || 0) + 1; });
    const categories = Object.entries(catMap).sort(([, a], [, b]) => b - a).map(([cat, count]) => ({ cat, count }));

    return {
      pendingCount: pending.length, pendingRate: KPI.pendingRate(rows), farCount, pendNoReason,
      byBranch, byWorker, byReason, aging, causes, categories,
    };
  }, [rows]);

  return (
    <DashboardLayout title="Pending Analysis" subtitle="Delay Reason Deep-Dive">
      {isLoading ? (
        <Loading />
      ) : error || !view ? (
        <ErrorState message={(error as Error)?.message ?? "No data"} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Pending" value={fmt(view.pendingCount)} accent="var(--primary)" />
            <StatCard label="Pending Rate" value={fmtPct(view.pendingRate)} hint={`Target ≤ ${CONFIG.TARGETS.PENDING_RATE}%`} accent="var(--warning)" />
            <StatCard label="Far Distance (>60km)" value={fmt(view.farCount)} accent={view.farCount > 0 ? "var(--destructive)" : "var(--success)"} />
            <StatCard label="Pending (No Reason)" value={fmt(view.pendNoReason)} hint="No reschedule reason" accent={view.pendNoReason > 0 ? "var(--destructive)" : "var(--success)"} />
          </div>

          {view.categories.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ChartCard title="Delay Categories — By Category" subtitle="From Pending Reason sheet · Auto-Mapped">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={view.categories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="cat" stroke="var(--muted-foreground)" fontSize={10} interval={0} angle={-12} textAnchor="end" height={50} tickFormatter={(v) => truncate(v, 16)} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                        {view.categories.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
                        <LabelList dataKey="count" position="top" fontSize={11} fill="var(--foreground)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <ChartCard title="Category Summary">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Category</th>
                        <th className="px-3 py-2 text-center font-medium">Count</th>
                        <th className="px-3 py-2 text-center font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.categories.map((c) => (
                        <tr key={c.cat} className="border-b border-border/60 hover:bg-secondary/40">
                          <td className="px-3 py-2 font-medium text-card-foreground">{c.cat}</td>
                          <td className="px-3 py-2 text-center text-muted-foreground">{c.count}</td>
                          <td className="px-3 py-2 text-center text-muted-foreground">{fmtPct(view.pendingCount ? (c.count / view.pendingCount) * 100 : null)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </div>
          )}

          <ChartCard title="Delay Reason Analysis">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Reason</th>
                    <th className="px-3 py-2 text-center font-medium">Count</th>
                    <th className="px-3 py-2 text-center font-medium">%</th>
                    <th className="px-3 py-2 text-center font-medium">Avg Aging</th>
                  </tr>
                </thead>
                <tbody>
                  {view.causes.map((c: any) => (
                    <tr key={c.key} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="px-3 py-2">
                        <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: c.badgeBg, color: c.badge }}>{c.label}</span>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-card-foreground">{fmt(c.count)}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{fmtPct(view.pendingCount ? (c.count / view.pendingCount) * 100 : null)}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{c.avgAging !== null ? fmt(c.avgAging, 1) + "h" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <div className="space-y-3">
            {view.causes.map((cat: any) => {
              const pct = view.pendingCount ? Math.round((cat.count / view.pendingCount) * 100) : 0;
              return (
                <div key={cat.key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: cat.badgeBg, color: cat.badge }}>
                      {cat.label} · {cat.count} ({pct}%)
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">Avg: {cat.avgAging !== null ? fmt(cat.avgAging, 1) + "h" : "—"}</span>
                  </div>
                  {cat.branches.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Branches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.branches.slice(0, 4).map((b: any) => (
                          <span key={b.branch} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{b.branch} · {b.count}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cat.technicians.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Technicians</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.technicians.slice(0, 4).map((tch: any) => (
                          <span key={tch.tech} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{truncate(tch.tech, 22)} · {tch.count}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="By Reason">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={view.byReason.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis type="category" dataKey="reason" stroke="var(--muted-foreground)" fontSize={10} width={140} tickFormatter={(v) => truncate(v, 22)} />
                  <Tooltip />
                  <Bar dataKey="count" name="Pending" fill="var(--destructive)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Aging">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={view.aging} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {view.aging.map((_, i) => <Cell key={i} fill={AGING_COLORS[i % AGING_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {view.aging.map((a, i) => {
                  const max = Math.max(...view.aging.map((x) => x.count), 1);
                  return (
                    <div key={a.label} className="flex items-center gap-3 text-xs">
                      <span className="w-20 shrink-0 text-muted-foreground">{a.label}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${(a.count / max) * 100}%`, background: AGING_COLORS[i % AGING_COLORS.length] }} />
                      </div>
                      <span className="w-8 shrink-0 text-right font-medium text-card-foreground">{a.count}</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            <ChartCard title="By Branch">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={view.byBranch} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis type="category" dataKey="branch" stroke="var(--muted-foreground)" fontSize={10} width={130} tickFormatter={(v) => truncate(v, 20)} />
                  <Tooltip />
                  <Bar dataKey="count" name="Pending" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="By Worker">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={view.byWorker} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis type="category" dataKey="worker" stroke="var(--muted-foreground)" fontSize={10} width={130} tickFormatter={(v) => truncate(v, 20)} />
                  <Tooltip />
                  <Bar dataKey="count" name="Pending" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}