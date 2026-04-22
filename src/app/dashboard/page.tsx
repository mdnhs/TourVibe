import { BadgeCheck, BusFront, Shield, Star } from "lucide-react";

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

export default async function DashboardOverviewPage() {
  const { session, label, highlights } = await requireDashboardSession();

  const [tourCount, vehicleCount, driverCount, userCount, avgRatingResult] = await Promise.all([
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

  return (
    <>
      <SiteHeader title="Operations Dashboard" subtitle="TourVibe control panel" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="text-3xl">Welcome, {session.user.name}</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7">
                TourVibe uses routed dashboard pages now, so the sidebar can collapse to
                icons and track the active page correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {[
                {
                  title: "Current role",
                  value: label,
                  icon: Shield,
                },
                {
                  title: "Active drivers",
                  value: String(stats.driverCount),
                  icon: BusFront,
                },
                {
                  title: "Guest rating",
                  value: `${stats.avgRating.toFixed(1)}/5`,
                  icon: Star,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-muted/30 p-4"
                  >
                    <Icon className="mb-3 size-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-slate-950 text-white shadow-xs border-white/10">
            <CardHeader>
              <CardTitle>Role permissions</CardTitle>
              <CardDescription className="text-white/60">
                This panel reflects the active Better Auth RBAC profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <SectionCards stats={stats} />

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="size-5 text-cyan-600 dark:text-cyan-400" />
              Account snapshot
            </CardTitle>
            <CardDescription>
              Useful for testing access and seeded roles locally.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 font-medium text-foreground">{session.user.email}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="mt-1 break-all font-medium text-foreground">
                {session.user.id}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Role key</p>
              <p className="mt-1 font-medium text-foreground">{session.user.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
