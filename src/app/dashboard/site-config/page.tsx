import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getIntegrationsConfig, getSiteConfig } from "./actions";
import { IntegrationsForm } from "./integrations-form";
import { SiteConfigForm } from "./site-config-form";

export default async function SiteConfigPage() {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("Site Config"))
    redirect("/dashboard");

  const [config, integrationsStatus] = await Promise.all([
    getSiteConfig(),
    getIntegrationsConfig(),
    prisma.tourPackage.count(),
    prisma.user.count({ where: { role: "driver" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);

  return (
    <>
      <SiteHeader
        title="Site Config"
        subtitle="Manage public-facing site content"
      />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="shrink-0">
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Edit site name, hero section, about section and contact details
                shown on the marketing pages.
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
                  Cloudinary image hosting and Stripe payment credentials.
                  Stored in the database — no redeploy needed.
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
