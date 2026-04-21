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

export default async function SeoPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const seoSettings = await getSeoSettings();

  return (
    <>
      <SiteHeader title="SEO Management" subtitle="Optimize your site for search engines" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Global SEO Settings</CardTitle>
            <CardDescription>
              These settings control the default meta tags for your site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeoForm initialData={seoSettings} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
