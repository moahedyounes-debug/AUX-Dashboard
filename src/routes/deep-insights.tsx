import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { productLinePerformance, serviceTypePerformance, completionResults } from "@/lib/dashboard-data";

export const Route = createFileRoute("/deep-insights")({
  head: () => ({
    meta: [
      { title: "Deep Insights — AUX ASC Dashboard" },
      { name: "description", content: "Product line performance, service type analysis and completion result tracking." },
      { property: "og:title", content: "Deep Insights — AUX ASC Dashboard" },
      { property: "og:description", content: "Segmented analytics across product lines and service types." },
    ],
  }),
  component: DeepInsights,
});

const PIE_COLORS = ["var(--chart-3)", "var(--chart-2)", "var(--chart-5)", "var(--chart-4)"];

function DeepInsights() {
  return (
    <DashboardLayout title="Deep Insights" subtitle="Product line, service type & completion analysis">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Product Line Performance" subtitle="Tickets & completion rate">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productLinePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="line" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tickets" name="Tickets" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rate" name="Rate %" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service Type Analysis" subtitle="Volume & rate by service type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceTypePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tickets" name="Tickets" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rate" name="Rate %" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion Result Tracking" subtitle="Outcome distribution" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={completionResults} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                {completionResults.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}