import { redirect } from "next/navigation";
import {
  FileText,
  Globe,
  Search,
  TrendingUp,
  Map,
  CheckCircle2,
  XCircle,
  LayoutDashboardIcon,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SeoForm } from "./seo-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";
import { getSeoSettings, getSitemapCustomEntries } from "./actions";
import { SitemapEditor } from "./sitemap-editor";
import { db } from "@/lib/db";

// ── Colored stat card (server component) ─────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  colorClasses,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colorClasses: {
    card: string;
    iconWrap: string;
    iconColor: string;
    valueColor: string;
    glow: string;
  };
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colorClasses.card}`}
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full opacity-20 blur-2xl"
        style={{ background: colorClasses.glow }}
      />
      <div className={`mb-3 flex size-9 items-center justify-center rounded-xl ${colorClasses.iconWrap}`}>
        <Icon className={`size-4 ${colorClasses.iconColor}`} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-3xl font-bold tabular-nums tracking-tight ${colorClasses.valueColor}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── SEO health score ──────────────────────────────────────────────────────────

function SeoHealthScore({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const color =
    pct >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : pct >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";
  const ringColor =
    pct >= 80
      ? "stroke-emerald-500"
      : pct >= 50
        ? "stroke-amber-500"
        : "stroke-rose-500";
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-20 shrink-0">
        <svg className="-rotate-90" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" strokeWidth="6" className="stroke-muted" />
          <circle
            cx="32"
            cy="32"
            r="28"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`transition-all duration-700 ${ringColor}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold leading-none ${color}`}>{pct}%</span>
        </div>
      </div>
      <div>
        <p className="font-semibold">{score}/{total} checks pass</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {pct >= 80
            ? "Strong SEO foundation"
            : pct >= 50
              ? "Needs some attention"
              : "Critical issues found"}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SeoPage() {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();

  if (!isSuperAdmin && !allowedMenus?.includes("SEO")) {
    redirect("/dashboard");
  }

  const seoSettings = await getSeoSettings();
  const sitemapCustomEntries = await getSitemapCustomEntries();

  const tourCount = await db.tourPackage.count();
  const vehicleCount = await db.vehicle.count();
  const reviewCount = await db.review.count();
  const blogCount = await db.blogPost.count({ where: { status: "published" } });

  const tourIds = await db.tourPackage.findMany({ select: { id: true, updatedAt: true } });
  const blogSlugs = await db.blogPost.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });

  const base = seoSettings.siteUrl || "https://tourvibe.com";

  const autoEntries = [
    { url: base,            changeFrequency: "daily"   as const, priority: 1.0,  source: "home" },
    { url: `${base}/tours`, changeFrequency: "daily"   as const, priority: 0.9,  source: "tours index" },
    { url: `${base}/blog`,  changeFrequency: "daily"   as const, priority: 0.85, source: "blog index" },
    ...tourIds.map((t) => ({
      url: `${base}/tours/${t.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      source: "tour",
    })),
    ...blogSlugs.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      source: "blog post",
    })),
  ];

  const indexablePages = 3 + tourCount + blogCount;

  // SEO checklist data
  const checks = [
    { ok: !!seoSettings.siteTitle,                                                              label: "Site title configured" },
    { ok: seoSettings.description.length >= 50 && seoSettings.description.length <= 160,        label: "Meta description 50–160 chars" },
    { ok: !!seoSettings.ogImage,                                                                label: "OG image set for social sharing" },
    { ok: !!seoSettings.siteUrl,                                                                label: "Canonical site URL configured" },
    { ok: seoSettings.enableJsonLd,                                                             label: "JSON-LD structured data enabled" },
    { ok: !!seoSettings.googleAnalyticsId || !!seoSettings.googleTagManagerId,                  label: "Analytics tracking configured" },
    { ok: !!seoSettings.googleSiteVerification,                                                 label: "Google Search Console verified" },
    { ok: seoSettings.robotsIndex && seoSettings.robotsFollow,                                 label: "Site is indexable & followable" },
    { ok: !!seoSettings.twitterSite,                                                            label: "Twitter/X card handle set" },
  ];

  const passCount = checks.filter((c) => c.ok).length;

  const statCards = [
    {
      icon: FileText,
      label: "Indexable Pages",
      value: indexablePages,
      sub: "in sitemap",
      colorClasses: {
        card: "bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-200/60 dark:from-amber-950/50 dark:to-orange-950/20 dark:border-amber-800/30",
        iconWrap: "bg-amber-100 dark:bg-amber-900/50",
        iconColor: "text-amber-600 dark:text-amber-400",
        valueColor: "text-amber-700 dark:text-amber-300",
        glow: "#f59e0b",
      },
    },
    {
      icon: Globe,
      label: "Tour Packages",
      value: tourCount,
      sub: "unique meta each",
      colorClasses: {
        card: "bg-gradient-to-br from-sky-50 to-blue-50/60 border-sky-200/60 dark:from-sky-950/50 dark:to-blue-950/20 dark:border-sky-800/30",
        iconWrap: "bg-sky-100 dark:bg-sky-900/50",
        iconColor: "text-sky-600 dark:text-sky-400",
        valueColor: "text-sky-700 dark:text-sky-300",
        glow: "#0ea5e9",
      },
    },
    {
      icon: Map,
      label: "Blog Posts",
      value: blogCount,
      sub: "published articles",
      colorClasses: {
        card: "bg-gradient-to-br from-violet-50 to-purple-50/60 border-violet-200/60 dark:from-violet-950/50 dark:to-purple-950/20 dark:border-violet-800/30",
        iconWrap: "bg-violet-100 dark:bg-violet-900/50",
        iconColor: "text-violet-600 dark:text-violet-400",
        valueColor: "text-violet-700 dark:text-violet-300",
        glow: "#8b5cf6",
      },
    },
    {
      icon: Search,
      label: "Reviews",
      value: reviewCount,
      sub: "power rich snippets",
      colorClasses: {
        card: "bg-gradient-to-br from-emerald-50 to-green-50/60 border-emerald-200/60 dark:from-emerald-950/50 dark:to-green-950/20 dark:border-emerald-800/30",
        iconWrap: "bg-emerald-100 dark:bg-emerald-900/50",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-700 dark:text-emerald-300",
        glow: "#10b981",
      },
    },
    {
      icon: TrendingUp,
      label: "Vehicles",
      value: vehicleCount,
      sub: "fleet data",
      colorClasses: {
        card: "bg-gradient-to-br from-rose-50 to-pink-50/60 border-rose-200/60 dark:from-rose-950/50 dark:to-pink-950/20 dark:border-rose-800/30",
        iconWrap: "bg-rose-100 dark:bg-rose-900/50",
        iconColor: "text-rose-600 dark:text-rose-400",
        valueColor: "text-rose-700 dark:text-rose-300",
        glow: "#f43f5e",
      },
    },
  ];

  return (
    <>
      <SiteHeader title="SEO Management" subtitle="TourVibe control panel" />

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl md:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 size-80 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-violet-600/15 blur-3xl" />
            <div className="absolute right-1/4 top-0 size-40 rounded-full bg-emerald-400/10 blur-2xl" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                <Search className="size-3" />
                SEO Command Center
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Search Engine Optimization
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Manage metadata, sitemap, structured data, and analytics for all public pages.
                </p>
              </div>
            </div>

            {/* Hero score panel */}
            <div className="flex min-w-fit flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                SEO Health
              </p>
              <SeoHealthScore score={passCount} total={checks.length} />
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── FORM + CHECKLIST COLUMNS ── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

          {/* SEO Settings form */}
          <Card className="shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-6 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-950/60">
                  <Globe className="size-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                SEO Settings
              </CardTitle>
              <CardDescription>
                Changes apply to all public pages. Tour pages also generate per-page metadata automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeoForm initialData={seoSettings} />
            </CardContent>
          </Card>

          {/* Sidebar: checklist */}
          <Card className="h-fit shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950/60">
                  <LayoutDashboardIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                SEO Checklist
              </CardTitle>
              <CardDescription>
                {passCount} of {checks.length} items complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Mini progress bar */}
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                  style={{ width: `${(passCount / checks.length) * 100}%` }}
                />
              </div>

              {checks.map(({ ok, label }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    ok
                      ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20"
                      : "border-border/50 bg-muted/20"
                  }`}
                >
                  {ok ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={ok ? "text-foreground" : "text-muted-foreground"}>
                    {label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── SITEMAP MANAGER ── */}
        <Card className="shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-950/60">
                <Map className="size-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              Sitemap Manager
            </CardTitle>
            <CardDescription>
              Auto-generated URLs come from your content. Add custom URLs for extra pages you want indexed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SitemapEditor
              autoEntries={autoEntries}
              customEntries={sitemapCustomEntries}
              siteUrl={base}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
