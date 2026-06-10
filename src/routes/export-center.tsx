import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { exportDatasets, formatNumber } from "@/lib/dashboard-data";

export const Route = createFileRoute("/export-center")({
  head: () => ({
    meta: [
      { title: "Export Center — AUX ASC Dashboard" },
      { name: "description", content: "Export service, inventory and call center datasets to Excel and CSV." },
      { property: "og:title", content: "Export Center — AUX ASC Dashboard" },
      { property: "og:description", content: "Download dashboard datasets as Excel or CSV." },
    ],
  }),
  component: ExportCenter,
});

function downloadCsv(name: string) {
  const blob = new Blob([`Dataset,Generated\n${name},${new Date().toISOString()}\n`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportCenter() {
  return (
    <DashboardLayout title="Export Center" subtitle="Download datasets as Excel or CSV">
      <ChartCard title="Available Datasets" subtitle="Click export to download a CSV">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Dataset</th>
                <th className="px-2 py-2 font-medium">Rows</th>
                <th className="px-2 py-2 font-medium">Format</th>
                <th className="px-2 py-2 font-medium">Source</th>
                <th className="px-2 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {exportDatasets.map((d) => (
                <tr key={d.name} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-medium text-card-foreground">{d.name}</td>
                  <td className="px-2 py-2 text-muted-foreground">{formatNumber(d.rows)}</td>
                  <td className="px-2 py-2 text-muted-foreground">{d.format}</td>
                  <td className="px-2 py-2 text-muted-foreground">{d.source}</td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => downloadCsv(d.name)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <Download className="size-3.5" /> Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}