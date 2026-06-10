import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { dailyAging, technicianLoad, serviceHours } from "@/lib/dashboard-data";

export const Route = createFileRoute("/daily-operations")({
  head: () => ({
    meta: [
      { title: "Daily Operations — AUX ASC Dashboard" },
      { name: "description", content: "Daily ticket aging by status and branch, technician assignment and service hours analysis." },
      { property: "og:title", content: "Daily Operations — AUX ASC Dashboard" },
      { property: "og:description", content: "Ticket aging, technician load and service hours." },
    ],
  }),
  component: DailyOperations,
});

function DailyOperations() {
  return (
    <DashboardLayout title="Daily Operations" subtitle="Ticket aging, technician load & service hours">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Ticket Aging by Branch" subtitle="Open tickets grouped by age">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyAging}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="branch" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="d0_1" name="0-1 day" stackId="a" fill="var(--chart-3)" />
              <Bar dataKey="d2_3" name="2-3 days" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="d4plus" name="4+ days" stackId="a" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service Hours Analysis" subtitle="Tickets handled by hour of day">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={serviceHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" name="Tickets" stroke="var(--chart-1)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Technician Assignment Tracking" subtitle="Assigned vs closed per technician" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={technicianLoad}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="technician" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="assigned" name="Assigned" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="closed" name="Closed" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}