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
      iconBg: "bg-amber-100 dark:bg-amber-950/60",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Tours",
      href: "/dashboard/tours",
      icon: MapIcon,
      description: "Tour packages",
      iconBg: "bg-sky-100 dark:bg-sky-950/60",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Drivers",
      href: "/dashboard/drivers",
      icon: BusFront,
      description: "Driver management",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Vehicles",
      href: "/dashboard/vehicles",
      icon: CarFrontIcon,
      description: "Fleet overview",
      iconBg: "bg-violet-100 dark:bg-violet-950/60",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: UsersIcon,
      description: "User accounts",
      iconBg: "bg-rose-100 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Blog",
      href: "/dashboard/blog",
      icon: BookOpenIcon,
      description: "Content management",
      iconBg: "bg-orange-100 dark:bg-orange-950/60",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <>
      <SiteHeader title="Operations Dashboard" subtitle="TourVibe control panel" />

      <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl md:p-8">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 size-80 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-orange-600/15 blur-3xl" />
            <div className="absolute left-1/2 top-0 size-40 -translate-x-1/2 rounded-full bg-amber-400/10 blur-2xl" />
          </div>

          {/* Dot-grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: greeting */}
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-amber-400" />
                {label}
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {greeting}, {firstName} 👋
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Here&apos;s an overview of your TourVibe operations today.
                </p>
              </div>
            </div>

            {/* Right: hero micro-stats */}
            <div className="flex flex-wrap gap-4">
              {[
                {
                  label: "Avg Rating",
                  value: `${stats.avgRating.toFixed(1)} / 5`,
                  icon: Star,
                  color: "text-amber-400",
                },
                {
                  label: "Active Drivers",
                  value: String(stats.driverCount),
                  icon: BusFront,
                  color: "text-emerald-400",
                },
                {
                  label: "Tour Packages",
                  value: String(stats.tourCount),
                  icon: MapIcon,
                  color: "text-sky-400",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex min-w-[90px] flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`size-3.5 ${item.color}`} />
                      <span className="text-lg font-bold tabular-nums">{item.value}</span>
                    </div>
                    <p className="text-xs text-white/45">{item.label}</p>
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
          <Card className="shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/60">
                  <ZapIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
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
                    className="group flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 transition-all duration-200 hover:border-border hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}
                    >
                      <Icon className={`size-4 ${action.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card className="border-white/10 bg-slate-950 text-white shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 ring-1 ring-amber-500/20">
                  <Shield className="size-4 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Role Permissions</CardTitle>
                  <CardDescription className="text-xs text-white/45">
                    Active Better Auth RBAC profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.07]"
                >
                  <span className="inline-block size-1.5 shrink-0 rounded-full bg-amber-400" />
                  {item}
                </div>
              ))}
              {highlights.length === 0 && (
                <p className="py-4 text-center text-sm text-white/30">
                  No permissions assigned
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── ACCOUNT SNAPSHOT ── */}
        <Card className="shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-6 items-center justify-center rounded-md bg-cyan-100 dark:bg-cyan-950/60">
                <BadgeCheck className="size-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              Account Snapshot
            </CardTitle>
            <CardDescription>Active session identity — useful for local testing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Email address", value: session.user.email, mono: false },
              { label: "User ID", value: session.user.id, mono: true },
              { label: "Role key", value: session.user.role ?? "—", mono: false },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={`mt-1.5 break-all font-medium text-foreground ${
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
    </>
  );
}
