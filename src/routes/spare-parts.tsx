import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Layers, TrendingDown, XCircle, BellRing } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { getSparePartsKpis } from "@/lib/dashboard.functions";
import {
  returnKpis,
  returnRecords,
  formatNumber,
  type ReturnStatus,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/spare-parts")({
  head: () => ({
    meta: [
      { title: "Spare Parts Inventory — AUX ASC Dashboard" },
      { name: "description", content: "Spare parts stock, consumption, ABC classification and part return tracking." },
      { property: "og:title", content: "Spare Parts Inventory — AUX ASC Dashboard" },
      { property: "og:description", content: "Inventory levels, consumption and return lifecycle tracking." },
    ],
  }),
  component: SpareParts,
});

const ABC_COLORS = ["var(--chart-2)", "var(--chart-1)", "var(--chart-4)"];

const statusStyles: Record<ReturnStatus, string> = {
  PENDING_RETURN: "bg-warning/15 text-warning",
  IN_TRANSIT: "bg-accent/10 text-accent",
  RETURNED: "bg-success/10 text-success",
  IN_USE: "bg-primary/10 text-primary",
};

function SpareParts() {
  const fn = useServerFn(getSparePartsKpis);
  const { data, isLoading, error } = useQuery({ queryKey: ["spare-parts-kpis"], queryFn: () => fn() });

  return (
    <DashboardLayout title="Spare Parts Inventory" subtitle="Live data · stock, consumption & return lifecycle">
      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={(error as Error)?.message ?? "No data"} />
      ) : (
        <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total SKUs" value={formatNumber(data.kpis.totalSkus)} icon={Layers} tone="primary" />
        <KpiCard label="Total Stock" value={formatNumber(data.kpis.totalStock)} icon={Boxes} tone="success" />
        <KpiCard label="Low Stock" value={data.kpis.lowStock} icon={TrendingDown} tone="warning" />
        <KpiCard label="Out of Stock" value={data.kpis.outOfStock} icon={XCircle} tone="destructive" />
        <KpiCard label="Reorder Alert" value={data.kpis.reorderAlert} icon={BellRing} tone="accent" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Branch Stock Summary" subtitle="Stock by warehouse / SVC center">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.branchStock} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="branch" stroke="var(--muted-foreground)" fontSize={12} width={90} />
              <Tooltip />
              <Bar dataKey="stock" name="Stock" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ABC Classification" subtitle="Share of SKUs by value class">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.abcClassification} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                {data.abcClassification.map((_, i) => (
                  <Cell key={i} fill={ABC_COLORS[i % ABC_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Part Return Status" subtitle="Lifecycle tracking">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Total Tracked</p>
              <p className="text-xl font-bold text-card-foreground">{returnKpis.totalTracked}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Pending Return</p>
              <p className="text-xl font-bold text-warning">{returnKpis.pendingReturn}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">In Transit</p>
              <p className="text-xl font-bold text-accent">{returnKpis.inTransit}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Returned</p>
              <p className="text-xl font-bold text-success">{returnKpis.returned}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">ID</th>
                  <th className="px-2 py-2 font-medium">Part</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {returnRecords.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-medium text-card-foreground">{r.id}</td>
                    <td className="px-2 py-2 text-muted-foreground">{r.part}</td>
                    <td className="px-2 py-2">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", statusStyles[r.status])}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
        </>
      )}
    </DashboardLayout>
  );
}
