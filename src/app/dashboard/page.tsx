import {
  BadgeCheck,
  BusFront,
  Shield,
  Star,
  MapIcon,
  TicketIcon,
  UsersIcon,
  CarFrontIcon,
  ArrowRightIcon,
  ZapIcon,
  BookOpenIcon,
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverviewPage() {
  const { session, label, highlights } = await requireDashboardSession();

  const [tourCount, vehicleCount, driverCount, userCount, avgRatingResult] =
    await Promise.all([
      prisma.tourPackage.count(),
      prisma.vehicle.count(),
      prisma.user.count({ where: { role: "driver" } }),
      prisma.user.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

  const stats = {
    tourCount,
    vehicleCount,
    driverCount,
    userCount,
    avgRating: avgRatingResult._avg.rating ?? 0,
  };

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SiteHeader title="Operations Dashboard" subtitle="TourVibe control panel" />

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-5 p-4 md:gap-6 md:p-6">
          {/* ── HERO BANNER ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 text-white shadow-2xl shadow-indigo-950/40 md:p-8">
            {/* Gradient orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 size-80 rounded-full bg-violet-500/25 blur-3xl" />
              <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-indigo-600/20 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl" />
              <div className="absolute right-1/4 bottom-0 size-40 rounded-full bg-pink-500/15 blur-2xl" />
            </div>

            {/* Dot-grid overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Top shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left: greeting */}
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

              {/* Right: hero micro-stats */}
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
                    value: String(stats.driverCount),
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

          {/* ── STAT CARDS ── */}
          <SectionCards stats={stats} />

          {/* ── QUICK ACTIONS + ROLE PERMISSIONS ── */}
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">

            {/* Quick Actions */}
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

            {/* Role Permissions */}
            <Card className="overflow-hidden border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-violet-950/90 to-purple-950 text-white shadow-xl shadow-indigo-950/30">
              {/* Subtle top accent */}
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

          {/* ── ACCOUNT SNAPSHOT ── */}
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
            <CardContent className="grid gap-3 sm:grid-cols-3">
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
    </div>
  );
}
