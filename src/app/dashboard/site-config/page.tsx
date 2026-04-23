import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";
import { getSiteConfig } from "./actions";
import { SiteConfigForm } from "./site-config-form";

export default async function SiteConfigPage() {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("Site Config")) redirect("/dashboard");

  const config = await getSiteConfig();

  return (
    <>
      <SiteHeader title="Site Config" subtitle="Manage public-facing site content" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
        <Card>
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
      </div>
    </>
  );
}
