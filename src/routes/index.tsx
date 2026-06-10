import { createFileRoute } from "@tanstack/react-router";
import {
  Ticket,
  Clock,
  Timer,
  CheckCircle2,
  AlertCircle,
  Gauge,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  ticketKpis,
  monthlyRepairRate,
  branchPerformance,
  rescheduledReasons,
  productLinePerformance,
  formatNumber,
} from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Service KPIs — AUX ASC Dashboard" },
      { name: "description", content: "Service ticket performance, repair-rate trends and branch comparison for AUX authorized service centers." },
      { property: "og:title", content: "Service KPIs — AUX ASC Dashboard" },
      { property: "og:description", content: "Service ticket performance and repair-rate analytics." },
    ],
  }),
  component: Overview,
});

const PIE_COLORS = ["var(--chart-2)", "var(--chart-1)", "var(--chart-4)", "var(--chart-3)", "var(--chart-5)"];

function Overview() {
  return (
    <DashboardLayout title="Service Ticket KPIs" subtitle="Overview of repair performance across all branches">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Tickets" value={formatNumber(ticketKpis.total)} icon={Ticket} tone="primary" hint="All services" />
        <KpiCard label="Pending Rate" value={`${ticketKpis.pendingRate}%`} icon={Gauge} tone="warning" />
        <KpiCard label="48h Repair Rate" value={`${ticketKpis.rate48h}%`} icon={Timer} tone="accent" hint="Target 80%" />
        <KpiCard label="72h Repair Rate" value={`${ticketKpis.rate72h}%`} icon={Clock} tone="success" hint="Target 90%" />
        <KpiCard label="Completed" value={formatNumber(ticketKpis.completed)} icon={CheckCircle2} tone="success" />
        <KpiCard label="Pending" value={formatNumber(ticketKpis.pending)} icon={AlertCircle} tone="destructive" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Repair Rate" subtitle="48h & 72h rates vs targets">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyRepairRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[60, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate48h" name="48h Rate" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="rate72h" name="72h Rate" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="target48" name="48h Target" stroke="var(--muted-foreground)" strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Performance by Branch" subtitle="Completed vs pending tickets">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="branch" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Completed" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rescheduled Tickets" subtitle="Breakdown by reason">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={rescheduledReasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={95} label>
                {rescheduledReasons.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product Line Performance" subtitle="Completion rate by line">
          <div className="space-y-3">
            {productLinePerformance.map((p) => (
              <div key={p.line}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-card-foreground">{p.line}</span>
                  <span className="text-muted-foreground">{p.tickets} tickets · {p.rate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
