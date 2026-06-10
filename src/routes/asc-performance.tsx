import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ascPerformance } from "@/lib/dashboard-data";

export const Route = createFileRoute("/asc-performance")({
  head: () => ({
    meta: [
      { title: "ASC Performance — AUX ASC Dashboard" },
      { name: "description", content: "Authorized service center performance: tickets, repair rates and SLA scores per ASC." },
      { property: "og:title", content: "ASC Performance — AUX ASC Dashboard" },
      { property: "og:description", content: "Per-ASC repair rate and SLA benchmarking." },
    ],
  }),
  component: ASCPerformance,
});

function ASCPerformance() {
  return (
    <DashboardLayout title="ASC Performance" subtitle="Per authorized service center benchmarking">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Repair Rates by ASC" subtitle="48h & 72h rates">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ascPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="asc" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rate48h" name="48h %" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rate72h" name="72h %" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="SLA Score by ASC" subtitle="Composite SLA compliance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ascPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="asc" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="slaScore" name="SLA Score" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="ASC Summary" subtitle="All authorized service centers" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-2 font-medium">ASC</th>
                <th className="px-2 py-2 font-medium">Tickets</th>
                <th className="px-2 py-2 font-medium">48h %</th>
                <th className="px-2 py-2 font-medium">72h %</th>
                <th className="px-2 py-2 font-medium">SLA Score</th>
              </tr>
            </thead>
            <tbody>
              {ascPerformance.map((a) => (
                <tr key={a.asc} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-medium text-card-foreground">{a.asc}</td>
                  <td className="px-2 py-2 text-muted-foreground">{a.tickets}</td>
                  <td className="px-2 py-2 text-muted-foreground">{a.rate48h}%</td>
                  <td className="px-2 py-2 text-muted-foreground">{a.rate72h}%</td>
                  <td className="px-2 py-2 font-semibold text-card-foreground">{a.slaScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}