import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { activityLog } from "@/lib/dashboard-data";

export const Route = createFileRoute("/activity-log")({
  head: () => ({
    meta: [
      { title: "Activity Log — AUX ASC Dashboard" },
      { name: "description", content: "Audit trail of user activity, page views and data refreshes across the dashboard." },
      { property: "og:title", content: "Activity Log — AUX ASC Dashboard" },
      { property: "og:description", content: "User activity and audit trail." },
    ],
  }),
  component: ActivityLog,
});

function ActivityLog() {
  return (
    <DashboardLayout title="Activity Log" subtitle="User activity & audit trail">
      <ChartCard title="Recent Activity" subtitle="Latest user actions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Timestamp</th>
                <th className="px-2 py-2 font-medium">User</th>
                <th className="px-2 py-2 font-medium">Action</th>
                <th className="px-2 py-2 font-medium">Page</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((a, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-mono text-xs text-muted-foreground">{a.ts}</td>
                  <td className="px-2 py-2 font-medium text-card-foreground">{a.user}</td>
                  <td className="px-2 py-2 text-muted-foreground">{a.action}</td>
                  <td className="px-2 py-2 text-muted-foreground">{a.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}