import {
  ActivityIcon,
  ArrowRightIcon,
  BadgeCheck,
  BookOpenIcon,
  BusFront,
  CalendarRangeIcon,
  CarFrontIcon,
  DollarSignIcon,
  InboxIcon,
  MapIcon,
  Shield,
  Star,
  TicketIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { BookingsTrendChart, type TrendPoint } from "./bookings-trend-chart";
import { ChartRangePicker } from "./chart-range-picker";

type DashboardSessionData = Awaited<ReturnType<typeof requireDashboardSession>>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface AdminOverviewProps {
  session: DashboardSessionData["session"];
  label: string;
  highlights: string[];
  range?: string;
  from?: string;
  to?: string;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

const PRESET_DAYS: Record<string, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

function resolveRange(range: string | undefined, from?: string, to?: string) {
  const today = startOfDay(new Date());

  if (range === "custom" && from && to) {
    const f = startOfDay(new Date(from));
    const t = endOfDay(new Date(to));
    if (!Number.isNaN(f.getTime()) && !Number.isNaN(t.getTime()) && f <= t) {
      return { start: f, end: t, key: "custom" as const };
    }
  }

  const days = PRESET_DAYS[range ?? ""] ?? 14;
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return { start, end: endOfDay(today), key: (range ?? "14d") as string };
}

export async function AdminOverview({
  session,
  label,
  highlights,
  range,
  from,
  to,
}: AdminOverviewProps) {
  const today = startOfDay(new Date());
  const { start: trendStart, end: trendEnd, key: rangeKey } = resolveRange(
    range,
    from,
    to,
  );
  const trendDays =
    Math.floor(
      (startOfDay(trendEnd).getTime() - trendStart.getTime()) /
        (24 * 60 * 60 * 1000),
    ) + 1;
  const rangeLabel =
    rangeKey === "custom" && from && to
      ? `${new Date(from).toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${new Date(
          to,
        ).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : `Last ${trendDays} day${trendDays === 1 ? "" : "s"}`;

  const [
    tourCount,
    vehicleCount,
    driverCount,
    userCount,
    avgRatingResult,
    totalBookings,
    paidBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenueResult,
    revenue30dResult,
    unreadMessages,
    pendingMessages,
    trendBookingsRaw,
    topToursRaw,
    recentBookingsRaw,
    activeDriversCount,
  ] = await Promise.all([
    prisma.tourPackage.count(),
    prisma.vehicle.count(),
    prisma.user.count({ where: { role: "driver" } }),
    prisma.user.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "paid" } }),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.booking.count({ where: { status: "cancelled" } }),
    prisma.booking.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: "paid",
        createdAt: {
          gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: { amount: true },
    }),
    prisma.contactMessage.count({ where: { status: "unread" } }),
    prisma.contactMessage.count(),
    prisma.booking.findMany({
      where: { createdAt: { gte: trendStart, lte: trendEnd } },
      select: { createdAt: true, amount: true, status: true },
    }),
    prisma.booking.groupBy({
      by: ["tourPackageId"],
      _count: { _all: true },
      orderBy: { _count: { tourPackageId: "desc" } },
      take: 5,
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        tourPackage: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true, image: true } },
      },
    }),
    prisma.user.count({ where: { role: "driver", banned: { not: true } } }),
  ]);

  const stats = {
    tourCount,
    vehicleCount,
    driverCount,
    userCount,
    avgRating: avgRatingResult._avg.rating ?? 0,
  };

  const totalRevenue = totalRevenueResult._sum.amount ?? 0;
  const revenue30d = revenue30dResult._sum.amount ?? 0;

  const trendByDay = new Map<string, { bookings: number; revenue: number }>();
  for (let i = 0; i < trendDays; i++) {
    const d = new Date(trendStart);
    d.setDate(trendStart.getDate() + i);
    trendByDay.set(isoDay(d), { bookings: 0, revenue: 0 });
  }
  for (const b of trendBookingsRaw) {
    const key = isoDay(startOfDay(b.createdAt));
    const slot = trendByDay.get(key);
    if (!slot) continue;
    slot.bookings += 1;
    if (b.status === "paid") slot.revenue += Number(b.amount);
  }
  const trendData: TrendPoint[] = Array.from(trendByDay.entries()).map(
    ([date, v]) => ({ date, bookings: v.bookings, revenue: Math.round(v.revenue) }),
  );

  const trendBookingsTotal = trendData.reduce((s, p) => s + p.bookings, 0);
  const trendRevenueTotal = trendData.reduce((s, p) => s + p.revenue, 0);

  const topTourIds = topToursRaw.map((t) => t.tourPackageId);
  const topTourPackages = topTourIds.length
    ? await prisma.tourPackage.findMany({
        where: { id: { in: topTourIds } },
        select: { id: true, name: true, slug: true, thumbnail: true, price: true },
      })
    : [];
  const topTours = topToursRaw.map((t) => {
    const tp = topTourPackages.find((p) => p.id === t.tourPackageId);
    return {
      id: t.tourPackageId,
      name: tp?.name ?? "Unknown tour",
      slug: tp?.slug ?? "",
      price: tp?.price ?? 0,
      bookings: t._count._all,
    };
  });

  const recentBookings = recentBookingsRaw.map((b) => ({
    id: b.id,
    customer: b.user.name,
    email: b.user.email,
    tour: b.tourPackage.name,
    amount: Number(b.amount),
    currency: b.currency,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.name;

  const quickActions = [
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: TicketIcon,
      description: "Manage reservations",
      iconGradient: "from-amber-400 to-orange-500",
      iconShadow: "shadow-amber-400/40",
      hoverBorder: "hover:border-amber-300/60 dark:hover:border-amber-700/40",
      hoverBg: "hover:bg-amber-50/80 dark:hover:bg-amber-950/30",
    },
    {
      label: "Tours",
      href: "/dashboard/tours",
      icon: MapIcon,
      description: "Tour packages",
      iconGradient: "from-sky-400 to-blue-600",
      iconShadow: "shadow-sky-400/40",
      hoverBorder: "hover:border-sky-300/60 dark:hover:border-sky-700/40",
      hoverBg: "hover:bg-sky-50/80 dark:hover:bg-sky-950/30",
    },
    {
      label: "Drivers",
      href: "/dashboard/drivers",
      icon: BusFront,
      description: "Driver management",
      iconGradient: "from-emerald-400 to-teal-500",
      iconShadow: "shadow-emerald-400/40",
      hoverBorder: "hover:border-emerald-300/60 dark:hover:border-emerald-700/40",
      hoverBg: "hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
    },
    {
      label: "Vehicles",
      href: "/dashboard/vehicles",
      icon: CarFrontIcon,
      description: "Fleet overview",
      iconGradient: "from-violet-500 to-purple-600",
      iconShadow: "shadow-violet-400/40",
      hoverBorder: "hover:border-violet-300/60 dark:hover:border-violet-700/40",
      hoverBg: "hover:bg-violet-50/80 dark:hover:bg-violet-950/30",
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: UsersIcon,
      description: "User accounts",
      iconGradient: "from-rose-400 to-pink-600",
      iconShadow: "shadow-rose-400/40",
      hoverBorder: "hover:border-rose-300/60 dark:hover:border-rose-700/40",
      hoverBg: "hover:bg-rose-50/80 dark:hover:bg-rose-950/30",
    },
    {
      label: "Blog",
      href: "/dashboard/blog",
      icon: BookOpenIcon,
      description: "Content management",
      iconGradient: "from-orange-400 to-red-500",
      iconShadow: "shadow-orange-400/40",
      hoverBorder: "hover:border-orange-300/60 dark:hover:border-orange-700/40",
      hoverBg: "hover:bg-orange-50/80 dark:hover:bg-orange-950/30",
    },
  ];

  const statusStyle: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  const totalForRate = paidBookings + pendingBookings + cancelledBookings;
  const conversionRate = totalForRate > 0 ? (paidBookings / totalForRate) * 100 : 0;

  return (
    <>
      <SiteHeader title="Operations Dashboard" subtitle="TourVibe control panel" />
      <div className="flex flex-col gap-5 p-4 md:gap-6 md:p-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 text-white shadow-2xl shadow-indigo-950/40 md:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl" />
            <div className="absolute right-1/4 bottom-0 size-40 rounded-full bg-pink-500/15 blur-2xl" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 backdrop-blur-sm">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-violet-400 shadow-sm shadow-violet-400/80" />
                {label}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                  {greeting}, {firstName} 👋
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Here&apos;s an overview of your TourVibe operations today.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                {
                  label: "Avg Rating",
                  value: `${stats.avgRating.toFixed(1)} / 5`,
                  icon: Star,
                  color: "text-amber-300",
                  bg: "bg-amber-500/15 border-amber-400/20",
                },
                {
                  label: "Active Drivers",
                  value: String(activeDriversCount),
                  icon: BusFront,
                  color: "text-emerald-300",
                  bg: "bg-emerald-500/15 border-emerald-400/20",
                },
                {
                  label: "Tour Packages",
                  value: String(stats.tourCount),
                  icon: MapIcon,
                  color: "text-sky-300",
                  bg: "bg-sky-500/15 border-sky-400/20",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex min-w-[90px] flex-col gap-1.5 rounded-xl border px-4 py-3 backdrop-blur-sm ${item.bg}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`size-3.5 ${item.color}`} />
                      <span className="text-lg font-black tabular-nums">{item.value}</span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KPI ROW */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Revenue"
            value={`$${Math.round(totalRevenue).toLocaleString()}`}
            sub={`$${Math.round(revenue30d).toLocaleString()} last 30d`}
            icon={DollarSignIcon}
            tone="emerald"
          />
          <KpiCard
            label="Total Bookings"
            value={totalBookings.toLocaleString()}
            sub={`${paidBookings} paid · ${pendingBookings} pending`}
            icon={TicketIcon}
            tone="amber"
          />
          <KpiCard
            label="Conversion"
            value={`${conversionRate.toFixed(1)}%`}
            sub={`${paidBookings} of ${totalForRate} converted`}
            icon={TrendingUpIcon}
            tone="sky"
          />
          <KpiCard
            label="Inbox"
            value={unreadMessages.toLocaleString()}
            sub={`${pendingMessages} total messages`}
            icon={InboxIcon}
            tone="rose"
            href="/dashboard/messages"
          />
        </div>

        {/* TREND CHART + TOP TOURS */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2.5 text-base">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm shadow-sky-400/30">
                      <ActivityIcon className="size-3.5 text-white" />
                    </div>
                    Bookings &amp; Revenue
                  </CardTitle>
                  <CardDescription>{rangeLabel}</CardDescription>
                </div>
                <ChartRangePicker
                  range={rangeKey}
                  from={from}
                  to={to}
                />
              </div>
              <div className="mt-3 flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    Bookings
                  </p>
                  <p className="text-lg font-black tabular-nums text-sky-700 dark:text-sky-300">
                    {trendBookingsTotal}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    Revenue
                  </p>
                  <p className="text-lg font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                    ${trendRevenueTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <BookingsTrendChart data={trendData} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30">
                  <CalendarRangeIcon className="size-3.5 text-white" />
                </div>
                Top Tours
              </CardTitle>
              <CardDescription>Most booked packages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topTours.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  No bookings yet
                </p>
              ) : (
                topTours.map((t, i) => {
                  const max = topTours[0]?.bookings || 1;
                  const pct = (t.bookings / max) * 100;
                  return (
                    <Link
                      key={t.id}
                      href={t.slug ? `/tours/${t.slug}` : "/dashboard/tours"}
                      className="block rounded-xl border border-border/60 bg-muted/10 p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-black text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            {i + 1}
                          </span>
                          <p className="truncate text-sm font-semibold">{t.name}</p>
                        </div>
                        <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                          {t.bookings}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* STAT CARDS */}
        <SectionCards stats={stats} />

        {/* QUICK ACTIONS + ROLE PERMISSIONS */}
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30">
                  <ZapIcon className="size-3.5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Jump to key management sections</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/10 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.hoverBorder} ${action.hoverBg}`}
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${action.iconGradient} ${action.iconShadow}`}
                    >
                      <Icon className="size-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{action.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-70" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-violet-950/90 to-purple-950 text-white shadow-xl shadow-indigo-950/30">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-violet-500/15 blur-2xl" />
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
                  <Shield className="size-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">Role Permissions</CardTitle>
                  <CardDescription className="text-xs text-white/40">
                    Active RBAC profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-1.5">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.05] px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/[0.09] hover:text-white/90"
                >
                  <span className="inline-block size-1.5 shrink-0 rounded-full bg-violet-400 shadow-sm shadow-violet-400/80" />
                  {item}
                </div>
              ))}
              {highlights.length === 0 && (
                <p className="py-4 text-center text-sm text-white/25">
                  No permissions assigned
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RECENT BOOKINGS + ACCOUNT */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2.5 text-base">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-400/30">
                      <TicketIcon className="size-3.5 text-white" />
                    </div>
                    Recent Bookings
                  </CardTitle>
                  <CardDescription>Latest 5 reservations</CardDescription>
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  No bookings yet
                </p>
              ) : (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-3.5 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{b.tour}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.customer} · {b.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs font-bold tabular-nums">
                        {b.currency.toUpperCase()} {b.amount.toFixed(2)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          statusStyle[b.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 shadow-sm shadow-cyan-400/30">
                  <BadgeCheck className="size-3.5 text-white" />
                </div>
                Account Snapshot
              </CardTitle>
              <CardDescription>Active session identity</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { label: "Email address", value: session.user.email, mono: false },
                { label: "User ID", value: session.user.id, mono: true },
                { label: "Role key", value: session.user.role ?? "—", mono: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 px-4 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/70">
                    {item.label}
                  </p>
                  <p
                    className={`mt-1.5 break-all font-semibold text-foreground ${
                      item.mono ? "font-mono text-xs leading-5" : "text-sm"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

const TONES: Record<
  string,
  { card: string; iconBg: string; valueColor: string; line: string }
> = {
  emerald: {
    card: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-50/40 border-emerald-300/50 dark:from-emerald-950/60 dark:via-green-950/30 dark:to-emerald-950/20 dark:border-emerald-700/30",
    iconBg: "from-emerald-400 to-teal-500 shadow-emerald-400/40",
    valueColor: "text-emerald-700 dark:text-emerald-300",
    line: "from-emerald-400 to-teal-500",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50/40 border-amber-300/50 dark:from-amber-950/60 dark:via-orange-950/30 dark:to-amber-950/20 dark:border-amber-700/30",
    iconBg: "from-amber-400 to-orange-500 shadow-amber-400/40",
    valueColor: "text-amber-700 dark:text-amber-300",
    line: "from-amber-400 to-orange-500",
  },
  sky: {
    card: "bg-gradient-to-br from-sky-50 via-blue-50/80 to-sky-50/40 border-sky-300/50 dark:from-sky-950/60 dark:via-blue-950/30 dark:to-sky-950/20 dark:border-sky-700/30",
    iconBg: "from-sky-400 to-blue-600 shadow-sky-400/40",
    valueColor: "text-sky-700 dark:text-sky-300",
    line: "from-sky-400 to-blue-600",
  },
  rose: {
    card: "bg-gradient-to-br from-rose-50 via-pink-50/80 to-rose-50/40 border-rose-300/50 dark:from-rose-950/60 dark:via-pink-950/30 dark:to-rose-950/20 dark:border-rose-700/30",
    iconBg: "from-rose-400 to-pink-600 shadow-rose-400/40",
    valueColor: "text-rose-700 dark:text-rose-300",
    line: "from-rose-400 to-pink-600",
  },
};

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
  href?: string;
}

function KpiCard({ label, value, sub, icon: Icon, tone, href }: KpiCardProps) {
  const t = TONES[tone];
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${t.card}`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-80 ${t.line}`} />
      <div className="relative flex items-start justify-between">
        <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${t.iconBg}`}>
          <Icon className="size-5 text-white drop-shadow" />
        </div>
        {href && (
          <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-70" />
        )}
      </div>
      <div className="relative mt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          {label}
        </p>
        <p className={`mt-1 text-3xl font-black tabular-nums tracking-tight ${t.valueColor}`}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">{sub}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
