import { createFileRoute } from "@tanstack/react-router";
import { XCircle, Undo2, RefreshCw, CalendarClock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { rejectedKpis, rejectedRecords } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rejected-returned")({
  head: () => ({
    meta: [
      { title: "Rejected / Returned — AUX ASC Dashboard" },
      { name: "description", content: "Rejected and returned service jobs, rework rate and return cycle tracking." },
      { property: "og:title", content: "Rejected / Returned — AUX ASC Dashboard" },
      { property: "og:description", content: "Rejected, returned and rework job tracking." },
    ],
  }),
  component: RejectedReturned,
});

const statusStyles: Record<string, string> = {
  Rejected: "bg-destructive/10 text-destructive",
  Returned: "bg-accent/10 text-accent",
  Rework: "bg-warning/15 text-warning",
};

function RejectedReturned() {
  return (
    <DashboardLayout title="Rejected / Returned" subtitle="Rejected jobs, returns & rework tracking">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Rejected" value={rejectedKpis.totalRejected} icon={XCircle} tone="destructive" />
        <KpiCard label="Total Returned" value={rejectedKpis.totalReturned} icon={Undo2} tone="accent" />
        <KpiCard label="Rework Rate" value={`${rejectedKpis.reworkRate}%`} icon={RefreshCw} tone="warning" />
        <KpiCard label="Avg Return Days" value={`${rejectedKpis.avgReturnDays}d`} icon={CalendarClock} tone="primary" />
      </div>

      <ChartCard title="Rejected & Returned Records" subtitle="Recent cases" className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Ticket</th>
                <th className="px-2 py-2 font-medium">Branch</th>
                <th className="px-2 py-2 font-medium">Reason</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rejectedRecords.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-medium text-card-foreground">{r.id}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.ticket}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.branch}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.reason}</td>
                  <td className="px-2 py-2">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", statusStyles[r.status])}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}