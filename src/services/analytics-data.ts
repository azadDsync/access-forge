export type RangeWindow = "7d" | "30d" | "90d";
export type Segment = "All" | "Free" | "Pro" | "Enterprise";

export type KPI = {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "flat";
  format: "currency" | "number" | "percent";
};

export type TrendPoint = {
  label: string;
  value: number;
  secondary?: number;
};

export type ChannelPerformance = {
  channel: string;
  signups: number;
  conversionRate: number;
};

export type TopProduct = {
  name: string;
  revenue: number;
  orders: number;
};

const rangeMultiplier: Record<RangeWindow, number> = {
  "7d": 0.28,
  "30d": 1,
  "90d": 2.7,
};

const segmentMultiplier: Record<Segment, number> = {
  All: 1,
  Free: 0.62,
  Pro: 1.08,
  Enterprise: 1.55,
};

const baseKpis: KPI[] = [
  {
    id: "revenue",
    label: "Net revenue",
    value: 128400,
    change: 12.4,
    trend: "up",
    format: "currency",
  },
  {
    id: "active-users",
    label: "Active users",
    value: 48250,
    change: 6.2,
    trend: "up",
    format: "number",
  },
  {
    id: "retention",
    label: "Retention rate",
    value: 87.3,
    change: -1.8,
    trend: "down",
    format: "percent",
  },
  {
    id: "nps",
    label: "NPS",
    value: 52,
    change: 3.1,
    trend: "up",
    format: "number",
  },
];

const revenueTrend: Record<RangeWindow, TrendPoint[]> = {
  "7d": [
    { label: "Mon", value: 9800 },
    { label: "Tue", value: 11200 },
    { label: "Wed", value: 10400 },
    { label: "Thu", value: 12100 },
    { label: "Fri", value: 14900 },
    { label: "Sat", value: 13200 },
    { label: "Sun", value: 15800 },
  ],
  "30d": [
    { label: "W1", value: 112000 },
    { label: "W2", value: 118500 },
    { label: "W3", value: 123400 },
    { label: "W4", value: 131800 },
  ],
  "90d": [
    { label: "Apr", value: 318000 },
    { label: "May", value: 342000 },
    { label: "Jun", value: 356000 },
    { label: "Jul", value: 374000 },
    { label: "Aug", value: 402000 },
    { label: "Sep", value: 431000 },
  ],
};

const userGrowth: Record<RangeWindow, TrendPoint[]> = {
  "7d": [
    { label: "Mon", value: 6200, secondary: 4200 },
    { label: "Tue", value: 6450, secondary: 4380 },
    { label: "Wed", value: 6600, secondary: 4510 },
    { label: "Thu", value: 6750, secondary: 4680 },
    { label: "Fri", value: 7020, secondary: 4820 },
    { label: "Sat", value: 7210, secondary: 4950 },
    { label: "Sun", value: 7430, secondary: 5120 },
  ],
  "30d": [
    { label: "W1", value: 22400, secondary: 15000 },
    { label: "W2", value: 23600, secondary: 15900 },
    { label: "W3", value: 24500, secondary: 16450 },
    { label: "W4", value: 25800, secondary: 17300 },
  ],
  "90d": [
    { label: "Apr", value: 74200, secondary: 50200 },
    { label: "May", value: 78500, secondary: 53800 },
    { label: "Jun", value: 82400, secondary: 56300 },
    { label: "Jul", value: 86200, secondary: 59200 },
    { label: "Aug", value: 90400, secondary: 62700 },
    { label: "Sep", value: 94800, secondary: 66200 },
  ],
};

const channelPerformance: ChannelPerformance[] = [
  { channel: "Organic", signups: 18400, conversionRate: 3.9 },
  { channel: "Paid", signups: 12750, conversionRate: 2.4 },
  { channel: "Referral", signups: 9100, conversionRate: 4.8 },
  { channel: "Social", signups: 6700, conversionRate: 1.6 },
];

const topProducts: TopProduct[] = [
  { name: "Accessibility Pro", revenue: 84200, orders: 420 },
  { name: "Compliance Suite", revenue: 62400, orders: 318 },
  { name: "Audit Assist", revenue: 49800, orders: 262 },
  { name: "Remediation Kit", revenue: 42200, orders: 210 },
  { name: "Insight Tracker", revenue: 36500, orders: 188 },
];

const scaleValue = (value: number, range: RangeWindow, segment: Segment) =>
  Math.round(value * rangeMultiplier[range] * segmentMultiplier[segment]);

const scalePercent = (value: number, range: RangeWindow, segment: Segment) =>
  Math.round(value * (0.85 + segmentMultiplier[segment] * 0.1) * 10) / 10;

export function getKPIs(params: {
  range?: RangeWindow;
  segment?: Segment;
} = {}): KPI[] {
  const range = params.range ?? "30d";
  const segment = params.segment ?? "All";

  return baseKpis.map((kpi) => {
    if (kpi.format === "percent") {
      return {
        ...kpi,
        value: scalePercent(kpi.value, range, segment),
        change: Math.round(kpi.change * (segmentMultiplier[segment] ?? 1) * 10) / 10,
      };
    }

    return {
      ...kpi,
      value: scaleValue(kpi.value, range, segment),
      change: Math.round(kpi.change * (segmentMultiplier[segment] ?? 1) * 10) / 10,
    };
  });
}

export function getRevenueTrend(params: {
  range?: RangeWindow;
  segment?: Segment;
} = {}): TrendPoint[] {
  const range = params.range ?? "30d";
  const segment = params.segment ?? "All";

  return revenueTrend[range].map((point) => ({
    ...point,
    value: scaleValue(point.value, range, segment),
  }));
}

export function getUserGrowth(params: {
  range?: RangeWindow;
  segment?: Segment;
} = {}): TrendPoint[] {
  const range = params.range ?? "30d";
  const segment = params.segment ?? "All";

  return userGrowth[range].map((point) => ({
    ...point,
    value: scaleValue(point.value, range, segment),
    secondary: point.secondary
      ? scaleValue(point.secondary, range, segment)
      : undefined,
  }));
}

export function getChannelPerformance(params: {
  segment?: Segment;
} = {}): ChannelPerformance[] {
  const segment = params.segment ?? "All";

  return channelPerformance.map((channel) => ({
    ...channel,
    signups: scaleValue(channel.signups, "30d", segment),
    conversionRate: Math.round(
      channel.conversionRate * (0.9 + segmentMultiplier[segment] * 0.08) * 10,
    ) / 10,
  }));
}

export function getTopProducts(params: { limit?: number } = {}): TopProduct[] {
  const limit = params.limit ?? 5;
  return topProducts.slice(0, Math.max(1, limit));
}
