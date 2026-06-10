import { createFileRoute } from "@tanstack/react-router";
import { AlarmClock, Hourglass, Timer, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { pendingByReason, pendingAging } from "@/lib/dashboard-data";

export const Route = createFileRoute("/pending-analysis")({
  head: () => ({
    meta: [
      { title: "Pending Analysis — AUX ASC Dashboard" },
      { name: "description", content: "Pending ticket categorization by delay reason and days-aging analysis." },
      { property: "og:title", content: "Pending Analysis — AUX ASC Dashboard" },
      { property: "og:description", content: "Delay reasons and aging breakdown for pending tickets." },
    ],
  }),
  component: PendingAnalysis,
});

function PendingAnalysis() {
  const totalPending = pendingByReason.reduce((s, r) => s + r.count, 0);
  const oldest = pendingAging[pendingAging.length - 1].count;
  const avgDays = (pendingByReason.reduce((s, r) => s + r.avgDays * r.count, 0) / totalPending).toFixed(1);

  return (
    <DashboardLayout title="Pending Analysis" subtitle="Delay reasons & aging breakdown">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Pending" value={totalPending} icon={AlarmClock} tone="warning" />
        <KpiCard label="Avg Days Pending" value={`${avgDays}d`} icon={Hourglass} tone="accent" />
        <KpiCard label="Delay Reasons" value={pendingByReason.length} icon={Timer} tone="primary" />
        <KpiCard label="11+ Days Aging" value={oldest} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Pending by Delay Reason" subtitle="Ticket count per reason">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pendingByReason} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="reason" stroke="var(--muted-foreground)" fontSize={11} width={120} />
              <Tooltip />
              <Bar dataKey="count" name="Pending" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Days Aging Analysis" subtitle="Pending tickets by age bucket">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pendingAging}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" name="Tickets" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}