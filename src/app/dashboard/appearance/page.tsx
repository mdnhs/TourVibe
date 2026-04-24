import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AppearanceForm } from "./appearance-form";
import { requireDashboardSession } from "@/lib/dashboard";
import { getThemeConfig } from "./actions";

export default async function AppearancePage() {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) redirect("/dashboard");

  const config = await getThemeConfig();

  return (
    <>
      <SiteHeader title="Appearance" subtitle="Customize website theme" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <AppearanceForm config={config} />
      </div>
    </>
  );
}
