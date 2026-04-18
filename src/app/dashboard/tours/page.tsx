import { redirect } from "next/navigation";
import { Map, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";

export default async function ToursPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <>
      <SiteHeader title="Tour Management" subtitle="Admin only route" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Create New Tour Package</CardTitle>
              <CardDescription>
                Define new destinations and itineraries for tourists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                <Map className="mx-auto mb-3 size-8 opacity-20" />
                Tour package creation form placeholder.
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                Active Packages
              </CardTitle>
              <CardDescription>
                List of all published tour packages available for booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                No tour packages created yet.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
