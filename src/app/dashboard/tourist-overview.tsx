import {
  ArrowRightIcon,
  BadgeCheck,
  BellIcon,
  CalendarCheck2,
  CalendarClock,
  CompassIcon,
  HeartIcon,
  MapIcon,
  Shield,
  Star,
  StarIcon,
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

interface TouristOverviewProps {
  session: DashboardSessionData["session"];
  label: string;
  highlights: string[];
}

export async function TouristOverview({
  session,
  label,
  highlights,
}: TouristOverviewProps) {
  const userId = session.user.id;

  const [
    totalBookings,
    paidBookings,
    pendingBookings,
    cancelledBookings,
    reviewsCount,
    myAvgResult,
    unreadNotifications,
    recentBookingsRaw,
  ] = await Promise.all([
    prisma.booking.count({ where: { userId } }),
    prisma.booking.count({ where: { userId, status: "paid" } }),
    prisma.booking.count({ where: { userId, status: "pending" } }),
    prisma.booking.count({ where: { userId, status: "cancelled" } }),
    prisma.review.count({ where: { userId } }),
    prisma.review.aggregate({
      where: { userId },
      _avg: { rating: true },
    }),
    prisma.notification.count({
      where: {
        OR: [{ targetUserId: null }, { targetUserId: userId }],
        reads: { none: { userId } },
      },
    }),
    prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        tourPackage: { select: { name: true, slug: true, duration: true } },
      },
    }),
  ]);

  const myAvgRating = myAvgResult._avg.rating ?? 0;

  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.name;

  const recentBookings = recentBookingsRaw.map((b) => ({
    id: b.id,
    name: b.tourPackage.name,
    slug: b.tourPackage.slug,
    duration: b.tourPackage.duration,
    status: b.status,
    amount: Number(b.amount),
    currency: b.currency,
    createdAt: b.createdAt.toISOString(),
  }));

  const statCards = [
    {
      label: "My Bookings",
      value: totalBookings,
      description: "All reservations made",
      icon: TicketIcon,
      iconGradient: "from-amber-400 to-orange-500",
      iconShadow: "shadow-amber-400/40",
      valueColor: "text-amber-700 dark:text-amber-300",
      card: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50/40 border-amber-300/50 dark:from-amber-950/60 dark:via-orange-950/30 dark:to-amber-950/20 dark:border-amber-700/30",
      accentLine: "from-amber-400 to-orange-500",
    },
    {
      label: "Confirmed Trips",
      value: paidBookings,
      description: "Paid and ready to roll",
      icon: CalendarCheck2,
      iconGradient: "from-emerald-400 to-teal-500",
      iconShadow: "shadow-emerald-400/40",
      valueColor: "text-emerald-700 dark:text-emerald-300",
      card: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-50/40 border-emerald-300/50 dark:from-emerald-950/60 dark:via-green-950/30 dark:to-emerald-950/20 dark:border-emerald-700/30",
      accentLine: "from-emerald-400 to-teal-500",
    },
    {
      label: "Awaiting Payment",
      value: pendingBookings,
      description: "Pending checkout",
      icon: CalendarClock,
      iconGradient: "from-sky-400 to-blue-600",
      iconShadow: "shadow-sky-400/40",
      valueColor: "text-sky-700 dark:text-sky-300",
      card: "bg-gradient-to-br from-sky-50 via-blue-50/80 to-sky-50/40 border-sky-300/50 dark:from-sky-950/60 dark:via-blue-950/30 dark:to-sky-950/20 dark:border-sky-700/30",
      accentLine: "from-sky-400 to-blue-600",
    },
    {
      label: "Reviews Left",
      value: reviewsCount,
      description: "Stories you've shared",
      icon: StarIcon,
      iconGradient: "from-violet-500 to-purple-600",
      iconShadow: "shadow-violet-400/40",
      valueColor: "text-violet-700 dark:text-violet-300",
      card: "bg-gradient-to-br from-violet-50 via-purple-50/80 to-violet-50/40 border-violet-300/50 dark:from-violet-950/60 dark:via-purple-950/30 dark:to-violet-950/20 dark:border-violet-700/30",
      accentLine: "from-violet-500 to-purple-600",
    },
  ];

  const quickActions = [
    {
      label: "Browse Tours",
      href: "/tours",
      icon: CompassIcon,
      description: "Discover new adventures",
      iconGradient: "from-sky-400 to-blue-600",
      iconShadow: "shadow-sky-400/40",
      hoverBorder: "hover:border-sky-300/60 dark:hover:border-sky-700/40",
      hoverBg: "hover:bg-sky-50/80 dark:hover:bg-sky-950/30",
    },
    {
      label: "My Bookings",
      href: "/dashboard/bookings",
      icon: TicketIcon,
      description: "Trips & invoices",
      iconGradient: "from-amber-400 to-orange-500",
      iconShadow: "shadow-amber-400/40",
      hoverBorder: "hover:border-amber-300/60 dark:hover:border-amber-700/40",
      hoverBg: "hover:bg-amber-50/80 dark:hover:bg-amber-950/30",
    },
    {
      label: "My Reviews",
      href: "/dashboard/reviews",
      icon: StarIcon,
      description: "Share your experience",
      iconGradient: "from-violet-500 to-purple-600",
      iconShadow: "shadow-violet-400/40",
      hoverBorder: "hover:border-violet-300/60 dark:hover:border-violet-700/40",
      hoverBg: "hover:bg-violet-50/80 dark:hover:bg-violet-950/30",
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
      iconGradient: "from-emerald-400 to-teal-500",
      iconShadow: "shadow-emerald-400/40",
      hoverBorder: "hover:border-emerald-300/60 dark:hover:border-emerald-700/40",
      hoverBg: "hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
    },
  ];

  const statusStyle: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  return (
    <>
      <SiteHeader title="My Travel Hub" subtitle="Your TourVibe trips at a glance" />
      <div className="flex flex-col gap-5 p-4 md:gap-6 md:p-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 text-white shadow-2xl shadow-indigo-950/40 md:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl" />
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
                  Where to next? Track your trips, payments and reviews here.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <CompassIcon className="size-3.5" />
                  Browse tours
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition-colors hover:bg-white/5"
                >
                  <TicketIcon className="size-3.5" />
                  My bookings
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                {
                  label: "My Rating",
                  value: reviewsCount > 0 ? `${myAvgRating.toFixed(1)} / 5` : "—",
                  icon: Star,
                  color: "text-amber-300",
                  bg: "bg-amber-500/15 border-amber-400/20",
                },
                {
                  label: "Trips Booked",
                  value: String(totalBookings),
                  icon: TicketIcon,
                  color: "text-emerald-300",
                  bg: "bg-emerald-500/15 border-emerald-400/20",
                },
                {
                  label: "Cancelled",
                  value: String(cancelledBookings),
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

        {/* PERSONAL STAT CARDS */}
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

        {/* QUICK ACTIONS + RECENT BOOKINGS */}
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30">
                  <ZapIcon className="size-3.5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Jump to the things you use most</CardDescription>
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

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-400/30">
                  <MapIcon className="size-3.5 text-white" />
                </div>
                Recent Bookings
              </CardTitle>
              <CardDescription>Your latest trips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                  <HeartIcon className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No bookings yet. Start exploring tours!
                  </p>
                  <Link
                    href="/tours"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Browse tours <ArrowRightIcon className="size-3" />
                  </Link>
                </div>
              ) : (
                recentBookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/dashboard/bookings`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-3.5 py-2.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.duration} · {b.currency.toUpperCase()} {b.amount.toFixed(2)}
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

        {/* WHAT YOU CAN DO + ACCOUNT */}
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="overflow-hidden border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-violet-950/90 to-purple-950 text-white shadow-xl shadow-indigo-950/30">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-violet-500/15 blur-2xl" />
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
                  <Shield className="size-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">What you can do</CardTitle>
                  <CardDescription className="text-xs text-white/40">
                    Your traveler perks
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
                  No perks listed
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
                { label: "Email address", value: session.user.email, mono: false },
                { label: "Member since", value: session.user.id ? "Active member" : "—", mono: false },
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
