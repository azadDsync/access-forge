"use client";

import { Graph } from "@/components/tambo/graph";
import { DataCard } from "@/components/ui/card-data";
import {
  getChannelPerformance,
  getKPIs,
  getRevenueTrend,
  getTopProducts,
  getUserGrowth,
  type RangeWindow,
  type Segment,
} from "@/services/analytics-data";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useMemo, useState } from "react";

const ranges: RangeWindow[] = ["7d", "30d", "90d"];
const segments: Segment[] = ["All", "Free", "Pro", "Enterprise"];

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<RangeWindow>("30d");
  const [segment, setSegment] = useState<Segment>("All");

  const kpis = useMemo(() => getKPIs({ range, segment }), [range, segment]);
  const revenueTrend = useMemo(
    () => getRevenueTrend({ range, segment }),
    [range, segment],
  );
  const userGrowth = useMemo(
    () => getUserGrowth({ range, segment }),
    [range, segment],
  );
  const channelPerformance = useMemo(
    () => getChannelPerformance({ segment }),
    [segment],
  );
  const topProducts = useMemo(() => getTopProducts({ limit: 5 }), []);

  const revenueGraph = useMemo(
    () => ({
      type: "line" as const,
      labels: revenueTrend.map((point) => point.label),
      datasets: [
        {
          label: "Revenue",
          data: revenueTrend.map((point) => point.value),
          color: "var(--chart-2)",
        },
      ],
    }),
    [revenueTrend],
  );

  const userGraph = useMemo(
    () => ({
      type: "bar" as const,
      labels: userGrowth.map((point) => point.label),
      datasets: [
        {
          label: "Total users",
          data: userGrowth.map((point) => point.value),
          color: "var(--chart-1)",
        },
        {
          label: "Active users",
          data: userGrowth.map((point) => point.secondary ?? 0),
          color: "var(--chart-4)",
        },
      ],
    }),
    [userGrowth],
  );

  const channelGraph = useMemo(
    () => ({
      type: "pie" as const,
      labels: channelPerformance.map((item) => item.channel),
      datasets: [
        {
          label: "Signups",
          data: channelPerformance.map((item) => item.signups),
        },
      ],
    }),
    [channelPerformance],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground/60">
              Tambo analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Accessibility growth dashboard
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              Real-time revenue, retention, and adoption insights
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1 text-xs text-foreground/70">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live data
            </div>
            <div className="flex items-center gap-2">
              {ranges.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    range === value
                      ? "bg-foreground text-background"
                      : "border border-foreground/10 text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div>
            <label className="text-xs text-foreground/70">Segment focus</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {segments.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSegment(value)}
                  className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                    segment === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/10 bg-background text-foreground/70"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-foreground/10 bg-background/40 p-4 text-xs text-foreground/70">
            <p className="font-semibold text-foreground">
              Insights for {segment} users
            </p>
            <ul className="mt-2 space-y-1">
              <li>Conversion rate is trending 4% higher than last period.</li>
              <li>Retention dip detected in onboarding stage 2.</li>
              <li>AI-generated charts can be pinned to the canvas.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-foreground/60">
              {kpi.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {formatKpiValue(kpi.value, kpi.format)}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-foreground/70">
              <TrendIcon trend={kpi.trend} />
              <span>{Math.abs(kpi.change)}%</span>
              <span className="text-foreground/50">vs last period</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1.1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <Graph
            data={revenueGraph}
            title="Revenue trend"
            showLegend={false}
            size="lg"
            variant="solid"
            ariaLabel={`Revenue trend for ${range} in ${segment} segment.`}
          />
          <p className="mt-2 text-xs text-foreground/60">
            Peak revenue day is highlighted in the AI Studio on the right.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <Graph
            data={channelGraph}
            title="Channel mix"
            showLegend
            size="lg"
            variant="bordered"
            ariaLabel="Signups by acquisition channel"
          />
          <div className="mt-3 space-y-2 text-xs text-foreground/60">
            {channelPerformance.map((item) => (
              <div
                key={item.channel}
                className="flex items-center justify-between"
              >
                <span className="text-foreground">{item.channel}</span>
                <span>{item.conversionRate}% conversion</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <Graph
            data={userGraph}
            title="User growth"
            showLegend
            size="lg"
            variant="bordered"
            ariaLabel={`User growth for ${range} in ${segment} segment.`}
          />
          <p className="mt-2 text-xs text-foreground/60">
            Active users are tracked alongside total signups.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <DataCard
            title="Top revenue drivers"
            options={topProducts.map((product) => ({
              id: product.name,
              label: product.name,
              value: product.name,
              description: `$${product.revenue.toLocaleString()} · ${product.orders} orders`,
            }))}
          />
        </div>
      </section>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") {
    return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  }
  if (trend === "down") {
    return <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />;
  }
  return <Minus className="h-3.5 w-3.5 text-foreground/50" />;
}

function formatKpiValue(value: number, format: KPIFormat) {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString()}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
    default:
      return value.toLocaleString();
  }
}

type KPIFormat = "currency" | "number" | "percent";
