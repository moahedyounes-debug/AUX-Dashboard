import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { useTickets } from "@/lib/aux/useTickets";
import { KPI } from "@/lib/aux/kpis";
import { CONFIG } from "@/lib/aux/config";
import { fmt, fmtPct, truncate } from "@/lib/aux/data";

export const Route = createFileRoute("/branch-comparison")({
  head: () => ({
    meta: [
      { title: "Branch Comparison — AUX ASC Dashboard" },
      { name: "description", content: "Multi-branch KPI comparison and performance benchmarking across service centers." },
      { property: "og:title", content: "Branch Comparison — AUX ASC Dashboard" },
      { property: "og:description", content: "Compare and benchmark branch performance." },
    ],
  }),
  component: BranchComparison,
});

const T = CONFIG.TARGETS;

function TargetBadge({ value, target, higher = true, suffix = "%" }: { value: number | null; target: number; higher?: boolean; suffix?: string }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">—</span>;
  }
  const good = higher ? value >= target : value <= target;
  const warn = higher ? value >= target * 0.9 : value <= target * 1.1;
  const cls = good
    ? "bg-success/10 text-success"
    : warn
    ? "bg-warning/15 text-warning"
    : "bg-destructive/10 text-destructive";
  const text = suffix === "%" ? fmtPct(value) : fmt(value, 1) + suffix;
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{text}</span>;
}

function rankClass(i: number) {
  if (i === 0) return "bg-warning text-warning-foreground";
  if (i === 1) return "bg-muted-foreground/30 text-foreground";
  if (i === 2) return "bg-warning/40 text-foreground";
  return "bg-secondary text-muted-foreground";
}

function BranchComparison() {
  const { data, isLoading, error } = useTickets();
  const rows = data?.raw ?? [];

  const view = useMemo(() => {
    if (!rows.length) return null;
    const branches = KPI.byBranch(rows);
    const resched = (b: string) => rows.filter((r) => r._branch === b && r._hasRescheduleReason).length;
    const chart = branches.map((b: any) => ({
      branch: truncate(b.branch, 18),
      rate48h: b.rate48h !== null ? +b.rate48h.toFixed(1) : null,
      rate72h: b.rate72h !== null ? +b.rate72h.toFixed(1) : null,
      pendingRate: b.pendingRate !== null ? +b.pendingRate.toFixed(1) : null,
      rescheduled: resched(b.branch),
    }));
    return { branches, chart };
  }, [rows]);

  return (
    <DashboardLayout title="Branch Comparison" subtitle="Performance Ranking">
      {isLoading ? (
        <Loading />
      ) : error || !view ? (
        <ErrorState message={(error as Error)?.message ?? "No data"} />
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
            <span className="font-semibold text-card-foreground">{view.branches.length} branches</span> · Score = 40% 48h + 35% 72h + 25% Resolution
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="48h Repair Rate" subtitle={`Target ${T.RATE_48H}%`}>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={view.chart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="branch" width={120} stroke="var(--muted-foreground)" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="rate48h" name="48h %" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="72h Repair Rate" subtitle={`Target ${T.RATE_72H}%`}>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={view.chart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="branch" width={120} stroke="var(--muted-foreground)" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="rate72h" name="72h %" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Pending Rate">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={view.chart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="branch" width={120} stroke="var(--muted-foreground)" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="pendingRate" name="Pending %" fill="var(--warning)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rescheduled">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={view.chart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="branch" width={120} stroke="var(--muted-foreground)" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="rescheduled" name="Rescheduled" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Branch Ranking" subtitle={`${view.branches.length} branches`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Rank</th>
                    <th className="px-3 py-2 font-medium">Branch</th>
                    <th className="px-3 py-2 text-center font-medium">Total</th>
                    <th className="px-3 py-2 text-center font-medium">Pending</th>
                    <th className="px-3 py-2 text-center font-medium">Pending Rate</th>
                    <th className="px-3 py-2 text-center font-medium">48h Rate</th>
                    <th className="px-3 py-2 text-center font-medium">72h Rate</th>
                    <th className="px-3 py-2 text-center font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {view.branches.map((b: any, i: number) => (
                    <tr key={b.branch} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="px-3 py-2">
                        <span className={`inline-flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${rankClass(i)}`}>{i + 1}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-card-foreground">{b.branch}</td>
                      <td className="px-3 py-2 text-center font-mono text-muted-foreground">{fmt(b.total)}</td>
                      <td className="px-3 py-2 text-center font-mono text-muted-foreground">{fmt(b.pending)}</td>
                      <td className="px-3 py-2 text-center"><TargetBadge value={b.pendingRate} target={T.PENDING_RATE} higher={false} suffix="h" /></td>
                      <td className="px-3 py-2 text-center"><TargetBadge value={b.rate48h} target={T.RATE_48H} /></td>
                      <td className="px-3 py-2 text-center"><TargetBadge value={b.rate72h} target={T.RATE_72H} /></td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.score >= 80 ? "bg-success/10 text-success" : b.score >= 60 ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning"}`}>{fmt(b.score, 1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}
    </DashboardLayout>
  );
}