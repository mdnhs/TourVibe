"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface TrendPoint {
  date: string;
  bookings: number;
  revenue: number;
}

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "oklch(0.65 0.20 230)",
  },
  revenue: {
    label: "Revenue",
    color: "oklch(0.72 0.18 160)",
  },
} satisfies ChartConfig;

export function BookingsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-bookings)" stopOpacity={0.55} />
            <stop offset="95%" stopColor="var(--color-bookings)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.55} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => {
            const d = new Date(value);
            return d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const d = new Date(value as string);
                return d.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="revenue"
          type="monotone"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          stackId="a"
        />
        <Area
          dataKey="bookings"
          type="monotone"
          fill="url(#fillBookings)"
          stroke="var(--color-bookings)"
          strokeWidth={2}
          stackId="b"
        />
      </AreaChart>
    </ChartContainer>
  );
}
