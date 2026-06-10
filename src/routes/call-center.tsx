import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Phone, PhoneOff, Gauge, Timer, Clock } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Loading, ErrorState } from "@/components/dashboard/Loading";
import { getCallCenterKpis, getEvaluations } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/call-center")({
  head: () => ({
    meta: [
      { title: "Call Center Analytics — AUX ASC Dashboard" },
      { name: "description", content: "Live call center SLA, abandon rate, WhatsApp channel and agent evaluation analytics." },
      { property: "og:title", content: "Call Center Analytics — AUX ASC Dashboard" },
      { property: "og:description", content: "Live SLA, abandon rate and agent performance metrics." },
    ],
  }),
  component: CallCenter,
});

function CallCenter() {
  const ccFn = useServerFn(getCallCenterKpis);
  const evFn = useServerFn(getEvaluations);
  const cc = useQuery({ queryKey: ["call-center"], queryFn: () => ccFn() });
  const ev = useQuery({ queryKey: ["evaluations"], queryFn: () => evFn() });

  return (
    <DashboardLayout title="Call Center Analytics" subtitle="Live data · calls, WhatsApp & agent evaluation">
      {cc.isLoading ? (
        <Loading />
      ) : cc.error || !cc.data ? (
        <ErrorState message={(cc.error as Error)?.message ?? "No data"} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Total IB Calls" value={cc.data.kpis.totalIB} icon={Phone} tone="primary" />
            <KpiCard label="Answered IB" value={cc.data.kpis.answeredIB} icon={Phone} tone="success" />
            <KpiCard label="SLA Rate" value={`${cc.data.kpis.slaRate}%`} icon={Gauge} tone="accent" hint={`${cc.data.kpis.withinSLA} within SLA`} />
            <KpiCard label="Abandon Rate" value={`${cc.data.kpis.abandonRate}%`} icon={PhoneOff} tone="destructive" hint={`${cc.data.kpis.abandonedIB} abandoned`} />
            <KpiCard label="Avg AHT" value={cc.data.kpis.avgAHT} icon={Timer} tone="primary" />
            <KpiCard label="Avg THT" value={cc.data.kpis.avgTHT} icon={Clock} tone="warning" />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ChartCard title="SLA vs Abandon Rate" subtitle="Monthly trend">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={cc.data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip /><Legend />
                  <Line type="monotone" dataKey="slaRate" name="SLA Rate %" stroke="var(--chart-3)" strokeWidth={2} />
                  <Line type="monotone" dataKey="abandonRate" name="Abandon Rate %" stroke="var(--destructive)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Calls by Queue" subtitle="Inbound distribution">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cc.data.callsByQueue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="queue" stroke="var(--muted-foreground)" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="calls" name="Calls" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="WhatsApp Channel" subtitle="Messages per month">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cc.data.whatsapp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="messages" name="Messages" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Agent Evaluation" subtitle="Average score (1–5 scale)">
              {ev.isLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
              ) : ev.data && ev.data.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                        <th className="py-2 pr-2 font-medium">Agent</th>
                        <th className="px-2 py-2 font-medium">Top Category</th>
                        <th className="px-2 py-2 font-medium">Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.data.map((a) => {
                        const top = [...a.categories].sort((x, y) => y.score - x.score)[0];
                        return (
                          <tr key={a.agent} className="border-b border-border/60">
                            <td className="py-2 pr-2 font-medium text-card-foreground">{a.agent}</td>
                            <td className="px-2 py-2 text-muted-foreground">{top ? `${top.name} (${top.score})` : "—"}</td>
                            <td className="px-2 py-2">
                              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">{a.overall}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (<p className="py-12 text-center text-sm text-muted-foreground">No evaluations.</p>)}
            </ChartCard>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
