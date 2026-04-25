import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireDashboardSession } from "@/lib/dashboard";
import { Vehicle, VehicleTable } from "./vehicle-table";

export default async function VehiclesPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const [rawVehicles, drivers] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: { driver: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      where: { role: "driver" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const vehicles: Vehicle[] = rawVehicles.map((v) => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    driverName: v.driver?.name ?? null,
    driverEmail: v.driver?.email ?? null,
  }));

  return (
    <>
      <SiteHeader title="Vehicle Management" subtitle="Admin only route" />
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Fleet Directory</h2>
            <p className="text-muted-foreground">
              Overview of all registered vehicles in the system.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Vehicle
            </Link>
          </Button>
        </div>

        <Card className="shadow-xs">
          <CardContent className="p-0">
            <div className="p-6">
               <VehicleTable vehicles={vehicles} drivers={drivers} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
