import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LabelList,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { useTickets } from "@/lib/aux/useTickets";
import { KPI } from "@/lib/aux/kpis";
import { CONFIG } from "@/lib/aux/config";
import { fmtPct } from "@/lib/aux/data";

export const Route = createFileRoute("/monthly-trends")({
  head: () => ({
    meta: [
      { title: "Monthly Trends — AUX ASC Dashboard" },
      { name: "description", content: "Monthly repair-rate trends, ticket volume and pending duration tracking over time." },
      { property: "og:title", content: "Monthly Trends — AUX ASC Dashboard" },
      { property: "og:description", content: "Repair rate and ticket volume trends over time." },
    ],
  }),
  component: MonthlyTrends,
});

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: "primary" | "destructive" | "muted" }) {
  const top = accent === "primary" ? "border-t-primary" : accent === "destructive" ? "border-t-destructive" : "border-t-border";
  return (
    <div className={`rounded-xl border border-t-4 ${top} border-border bg-card p-5 text-center shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-card-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function MonthlyTrends() {
  const { data, isLoading, error } = useTickets();
  const rows = data?.raw ?? [];

  const months = useMemo(() => (rows.length ? KPI.byMonth(rows) : []), [rows]);

  const summary = useMemo(() => {
    const withRate = months.filter((m) => m.rate48h !== null);
    if (!withRate.length) return null;
    const best = withRate.reduce((a, b) => (b.rate48h! > a.rate48h! ? b : a));
    const worst = withRate.reduce((a, b) => (b.rate48h! < a.rate48h! ? b : a));
    const avg = (key: "rate48h" | "rate72h") => {
      const v = months.map((m) => m[key]).filter((x): x is number => x !== null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    return { best, worst, avg48: avg("rate48h"), avg72: avg("rate72h") };
  }, [months]);

  const T = CONFIG.TARGETS;

  return (
    <DashboardLayout title="Monthly Trends" subtitle="Historical Analysis">
      {isLoading ? (
        <Loading />
      ) : error || !summary ? (
        <ErrorState message={(error as Error)?.message ?? "No data"} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard label="Best Month (48h)" value={summary.best.label} sub={fmtPct(summary.best.rate48h)} accent="primary" />
            <SummaryCard label="Worst Month (48h)" value={summary.worst.label} sub={fmtPct(summary.worst.rate48h)} accent="destructive" />
            <SummaryCard label="Avg 48h Rate" value={fmtPct(summary.avg48)} sub={`Target ${T.RATE_48H}%`} accent="muted" />
            <SummaryCard label="Avg 72h Rate" value={fmtPct(summary.avg72)} sub={`Target ${T.RATE_72H}%`} accent="muted" />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ChartCard title="48h & 72h Rate Trend" subtitle="Repair rate within targets">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => (v == null ? "—" : `${Number(v).toFixed(1)}%`)} />
                  <Legend />
                  <Line type="monotone" dataKey="rate48h" name="48h %" stroke="var(--chart-1)" strokeWidth={2} connectNulls>
                    <LabelList dataKey="rate48h" position="bottom" fontSize={9} fill="var(--muted-foreground)" formatter={(v: any) => (v == null ? "" : `${Math.round(v)}`)} />
                  </Line>
                  <Line type="monotone" dataKey="rate72h" name="72h %" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="4 2" connectNulls>
                    <LabelList dataKey="rate72h" position="top" fontSize={9} fill="var(--muted-foreground)" formatter={(v: any) => (v == null ? "" : `${Math.round(v)}`)} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Ticket Volume" subtitle="Total · completed · pending per month">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Tickets" fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Pending Trend (Duration)" subtitle="Open ticket duration per month">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={months}>
                  <defs>
                    <linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="pendingDuration" name="Pending (duration)" stroke="var(--destructive)" strokeWidth={2} fill="url(#pendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rescheduled Tickets — Monthly" subtitle="Tickets with a reschedule reason per month">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="withReason" name="Rescheduled" fill="var(--chart-4)" radius={[3, 3, 0, 0]}>
                    <LabelList dataKey="withReason" position="top" fontSize={10} fill="var(--foreground)" formatter={(v: any) => (v ? v : "")} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-5">
            <ChartCard title="Monthly Comparison" subtitle="48h % vs 72h % per month">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => (v == null ? "—" : `${Number(v).toFixed(1)}%`)} />
                  <Legend />
                  <ReferenceLine y={T.RATE_48H} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                  <Bar dataKey="rate48h" name="48h %" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="rate72h" name="72h %" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
