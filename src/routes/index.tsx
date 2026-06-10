import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Ticket, Clock, Timer, CheckCircle2, AlertCircle, Gauge, UserX, HelpCircle } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { useTickets } from "@/lib/aux/useTickets";
import { KPI } from "@/lib/aux/kpis";
import { CONFIG } from "@/lib/aux/config";
import { fmt, fmtPct } from "@/lib/aux/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KPI Overview — AUX ASC Dashboard" },
      { name: "description", content: "Live service ticket performance, repair-rate trends and pending analysis for AUX authorized service centers." },
      { property: "og:title", content: "KPI Overview — AUX ASC Dashboard" },
      { property: "og:description", content: "Live service ticket performance and repair-rate analytics." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data, isLoading, error } = useTickets();
  const rows = data?.raw ?? [];

  const k = useMemo(() => {
    if (!rows.length) return null;
    return {
      total: rows.length,
      pendingRate: KPI.pendingRate(rows),
      rate48h: KPI.rate48h(rows),
      rate72h: KPI.rate72h(rows),
      completed: KPI.completed(rows).length,
      pending: KPI.pending(rows).length,
      pendingNoReason: KPI.pendingNoReason(rows).length,
      unassigned: KPI.unassignedCount(rows),
    };
  }, [rows]);

  const monthly = useMemo(() => (rows.length ? KPI.byMonth(rows) : []), [rows]);
  const byReason = useMemo(() => (rows.length ? KPI.pendingByReason(rows).slice(0, 12) : []), [rows]);

  const T = CONFIG.TARGETS;

  return (
    <DashboardLayout title="KPI Overview" subtitle="Live data · repair performance across all branches">
      {isLoading ? (
        <Loading />
      ) : error || !k ? (
        <ErrorState message={(error as Error)?.message ?? "No data"} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-8">
            <KpiCard label="Total Tickets" value={fmt(k.total)} icon={Ticket} tone="primary" hint="All services" />
            <KpiCard label="Pending Rate" value={fmtPct(k.pendingRate)} icon={Gauge} tone="warning" hint={`Target ≤ ${T.PENDING_RATE}%`} />
            <KpiCard label="48H Repair Rate" value={fmtPct(k.rate48h)} icon={Timer} tone="accent" hint={`Target ${T.RATE_48H}%`} />
            <KpiCard label="72H Repair Rate" value={fmtPct(k.rate72h)} icon={Clock} tone="success" hint={`Target ${T.RATE_72H}%`} />
            <KpiCard label="Completed" value={fmt(k.completed)} icon={CheckCircle2} tone="success" />
            <KpiCard label="Pending" value={fmt(k.pending)} icon={AlertCircle} tone="destructive" />
            <KpiCard label="Pending No Reason" value={fmt(k.pendingNoReason)} icon={HelpCircle} tone="warning" />
            <KpiCard label="No Worker Assigned" value={fmt(k.unassigned)} icon={UserX} tone="destructive" />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ChartCard title="48h Rate — Monthly" subtitle={`Repair rate within 48h vs ${T.RATE_48H}% target`}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => (v == null ? "—" : `${Number(v).toFixed(1)}%`)} />
                  <ReferenceLine y={T.RATE_48H} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="rate48h" name="48h Rate" stroke="var(--chart-2)" strokeWidth={2} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="72h Rate — Monthly" subtitle={`Repair rate within 72h vs ${T.RATE_72H}% target`}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => (v == null ? "—" : `${Number(v).toFixed(1)}%`)} />
                  <ReferenceLine y={T.RATE_72H} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="rate72h" name="72h Rate" stroke="var(--chart-3)" strokeWidth={2} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rescheduled Tickets — Monthly" subtitle="Tickets with a reschedule reason per month">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="withReason" name="Rescheduled" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Pending by Reschedule Reason" subtitle="Top reasons across pending tickets">
              {byReason.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byReason} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis type="category" dataKey="reason" stroke="var(--muted-foreground)" fontSize={10} width={140} interval={0} />
                    <Tooltip />
                    <Bar dataKey="count" name="Pending" fill="var(--destructive)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No pending tickets.</p>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
