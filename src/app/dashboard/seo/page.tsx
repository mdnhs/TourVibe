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
import { getSeoSettings } from "./actions";
import { db } from "@/lib/db";
import {
  FileText,
  Globe,
  Search,
  TrendingUp,
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
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const seoSettings = await getSeoSettings();

  const tourCount = (db.prepare("SELECT COUNT(*) as c FROM tour_package").get() as { c: number }).c;
  const vehicleCount = (db.prepare("SELECT COUNT(*) as c FROM vehicle").get() as { c: number }).c;
  const reviewCount = (db.prepare("SELECT COUNT(*) as c FROM review").get() as { c: number }).c;

  // Estimate: tours page + home + each tour detail page
  const indexablePages = 2 + tourCount;

  return (
    <>
      <SiteHeader title="SEO Management" subtitle="Manage all SEO settings dynamically" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl">
          <StatCard icon={FileText} label="Indexable Pages" value={indexablePages} sub="home + tours + listings" />
          <StatCard icon={Globe} label="Tour Packages" value={tourCount} sub="each generates unique meta" />
          <StatCard icon={Search} label="Reviews" value={reviewCount} sub="power rich snippets" />
          <StatCard icon={TrendingUp} label="Vehicles" value={vehicleCount} sub="fleet structured data" />
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
