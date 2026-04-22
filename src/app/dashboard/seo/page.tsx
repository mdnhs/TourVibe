import { redirect } from "next/navigation";
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
import {
  FileText,
  Globe,
  Search,
  TrendingUp,
  Map,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

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

  const blogCount = await db.blogPost.count({
    where: { status: "published" },
  });

  const tourIds = await db.tourPackage.findMany({
    select: { id: true, updatedAt: true },
  });

  const blogSlugs = await db.blogPost.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });

  const base = seoSettings.siteUrl || "https://tourvibe.com";

  // Build auto-generated entries list for the editor preview
  const autoEntries = [
    { url: base,             changeFrequency: "daily"   as const, priority: 1.0,  source: "home" },
    { url: `${base}/tours`,  changeFrequency: "daily"   as const, priority: 0.9,  source: "tours index" },
    { url: `${base}/blog`,   changeFrequency: "daily"   as const, priority: 0.85, source: "blog index" },
    ...tourIds.map((t) => ({ url: `${base}/tours/${t.id}`,    changeFrequency: "weekly"  as const, priority: 0.8, source: "tour" })),
    ...blogSlugs.map((p) => ({ url: `${base}/blog/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7, source: "blog post" })),
  ];

  // Estimate: tours page + home + blog + each tour/blog page
  const indexablePages = 3 + tourCount + blogCount;

  return (
    <>
      <SiteHeader title="SEO Management" subtitle="Manage all SEO settings dynamically" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 max-w-5xl">
          <StatCard icon={FileText} label="Indexable Pages" value={indexablePages} sub="in sitemap" />
          <StatCard icon={Globe} label="Tour Packages" value={tourCount} sub="unique meta each" />
          <StatCard icon={Map} label="Blog Posts" value={blogCount} sub="published articles" />
          <StatCard icon={Search} label="Reviews" value={reviewCount} sub="power rich snippets" />
          <StatCard icon={TrendingUp} label="Vehicles" value={vehicleCount} sub="fleet data" />
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>
              Changes apply to all public pages. Tour pages inherit global settings but also
              generate their own per-page metadata automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeoForm initialData={seoSettings} />
          </CardContent>
        </Card>

        {/* Sitemap editor */}
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Sitemap Manager</CardTitle>
            <CardDescription>
              Auto-generated URLs come from your content. Add custom URLs for any extra pages you want indexed.
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

        {/* Checklist */}
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="text-base">SEO Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                { ok: !!seoSettings.siteTitle, label: "Site title configured" },
                { ok: seoSettings.description.length >= 50 && seoSettings.description.length <= 160, label: "Meta description is 50–160 chars" },
                { ok: !!seoSettings.ogImage, label: "OG image set for social sharing" },
                { ok: !!seoSettings.siteUrl, label: "Canonical site URL configured" },
                { ok: seoSettings.enableJsonLd, label: "JSON-LD structured data enabled" },
                { ok: !!seoSettings.googleAnalyticsId || !!seoSettings.googleTagManagerId, label: "Analytics tracking configured" },
                { ok: !!seoSettings.googleSiteVerification, label: "Google Search Console verified" },
                { ok: seoSettings.robotsIndex && seoSettings.robotsFollow, label: "Site is indexable and followable" },
                { ok: !!seoSettings.twitterSite, label: "Twitter/X card handle set" },
              ].map(({ ok, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className={`size-4 rounded-full flex items-center justify-center text-[10px] font-bold ${ok ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {ok ? "✓" : "–"}
                  </span>
                  <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
