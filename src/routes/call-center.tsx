import { createFileRoute } from "@tanstack/react-router";
import { Phone, PhoneOff, Gauge, MessageSquare, Timer, Clock } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  callCenterKpis,
  callCenterMonthly,
  callsByQueue,
  whatsappChannel,
  agentEvaluations,
} from "@/lib/dashboard-data";

export const Route = createFileRoute("/call-center")({
  head: () => ({
    meta: [
      { title: "Call Center Analytics — AUX ASC Dashboard" },
      { name: "description", content: "Call center SLA, abandon rate, WhatsApp channel and agent evaluation analytics." },
      { property: "og:title", content: "Call Center Analytics — AUX ASC Dashboard" },
      { property: "og:description", content: "SLA, abandon rate and agent performance metrics." },
    ],
  }),
  component: CallCenter,
});

function CallCenter() {
  return (
    <DashboardLayout title="Call Center Analytics" subtitle="Calls, WhatsApp & agent evaluation (Jun 2025)">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total IB Calls" value={callCenterKpis.totalIB} icon={Phone} tone="primary" />
        <KpiCard label="Answered IB" value={callCenterKpis.answeredIB} icon={Phone} tone="success" />
        <KpiCard label="SLA Rate" value={`${callCenterKpis.slaRate}%`} icon={Gauge} tone="accent" hint={`${callCenterKpis.withinSLA} within SLA`} />
        <KpiCard label="Abandon Rate" value={`${callCenterKpis.abandonRate}%`} icon={PhoneOff} tone="destructive" hint={`${callCenterKpis.abandonedIB} abandoned`} />
        <KpiCard label="Avg AHT" value={callCenterKpis.avgAHT} icon={Timer} tone="primary" />
        <KpiCard label="Avg THT" value={callCenterKpis.avgTHT} icon={Clock} tone="warning" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title="SLA vs Abandon Rate" subtitle="Monthly trend (May–Jun 2025)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={callCenterMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="slaRate" name="SLA Rate %" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="abandonRate" name="Abandon Rate %" stroke="var(--destructive)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Calls by Queue" subtitle="Inbound distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={callsByQueue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="queue" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="calls" name="Calls" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="WhatsApp Channel" subtitle="Messages & SLA %">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={whatsappChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" name="Messages" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Agent Evaluation" subtitle="Monthly score (1–5 scale)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">Agent</th>
                  <th className="px-2 py-2 font-medium">Quality</th>
                  <th className="px-2 py-2 font-medium">Courtesy</th>
                  <th className="px-2 py-2 font-medium">Technical</th>
                  <th className="px-2 py-2 font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {agentEvaluations.map((a) => (
                  <tr key={a.agent} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-medium text-card-foreground">{a.agent}</td>
                    <td className="px-2 py-2 text-muted-foreground">{a.quality}</td>
                    <td className="px-2 py-2 text-muted-foreground">{a.courtesy}</td>
                    <td className="px-2 py-2 text-muted-foreground">{a.technical}</td>
                    <td className="px-2 py-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">{a.overall}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
