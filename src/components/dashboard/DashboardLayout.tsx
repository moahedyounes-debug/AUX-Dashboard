import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Headphones,
  Package,
  Truck,
  Snowflake,
  TrendingUp,
  CalendarClock,
  AlarmClock,
  GitCompare,
  Microscope,
  Building2,
  Undo2,
  Download,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "KPI Overview", icon: LayoutDashboard },
  { to: "/monthly-trends", label: "Monthly Trends", icon: TrendingUp },
  { to: "/daily-operations", label: "Daily Operations", icon: CalendarClock },
  { to: "/pending-analysis", label: "Pending Analysis", icon: AlarmClock },
  { to: "/branch-comparison", label: "Branch Comparison", icon: GitCompare },
  { to: "/deep-insights", label: "Deep Insights", icon: Microscope },
  { to: "/spare-parts", label: "Spare Parts", icon: Package },
  { to: "/call-center", label: "Call Center", icon: Headphones },
  { to: "/asc-performance", label: "ASC Performance", icon: Building2 },
  { to: "/rejected-returned", label: "Rejected / Returned", icon: Undo2 },
  { to: "/shipments", label: "Shipments", icon: Truck },
  { to: "/export-center", label: "Export Center", icon: Download },
  { to: "/activity-log", label: "Activity Log", icon: History },
] as const;

export function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Snowflake className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-white">AUX ASC</p>
            <p className="text-xs text-sidebar-foreground/70">Performance Suite</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 text-xs text-sidebar-foreground/50">
          v4.0 · Sample data
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
          <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold text-card-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <nav className="flex gap-1 overflow-x-auto md:hidden">
              {nav.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}
