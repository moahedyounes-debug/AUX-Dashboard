import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, Search, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { returnRecords } from "@/lib/dashboard-data";

export const Route = createFileRoute("/shipments")({
  head: () => ({
    meta: [
      { title: "Shipment Tracking — AUX ASC Dashboard" },
      { name: "description", content: "Track SMSA Express shipments and service order deliveries by AWB number." },
      { property: "og:title", content: "Shipment Tracking — AUX ASC Dashboard" },
      { property: "og:description", content: "Live SMSA Express shipment tracking by AWB." },
    ],
  }),
  component: Shipments,
});

function Shipments() {
  const [awb, setAwb] = useState("");
  const trackUrl = "https://www.smsaexpress.com/en/gb/track-shipment";
  const tracked = returnRecords.filter((r) => r.awb !== "—");

  return (
    <DashboardLayout title="Shipment Tracking" subtitle="SMSA Express delivery tracking">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground">Track a shipment</h3>
        <p className="mt-1 text-xs text-muted-foreground">Enter an AWB / tracking number to open it on SMSA Express.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="e.g. SMSA882140"
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <a
            href={awb ? `${trackUrl}?tracknumbers=${encodeURIComponent(awb)}` : trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              !awb && "pointer-events-none opacity-50",
            )}
          >
            <Truck className="size-4" /> Track
          </a>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Active shipments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-2 font-medium">AWB</th>
                <th className="px-2 py-2 font-medium">Part</th>
                <th className="px-2 py-2 font-medium">Branch</th>
                <th className="px-2 py-2 font-medium">Updated</th>
                <th className="px-2 py-2 font-medium">Track</th>
              </tr>
            </thead>
            <tbody>
              {tracked.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-medium text-card-foreground">{r.awb}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.part}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.branch}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.updated}</td>
                  <td className="px-2 py-2">
                    <a
                      href={`${trackUrl}?tracknumbers=${encodeURIComponent(r.awb)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Open <ExternalLink className="size-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
