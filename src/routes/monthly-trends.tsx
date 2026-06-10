import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { monthlyRepairRate, branchPerformance, monthlyConsumption } from "@/lib/dashboard-data";

export const Route = createFileRoute("/monthly-trends")({
  head: () => ({
    meta: [
      { title: "Monthly Trends — AUX ASC Dashboard" },
      { name: "description", content: "Monthly repair-rate trends and branch performance tracking over time." },
      { property: "og:title", content: "Monthly Trends — AUX ASC Dashboard" },
      { property: "og:description", content: "Repair rate and branch performance trends over time." },
    ],
  }),
  component: MonthlyTrends,
});

function MonthlyTrends() {
  return (
    <DashboardLayout title="Monthly Trends" subtitle="Repair rate & branch performance over time">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Repair Rate Trend" subtitle="48h & 72h rates vs targets">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRepairRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate48h" name="48h Rate" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="rate72h" name="72h Rate" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="target48" name="48h Target" stroke="var(--muted-foreground)" strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="target72" name="72h Target" stroke="var(--chart-4)" strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Consumption" subtitle="Spare part units consumed">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyConsumption}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="consumed" name="Consumed" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Branch Performance Tracking" subtitle="Completion rate by branch" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
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
      </div>
    </DashboardLayout>
  );
}