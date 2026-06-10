import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { branchPerformance } from "@/lib/dashboard-data";

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

function BranchComparison() {
  return (
    <DashboardLayout title="Branch Comparison" subtitle="Multi-branch KPI benchmarking">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Completion Rate by Branch" subtitle="Higher is better">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="branch" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rate" name="Rate %" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Performance Radar" subtitle="Completion rate profile">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={branchPerformance}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="branch" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Radar name="Rate %" dataKey="rate" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completed vs Pending" subtitle="Workload split per branch" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="branch" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Completed" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}