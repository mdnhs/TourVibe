import { redirect } from "next/navigation";
import { BadgeCheck, Users } from "lucide-react";

import { CreateDriverForm } from "@/components/dashboard/create-driver-form";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export default async function DriversPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const driverAccounts = db
    .prepare(
      "SELECT id, name, email, createdAt FROM user WHERE role = ? ORDER BY createdAt DESC",
    )
    .all("driver") as Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;

  return (
    <>
      <SiteHeader title="Driver Management" subtitle="Admin only route" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <CreateDriverForm />

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-cyan-600 dark:text-cyan-400" />
                Driver Directory
              </CardTitle>
              <CardDescription>
                Accounts below were created internally by super admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {driverAccounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  No drivers created yet.
                </div>
              ) : (
                driverAccounts.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                      <Users className="size-4" />
                      Created {new Date(driver.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
