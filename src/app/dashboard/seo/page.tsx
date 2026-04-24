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
  SparklesIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
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
    accent: string;
  };
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colorClasses.card}`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-25 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: colorClasses.glow }}
      />
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${colorClasses.accent}`}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={`flex size-10 items-center justify-center rounded-xl shadow-sm ${colorClasses.iconWrap}`}
        >
          <Icon className={`size-4.5 ${colorClasses.iconColor}`} />
        </div>
      </div>
      <p className="relative mt-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`relative mt-1 text-3xl font-black tabular-nums tracking-tight ${colorClasses.valueColor}`}
      >
        {value}
      </p>
      {sub && (
        <p className="relative mt-1 text-xs text-muted-foreground/80">{sub}</p>
      )}
    </div>
  );
}

// ── SEO health score ──────────────────────────────────────────────────────────

function SeoHealthScore({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const tone =
    pct >= 80
      ? {
          text: "text-emerald-300",
          ring: "stroke-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-400/30",
          label: "Strong SEO foundation",
          chip: "text-emerald-300",
        }
      : pct >= 50
        ? {
            text: "text-amber-300",
            ring: "stroke-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-400/30",
            label: "Needs some attention",
            chip: "text-amber-300",
          }
        : {
            text: "text-rose-300",
            ring: "stroke-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-400/30",
            label: "Critical issues found",
            chip: "text-rose-300",
          };
  const circumference = 2 * Math.PI * 30;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0">
        <svg
          className="-rotate-90 drop-shadow-lg"
          viewBox="0 0 72 72"
          fill="none"
        >
          <circle
            cx="36"
            cy="36"
            r="30"
            strokeWidth="6"
            className="stroke-white/8"
          />
          <circle
            cx="36"
            cy="36"
            r="30"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`transition-all duration-700 ${tone.ring}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-2xl font-black leading-none tabular-nums ${tone.text}`}
          >
            {pct}
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
            score
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone.border} ${tone.bg} ${tone.chip}`}
        >
          <span
            className={`inline-block size-1.5 rounded-full ${tone.ring.replace("stroke-", "bg-")}`}
          />
          {tone.label}
        </div>
        <p className="text-sm font-bold text-white">
          {score}/{total}{" "}
          <span className="text-white/50 font-normal">checks passing</span>
        </p>
        <p className="text-xs text-white/40">
          Fix remaining items to boost search visibility.
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

  const tourIds = await db.tourPackage.findMany({
    select: { id: true, updatedAt: true },
  });
  const blogSlugs = await db.blogPost.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });

  const base = seoSettings.siteUrl || "https://tourvibe.com";

  const autoEntries = [
    {
      url: base,
      changeFrequency: "daily" as const,
      priority: 1.0,
      source: "home",
    },
    {
      url: `${base}/tours`,
      changeFrequency: "daily" as const,
      priority: 0.9,
      source: "tours index",
    },
    {
      url: `${base}/blog`,
      changeFrequency: "daily" as const,
      priority: 0.85,
      source: "blog index",
    },
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
    { ok: !!seoSettings.siteTitle, label: "Site title configured" },
    {
      ok:
        seoSettings.description.length >= 50 &&
        seoSettings.description.length <= 160,
      label: "Meta description 50–160 chars",
    },
    { ok: !!seoSettings.ogImage, label: "OG image set for social sharing" },
    { ok: !!seoSettings.siteUrl, label: "Canonical site URL configured" },
    { ok: seoSettings.enableJsonLd, label: "JSON-LD structured data enabled" },
    {
      ok: !!seoSettings.googleAnalyticsId || !!seoSettings.googleTagManagerId,
      label: "Analytics tracking configured",
    },
    {
      ok: !!seoSettings.googleSiteVerification,
      label: "Google Search Console verified",
    },
    {
      ok: seoSettings.robotsIndex && seoSettings.robotsFollow,
      label: "Site is indexable & followable",
    },
    { ok: !!seoSettings.twitterSite, label: "Twitter/X card handle set" },
  ];

  const passCount = checks.filter((c) => c.ok).length;

  const statCards = [
    {
      icon: FileText,
      label: "Indexable Pages",
      value: indexablePages,
      sub: "in sitemap",
      colorClasses: {
        card: "bg-linear-to-br from-amber-50 to-orange-50/60 border-amber-200/60 dark:from-amber-950/40 dark:to-orange-950/10 dark:border-amber-800/30",
        iconWrap:
          "bg-linear-to-br from-amber-400 to-orange-500 shadow-amber-400/30 dark:shadow-amber-500/20",
        iconColor: "text-white",
        valueColor: "text-amber-700 dark:text-amber-200",
        glow: "#f59e0b",
        accent: "bg-linear-to-r from-amber-400 via-orange-500 to-amber-400",
      },
    },
    {
      icon: Globe,
      label: "Tour Packages",
      value: tourCount,
      sub: "unique meta each",
      colorClasses: {
        card: "bg-linear-to-br from-sky-50 to-blue-50/60 border-sky-200/60 dark:from-sky-950/40 dark:to-blue-950/10 dark:border-sky-800/30",
        iconWrap:
          "bg-linear-to-br from-sky-400 to-blue-600 shadow-sky-400/30 dark:shadow-sky-500/20",
        iconColor: "text-white",
        valueColor: "text-sky-700 dark:text-sky-200",
        glow: "#0ea5e9",
        accent: "bg-linear-to-r from-sky-400 via-blue-500 to-sky-400",
      },
    },
    {
      icon: Map,
      label: "Blog Posts",
      value: blogCount,
      sub: "published articles",
      colorClasses: {
        card: "bg-linear-to-br from-violet-50 to-purple-50/60 border-violet-200/60 dark:from-violet-950/40 dark:to-purple-950/10 dark:border-violet-800/30",
        iconWrap:
          "bg-linear-to-br from-violet-500 to-purple-600 shadow-violet-400/30 dark:shadow-violet-500/20",
        iconColor: "text-white",
        valueColor: "text-violet-700 dark:text-violet-200",
        glow: "#8b5cf6",
        accent: "bg-linear-to-r from-violet-400 via-purple-500 to-violet-400",
      },
    },
    {
      icon: Search,
      label: "Reviews",
      value: reviewCount,
      sub: "power rich snippets",
      colorClasses: {
        card: "bg-linear-to-br from-emerald-50 to-green-50/60 border-emerald-200/60 dark:from-emerald-950/40 dark:to-green-950/10 dark:border-emerald-800/30",
        iconWrap:
          "bg-linear-to-br from-emerald-400 to-teal-500 shadow-emerald-400/30 dark:shadow-emerald-500/20",
        iconColor: "text-white",
        valueColor: "text-emerald-700 dark:text-emerald-200",
        glow: "#10b981",
        accent: "bg-linear-to-r from-emerald-400 via-teal-500 to-emerald-400",
      },
    },
    {
      icon: TrendingUp,
      label: "Vehicles",
      value: vehicleCount,
      sub: "fleet data",
      colorClasses: {
        card: "bg-linear-to-br from-rose-50 to-pink-50/60 border-rose-200/60 dark:from-rose-950/40 dark:to-pink-950/10 dark:border-rose-800/30",
        iconWrap:
          "bg-linear-to-br from-rose-400 to-pink-600 shadow-rose-400/30 dark:shadow-rose-500/20",
        iconColor: "text-white",
        valueColor: "text-rose-700 dark:text-rose-200",
        glow: "#f43f5e",
        accent: "bg-linear-to-r from-rose-400 via-pink-500 to-rose-400",
      },
    },
  ];

  return (
    <>
      <SiteHeader title="SEO Management" subtitle="TourVibe control panel" />

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-6 p-4 md:p-6">
        {/* ── HERO BANNER ── */}
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 text-white shadow-2xl shadow-indigo-950/40 md:p-8">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 size-96 rounded-full bg-sky-500/25 blur-[90px]" />
            <div className="absolute -bottom-20 -left-16 size-80 rounded-full bg-violet-600/25 blur-[80px]" />
            <div className="absolute right-1/4 top-0 size-56 rounded-full bg-emerald-500/15 blur-[60px]" />
            <div className="absolute left-1/3 bottom-0 size-48 rounded-full bg-cyan-500/15 blur-[60px]" />
          </div>

          {/* Dot-grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Shimmer lines */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-400/80 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-4 bg-linear-to-b from-sky-500/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-300 shadow-sm shadow-sky-900/50 backdrop-blur-md">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-sky-400 shadow-sm shadow-sky-400/80" />
                SEO Command Center
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight drop-shadow-[0_2px_12px_rgba(56,189,248,0.35)] md:text-3xl">
                  Search Engine Optimization
                </h2>
                <p className="mt-1 max-w-xl text-sm text-white/45">
                  Manage metadata, sitemap, structured data, and analytics for
                  all public pages.
                </p>
              </div>
            </div>

            {/* Hero score panel */}
            <div className="flex min-w-fit flex-col gap-3 rounded-2xl border border-white/8 bg-white/5 px-5 py-4 shadow-lg shadow-black/40 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-3.5 text-sky-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  SEO Health
                </p>
              </div>
              <SeoHealthScore score={passCount} total={checks.length} />
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid shrink-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── FORM + CHECKLIST COLUMNS ── */}
        <div className="grid shrink-0 gap-6 xl:grid-cols-[1fr_360px]">
          {/* SEO Settings form */}
          <Card className="relative overflow-hidden border-sky-200/40 shadow-sm dark:border-sky-900/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-blue-500 to-sky-400" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-400/30">
                  <Globe className="size-4 text-white" />
                </div>
                SEO Settings
              </CardTitle>
              <CardDescription>
                Changes apply to all public pages. Tour pages also generate
                per-page metadata automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeoForm initialData={seoSettings} />
            </CardContent>
          </Card>

          {/* Sidebar: checklist */}
          <Card className="relative h-fit overflow-hidden border-emerald-200/40 shadow-sm dark:border-emerald-900/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-teal-500 to-emerald-400" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-teal-600 shadow-md shadow-emerald-400/30">
                  <LayoutDashboardIcon className="size-4 text-white" />
                </div>
                SEO Checklist
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <span className="font-bold tabular-nums text-foreground">
                  {passCount}
                </span>
                of
                <span className="font-bold tabular-nums text-foreground">
                  {checks.length}
                </span>
                items complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progress bar with % pill */}
              <div className="relative">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="relative h-full rounded-full bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-500 transition-all duration-700"
                    style={{ width: `${(passCount / checks.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                  </div>
                </div>
                <p className="mt-1.5 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {Math.round((passCount / checks.length) * 100)}% complete
                </p>
              </div>

              {/* Failing items grouped first */}
              {checks.filter((c) => !c.ok).length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    <AlertTriangleIcon className="size-3" />
                    Action Needed ({checks.filter((c) => !c.ok).length})
                  </div>
                  {checks
                    .filter((c) => !c.ok)
                    .map(({ label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/70 px-3 py-2.5 text-sm dark:border-amber-800/40 dark:bg-amber-950/20"
                      >
                        <XCircle className="size-4 shrink-0 text-amber-500" />
                        <span className="text-foreground">{label}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Passing items */}
              {checks.filter((c) => c.ok).length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <ShieldCheckIcon className="size-3" />
                    Passing ({checks.filter((c) => c.ok).length})
                  </div>
                  {checks
                    .filter((c) => c.ok)
                    .map(({ label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2.5 rounded-xl border border-emerald-200/50 bg-emerald-50/40 px-3 py-2.5 text-sm dark:border-emerald-800/30 dark:bg-emerald-950/15"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        <span className="text-foreground/80">{label}</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── SITEMAP MANAGER ── */}
        <Card className="relative shrink-0 overflow-hidden border-violet-200/40 shadow-sm dark:border-violet-900/30">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-400 via-purple-500 to-violet-400" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-400/30">
                <Map className="size-4 text-white" />
              </div>
              Sitemap Manager
            </CardTitle>
            <CardDescription>
              Auto-generated URLs come from your content. Add custom URLs for
              extra pages you want indexed.
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
