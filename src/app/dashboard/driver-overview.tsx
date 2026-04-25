import {
  ArrowRightIcon,
  BadgeCheck,
  BellIcon,
  CalendarCheck2,
  CalendarClock,
  CarFrontIcon,
  MapIcon,
  MapPinIcon,
  RouteIcon,
  Shield,
  TicketIcon,
  UserCogIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

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

type DashboardSessionData = Awaited<ReturnType<typeof requireDashboardSession>>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface DriverOverviewProps {
  session: DashboardSessionData["session"];
  label: string;
  highlights: string[];
}

export async function DriverOverview({
  session,
  label,
  highlights,
}: DriverOverviewProps) {
  const userId = session.user.id;

  const assignedBookingFilter = {
    tourPackage: {
      vehicles: { some: { vehicle: { driverId: userId } } },
    },
  } as const;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    assignedTotal,
    assignedPaid,
    assignedPending,
    assignedCancelled,
    assignedToday,
    myVehicles,
    coveredTours,
    unreadNotifications,
    recentAssignedRaw,
  ] = await Promise.all([
    prisma.booking.count({ where: assignedBookingFilter }),
    prisma.booking.count({
      where: { ...assignedBookingFilter, status: "paid" },
    }),
    prisma.booking.count({
      where: { ...assignedBookingFilter, status: "pending" },
    }),
    prisma.booking.count({
      where: { ...assignedBookingFilter, status: "cancelled" },
    }),
    prisma.booking.count({
      where: {
        ...assignedBookingFilter,
        createdAt: { gte: startOfToday },
      },
    }),
    prisma.vehicle.findMany({
      where: { driverId: userId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        licensePlate: true,
        thumbnail: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tourPackage.count({
      where: { vehicles: { some: { vehicle: { driverId: userId } } } },
    }),
    prisma.notification.count({
      where: {
        OR: [{ targetUserId: null }, { targetUserId: userId }],
        reads: { none: { userId } },
      },
    }),
    prisma.booking.findMany({
      where: assignedBookingFilter,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        tourPackage: { select: { name: true, duration: true, slug: true } },
        user: { select: { name: true, email: true, image: true } },
      },
    }),
  ]);

  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.name;

  const recentAssigned = recentAssignedRaw.map((b) => ({
    id: b.id,
    tourName: b.tourPackage.name,
    duration: b.tourPackage.duration,
    customerName: b.user.name,
    status: b.status,
    amount: Number(b.amount),
    currency: b.currency,
    createdAt: b.createdAt.toISOString(),
  }));

  const statCards = [
    {
      label: "Assigned Trips",
      value: assignedTotal,
      description: "Linked to your fleet",
      icon: TicketIcon,
      iconGradient: "from-amber-400 to-orange-500",
      iconShadow: "shadow-amber-400/40",
      valueColor: "text-amber-700 dark:text-amber-300",
      card: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50/40 border-amber-300/50 dark:from-amber-950/60 dark:via-orange-950/30 dark:to-amber-950/20 dark:border-amber-700/30",
      accentLine: "from-amber-400 to-orange-500",
    },
    {
      label: "Confirmed",
      value: assignedPaid,
      description: "Paid trips ready to run",
      icon: CalendarCheck2,
      iconGradient: "from-emerald-400 to-teal-500",
      iconShadow: "shadow-emerald-400/40",
      valueColor: "text-emerald-700 dark:text-emerald-300",
      card: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-50/40 border-emerald-300/50 dark:from-emerald-950/60 dark:via-green-950/30 dark:to-emerald-950/20 dark:border-emerald-700/30",
      accentLine: "from-emerald-400 to-teal-500",
    },
    {
      label: "Pending",
      value: assignedPending,
      description: "Awaiting payment",
      icon: CalendarClock,
      iconGradient: "from-sky-400 to-blue-600",
      iconShadow: "shadow-sky-400/40",
      valueColor: "text-sky-700 dark:text-sky-300",
      card: "bg-gradient-to-br from-sky-50 via-blue-50/80 to-sky-50/40 border-sky-300/50 dark:from-sky-950/60 dark:via-blue-950/30 dark:to-sky-950/20 dark:border-sky-700/30",
      accentLine: "from-sky-400 to-blue-600",
    },
    {
      label: "My Vehicles",
      value: myVehicles.length,
      description: "Fleet under your name",
      icon: CarFrontIcon,
      iconGradient: "from-violet-500 to-purple-600",
      iconShadow: "shadow-violet-400/40",
      valueColor: "text-violet-700 dark:text-violet-300",
      card: "bg-gradient-to-br from-violet-50 via-purple-50/80 to-violet-50/40 border-violet-300/50 dark:from-violet-950/60 dark:via-purple-950/30 dark:to-violet-950/20 dark:border-violet-700/30",
      accentLine: "from-violet-500 to-purple-600",
    },
  ];

  const quickActions = [
    {
      label: "Assigned Bookings",
      href: "/dashboard/bookings",
      icon: TicketIcon,
      description: "Trips for your fleet",
      iconGradient: "from-amber-400 to-orange-500",
      iconShadow: "shadow-amber-400/40",
      hoverBorder: "hover:border-amber-300/60 dark:hover:border-amber-700/40",
      hoverBg: "hover:bg-amber-50/80 dark:hover:bg-amber-950/30",
    },
    {
      label: "Live Tracking",
      href: "/dashboard/tracking",
      icon: MapPinIcon,
      description: "Share your location",
      iconGradient: "from-emerald-400 to-teal-500",
      iconShadow: "shadow-emerald-400/40",
      hoverBorder: "hover:border-emerald-300/60 dark:hover:border-emerald-700/40",
      hoverBg: "hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
    },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: BellIcon,
      description: unreadNotifications
        ? `${unreadNotifications} unread`
        : "All caught up",
      iconGradient: "from-rose-400 to-pink-600",
      iconShadow: "shadow-rose-400/40",
      hoverBorder: "hover:border-rose-300/60 dark:hover:border-rose-700/40",
      hoverBg: "hover:bg-rose-50/80 dark:hover:bg-rose-950/30",
    },
    {
      label: "Account",
      href: "/dashboard/account",
      icon: UserCogIcon,
      description: "Profile & security",
      iconGradient: "from-sky-400 to-blue-600",
      iconShadow: "shadow-sky-400/40",
      hoverBorder: "hover:border-sky-300/60 dark:hover:border-sky-700/40",
      hoverBg: "hover:bg-sky-50/80 dark:hover:bg-sky-950/30",
    },
  ];

  const statusStyle: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  return (
    <>
      <SiteHeader title="Driver Hub" subtitle="Trips, fleet & route at a glance" />
      <div className="flex flex-col gap-5 p-4 md:gap-6 md:p-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-6 text-white shadow-2xl shadow-emerald-950/40 md:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-teal-600/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-2xl" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
                {label}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                  {greeting}, {firstName} 👋
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Here&apos;s today&apos;s rundown for your trips and fleet.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/bookings"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <TicketIcon className="size-3.5" />
                  View assignments
                </Link>
                <Link
                  href="/dashboard/tracking"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition-colors hover:bg-white/5"
                >
                  <MapPinIcon className="size-3.5" />
                  Go live
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                {
                  label: "New Today",
                  value: String(assignedToday),
                  icon: CalendarClock,
                  color: "text-cyan-300",
                  bg: "bg-cyan-500/15 border-cyan-400/20",
                },
                {
                  label: "Confirmed",
                  value: String(assignedPaid),
                  icon: CalendarCheck2,
                  color: "text-emerald-300",
                  bg: "bg-emerald-500/15 border-emerald-400/20",
                },
                {
                  label: "Cancelled",
                  value: String(assignedCancelled),
                  icon: XCircleIcon,
                  color: "text-rose-300",
                  bg: "bg-rose-500/15 border-rose-400/20",
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

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((cfg) => {
            const Icon = cfg.icon;
            return (
              <div
                key={cfg.label}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cfg.card}`}
              >
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-80 ${cfg.accentLine}`} />
                <div className="relative flex items-start justify-between">
                  <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${cfg.iconGradient} ${cfg.iconShadow}`}>
                    <Icon className="size-5 text-white drop-shadow" />
                  </div>
                </div>
                <div className="relative mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    {cfg.label}
                  </p>
                  <p className={`mt-1 text-4xl font-black tabular-nums tracking-tight ${cfg.valueColor}`}>
                    {cfg.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{cfg.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS + RECENT ASSIGNMENTS */}
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30">
                  <ZapIcon className="size-3.5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Tools you use on the road</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
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

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-400/30">
                  <RouteIcon className="size-3.5 text-white" />
                </div>
                Recent Assignments
              </CardTitle>
              <CardDescription>Latest bookings linked to your fleet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAssigned.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                  <MapIcon className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No assignments yet. Sit tight!
                  </p>
                </div>
              ) : (
                recentAssigned.map((b) => (
                  <Link
                    key={b.id}
                    href={`/dashboard/bookings`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-3.5 py-2.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{b.tourName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.customerName} · {b.duration} · {b.currency.toUpperCase()} {b.amount.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        statusStyle[b.status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.status}
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* MY FLEET */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-400/30">
                <CarFrontIcon className="size-3.5 text-white" />
              </div>
              My Fleet
            </CardTitle>
            <CardDescription>
              {myVehicles.length > 0
                ? `${myVehicles.length} vehicle${myVehicles.length === 1 ? "" : "s"} · covering ${coveredTours} tour${coveredTours === 1 ? "" : "s"}`
                : "No vehicle assigned yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myVehicles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                <CarFrontIcon className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Contact admin to get a vehicle assigned to you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/10 p-3"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-400/30">
                      <CarFrontIcon className="size-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {v.make} {v.model}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {v.year} · {v.licensePlate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HIGHLIGHTS + ACCOUNT */}
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="overflow-hidden border-emerald-900/60 bg-gradient-to-br from-emerald-950 via-teal-950/90 to-cyan-950 text-white shadow-xl shadow-emerald-950/30">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-emerald-500/15 blur-2xl" />
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30">
                  <Shield className="size-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">What you can do</CardTitle>
                  <CardDescription className="text-xs text-white/40">
                    Driver permissions
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
                  <span className="inline-block size-1.5 shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
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
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Email address", value: session.user.email },
                { label: "Role", value: label },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 px-4 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/70">
                    {item.label}
                  </p>
                  <p className="mt-1.5 break-all text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
              <Link
                href="/dashboard/account"
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:col-span-2"
              >
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/70">
                    Manage account
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    Update profile, password &amp; preferences
                  </p>
                </div>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
