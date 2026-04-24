import { redirect } from "next/navigation";
import { BusFront, Star, MapIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";
import { getSiteConfig, getIntegrationsConfig } from "./actions";
import { SiteConfigForm } from "./site-config-form";
import { IntegrationsForm } from "./integrations-form";
import { prisma } from "@/lib/prisma";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function SiteConfigPage() {
  const { isSuperAdmin, allowedMenus, session, label } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("Site Config")) redirect("/dashboard");

  const [config, integrationsStatus, tourCount, driverCount, avgRatingResult] = await Promise.all([
    getSiteConfig(),
    getIntegrationsConfig(),
    prisma.tourPackage.count(),
    prisma.user.count({ where: { role: "driver" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);

  const stats = {
    tourCount,
    driverCount,
    avgRating: avgRatingResult._avg.rating ?? 0,
  };

  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.name;

  return (
    <>
      <SiteHeader title="Site Config" subtitle="Manage public-facing site content" />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-6 p-4 md:p-6">
        
        {/* ── HERO BANNER ── */}
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 text-white shadow-2xl shadow-indigo-950/40 md:p-8">
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

        <div className="grid gap-6 max-w-3xl">
          <Card className="shrink-0">
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Edit site name, hero section, about section and contact details shown on the marketing pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SiteConfigForm config={config} />
            </CardContent>
          </Card>

          {integrationsStatus && (
            <Card className="shrink-0">
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Cloudinary image hosting and Stripe payment credentials. Stored in the database — no redeploy needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegrationsForm values={integrationsStatus} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
